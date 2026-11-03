package com.example.portfolio.notification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.util.HtmlUtils;

import java.net.http.HttpClient;
import java.time.Duration;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/**
 * Emails a notification for every new contact message through Brevo's transactional email API
 * (HTTPS, so it works on hosts that block SMTP, such as Railway).
 * <p>
 * Runs asynchronously after the message is committed, so a slow or failing email never affects
 * the visitor's request. Disabled when BREVO_API_KEY or BREVO_SENDER_EMAIL is not set.
 */
@Slf4j
@Component
public class BrevoEmailNotifier {

    private static final String BREVO_SEND_URL = "https://api.brevo.com/v3/smtp/email";
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm 'UTC'");

    private final RestClient restClient;
    private final String apiKey;
    private final String senderEmail;
    private final String senderName;
    private final String notifyEmail;

    public BrevoEmailNotifier(
            @Value("${app.notify.brevo.api-key:}") String apiKey,
            @Value("${app.notify.brevo.sender-email:}") String senderEmail,
            @Value("${app.notify.brevo.sender-name:Portfolio}") String senderName,
            @Value("${app.notify.to:}") String notifyEmail) {
        this.apiKey = apiKey.trim();
        this.senderEmail = senderEmail.trim();
        this.senderName = senderName.trim();
        this.notifyEmail = notifyEmail.trim();

        HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(Duration.ofSeconds(10));
        this.restClient = RestClient.builder().requestFactory(requestFactory).build();

        if (isEnabled()) {
            log.info("Contact email notifications enabled: sending to {} via Brevo", this.notifyEmail);
        } else {
            log.info("Contact email notifications disabled (set BREVO_API_KEY, BREVO_SENDER_EMAIL and NOTIFY_EMAIL to enable)");
        }
    }

    private boolean isEnabled() {
        return !apiKey.isEmpty() && !senderEmail.isEmpty() && !notifyEmail.isEmpty();
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onContactMessage(ContactMessageReceivedEvent event) {
        if (!isEnabled()) {
            return;
        }
        String subject = "New portfolio message from " + oneLine(event.senderName())
                + (event.subject() != null ? ": " + oneLine(event.subject()) : "");

        Map<String, Object> body = Map.of(
                "sender", Map.of("name", senderName, "email", senderEmail),
                "to", List.of(Map.of("email", notifyEmail)),
                // Hitting "Reply" in Gmail answers the visitor directly
                "replyTo", Map.of("email", event.senderEmail(), "name", oneLine(event.senderName())),
                "subject", truncate(subject, 200),
                "htmlContent", html(event),
                "textContent", text(event)
        );

        try {
            restClient.post()
                    .uri(BREVO_SEND_URL)
                    .header("api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
            log.info("Sent email notification for contact message #{}", event.id());
        } catch (RestClientResponseException ex) {
            log.warn("Brevo rejected notification for message #{}: {} {}",
                    event.id(), ex.getStatusCode(), ex.getResponseBodyAsString());
        } catch (Exception ex) {
            log.warn("Could not send notification for message #{}: {}", event.id(), ex.toString());
        }
    }

    private static String html(ContactMessageReceivedEvent e) {
        String subject = e.subject() == null ? "<em style=\"color:#9ca3af\">(no subject)</em>" : esc(e.subject());
        return """
                <div style="font-family:Inter,Segoe UI,Arial,sans-serif;max-width:600px;margin:auto;color:#111827">
                  <div style="background:linear-gradient(135deg,#4f46e5,#22d3ee);padding:20px 24px;border-radius:12px 12px 0 0">
                    <h2 style="margin:0;color:#fff;font-size:18px">New message from your portfolio</h2>
                  </div>
                  <div style="border:1px solid #e5e7eb;border-top:0;padding:24px;border-radius:0 0 12px 12px">
                    <table style="font-size:14px;border-collapse:collapse;margin-bottom:16px">
                      <tr><td style="color:#6b7280;padding:4px 16px 4px 0">From</td><td><b>%s</b> &lt;<a href="mailto:%s">%s</a>&gt;</td></tr>
                      <tr><td style="color:#6b7280;padding:4px 16px 4px 0">Subject</td><td>%s</td></tr>
                      <tr><td style="color:#6b7280;padding:4px 16px 4px 0">Sent</td><td>%s</td></tr>
                    </table>
                    <div style="white-space:pre-wrap;background:#f9fafb;border-radius:8px;padding:16px;font-size:15px;line-height:1.6">%s</div>
                    <p style="color:#9ca3af;font-size:12px;margin-top:20px">Reply to this email to answer %s directly. Message #%d is saved in contact_messages.</p>
                  </div>
                </div>
                """.formatted(esc(e.senderName()), esc(e.senderEmail()), esc(e.senderEmail()), subject,
                e.sentAt() == null ? "" : e.sentAt().format(TIME_FORMAT), esc(e.message()), esc(e.senderName()), e.id());
    }

    private static String text(ContactMessageReceivedEvent e) {
        return "New message from your portfolio\n\n"
                + "From: " + e.senderName() + " <" + e.senderEmail() + ">\n"
                + "Subject: " + (e.subject() == null ? "(no subject)" : e.subject()) + "\n\n"
                + e.message() + "\n";
    }

    private static String esc(String s) {
        return s == null ? "" : HtmlUtils.htmlEscape(s);
    }

    /** Collapse line breaks so user input can't break the subject line. */
    private static String oneLine(String s) {
        return s == null ? "" : s.replaceAll("[\\r\\n\\t]+", " ").trim();
    }

    private static String truncate(String s, int max) {
        return s.length() <= max ? s : s.substring(0, max - 1) + "…";
    }
}
