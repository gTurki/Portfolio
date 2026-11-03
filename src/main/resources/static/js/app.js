(() => {
    "use strict";

    // Same-origin by default. Point this at e.g. "http://localhost:8080" if the UI is served elsewhere.
    const API_BASE = "";

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = (key) => I18N.t(key);
    const isAr = () => I18N.lang === "ar";

    /** Escape untrusted text before inserting into HTML. */
    const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);

    /** Only allow http(s) or same-origin relative links from the API. */
    const safeUrl = (url) => {
        if (!url) return null;
        try {
            const u = new URL(url, window.location.origin);
            return u.protocol === "http:" || u.protocol === "https:" ? u.href : null;
        } catch {
            return null;
        }
    };

    async function getJson(path) {
        const res = await fetch(API_BASE + path, { headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
    }

    // ---------------- Language ----------------
    I18N.init();

    const langBtn = $("#langToggle");
    const langFlag = $("#langFlag");
    const langLabel = $("#langLabel");

    function updateLangButton(lang) {
        // The button offers the *other* language
        if (lang === "ar") {
            langFlag.src = "img/flags/gb.svg";
            langLabel.textContent = "English";
            langLabel.lang = "en";
        } else {
            langFlag.src = "img/flags/sa.svg";
            langLabel.textContent = "العربية";
            langLabel.lang = "ar";
        }
        langBtn.setAttribute("aria-label", t("switchTo"));
    }
    updateLangButton(I18N.lang);
    langBtn.addEventListener("click", () => I18N.toggle());

    // ---------------- Nav ----------------
    const nav = $("#nav");
    const navToggle = $("#navToggle");
    const navLinks = $("#navLinks");

    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    navToggle.addEventListener("click", () => {
        const open = navLinks.classList.toggle("is-open");
        navToggle.setAttribute("aria-expanded", String(open));
    });
    $$("a", navLinks).forEach((a) => a.addEventListener("click", () => {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
    }));

    // Scroll-spy: highlight the nav link of the section in view
    const spyLinks = $$("[data-spy]");
    if ("IntersectionObserver" in window) {
        const spy = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    spyLinks.forEach((l) => l.classList.toggle("is-active", l.dataset.spy === e.target.id));
                }
            });
        }, { rootMargin: "-45% 0px -50% 0px" });
        spyLinks.forEach((l) => {
            const section = document.getElementById(l.dataset.spy);
            if (section) spy.observe(section);
        });
    }

    $("#year").textContent = new Date().getFullYear();

    // ---------------- Typewriter ----------------
    const typedEl = $("#typed");
    let typeTimer = null;

    function startTypewriter() {
        clearTimeout(typeTimer);
        const phrases = t("typed");
        typedEl.textContent = phrases[0];
        if (reducedMotion) return;
        let p = 0, i = phrases[0].length, deleting = true;
        const tick = () => {
            const word = phrases[p];
            i += deleting ? -1 : 1;
            typedEl.textContent = word.slice(0, i);
            let delay = deleting ? 35 : 70;
            if (!deleting && i === word.length) { deleting = true; delay = 2200; }
            else if (deleting && i === 0) { deleting = false; p = (p + 1) % phrases.length; delay = 400; }
            typeTimer = setTimeout(tick, delay);
        };
        typeTimer = setTimeout(tick, 2500);
    }
    startTypewriter();

    // ---------------- Profile photo fallback ----------------
    const photo = $("#profilePhoto");
    const markNoPhoto = () => photo.closest(".hero__photo").classList.add("no-photo");
    photo.addEventListener("error", markNoPhoto);
    if (photo.complete && photo.naturalWidth === 0) markNoPhoto();

    // ---------------- Toast + copy email ----------------
    const toast = $("#toast");
    let toastTimer = null;
    function showToast(text) {
        toast.textContent = text;
        toast.classList.add("is-visible");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
    }

    const copyBtn = $("#copyEmail");
    copyBtn.addEventListener("click", async () => {
        const email = copyBtn.dataset.email;
        try {
            await navigator.clipboard.writeText(email);
            showToast(t("copied"));
        } catch {
            // Clipboard API unavailable (http, old browser, permissions): fall back to a hidden textarea
            const ta = document.createElement("textarea");
            ta.value = email;
            ta.setAttribute("readonly", "");
            ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
            document.body.appendChild(ta);
            ta.select();
            const ok = document.execCommand && document.execCommand("copy");
            ta.remove();
            showToast(t(ok ? "copied" : "copyFailed"));
        }
    });

    // ---------------- Reveal on scroll ----------------
    const revealObserver = "IntersectionObserver" in window && !reducedMotion
        ? new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add("is-visible");
                    revealObserver.unobserve(e.target);
                }
            });
        }, { threshold: 0.12 })
        : null;

    function reveal(elements, { instant = false } = {}) {
        elements.forEach((el, idx) => {
            el.classList.add("reveal");
            if (instant || !revealObserver) {
                el.classList.add("is-visible");
                return;
            }
            el.style.transitionDelay = `${Math.min(idx % 3, 2) * 80}ms`;
            revealObserver.observe(el);
        });
    }
    reveal($$(".reveal"));

    // ---------------- Projects ----------------
    const ICON_GITHUB = `<svg viewBox="0 0 24 24" class="icon-fill"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/></svg>`;
    const ICON_EXTERNAL = `<svg viewBox="0 0 24 24" class="icon-stroke"><path d="M14 4h6v6M10 14 20 4M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>`;
    const COVER_COLORS = [
        ["#4f46e5", "#22d3ee"], ["#7c3aed", "#f472b6"], ["#0891b2", "#34d399"],
        ["#2563eb", "#a78bfa"], ["#db2777", "#f59e0b"], ["#059669", "#3b82f6"]
    ];

    /** Localised view of a project: Arabic fields when available, English otherwise. */
    const projectText = (p) => ({
        title: (isAr() && p.titleAr) || p.title,
        description: (isAr() && p.descriptionAr) || p.description
    });

    function coverHtml(p, idx) {
        // "Rifd: AI Operations Center" -> name "Rifd", tag "AI Operations Center"
        const [name, ...rest] = String(projectText(p).title).split(":");
        const tag = rest.join(":").trim() || (p.techStack?.[0] ?? "");
        const [c1, c2] = COVER_COLORS[idx % COVER_COLORS.length];
        const img = safeUrl(p.imageUrl);
        // With an image we show it as a logo on the gradient (colors get re-tinted from the logo
        // in tintCover); a wide, fully opaque image (a screenshot) switches to full-bleed instead.
        return `<div class="cover-gen${img ? " cover-gen--logo" : ""}" style="--c1:${c1};--c2:${c2}">
                    ${img
                        ? `<img class="cover-gen__logo" src="${esc(img)}" alt="${esc(t("logoAlt")(name.trim()))}" loading="lazy">`
                        : `<span class="cover-gen__name">${esc(name.trim())}</span>`}
                    ${tag ? `<span class="cover-gen__tag">${esc(tag)}</span>` : ""}
                </div>`;
    }

    /** Sample the logo's dominant hues to tint the cover, and detect screenshots. */
    function tintCover(imgEl) {
        const cover = imgEl.closest(".cover-gen");
        try {
            const w = 64, h = Math.max(1, Math.round(64 * imgEl.naturalHeight / imgEl.naturalWidth));
            const canvas = document.createElement("canvas");
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            ctx.drawImage(imgEl, 0, 0, w, h);
            const data = ctx.getImageData(0, 0, w, h).data;

            const corners = [0, (w - 1) * 4, (h - 1) * w * 4, (h * w - 1) * 4];
            const opaque = corners.every((i) => data[i + 3] > 250);
            if (opaque && imgEl.naturalWidth / imgEl.naturalHeight >= 1.5) {
                cover.classList.add("cover-gen--photo");
                return;
            }

            // Hue histogram over saturated, visible pixels (ignores white/black/grey)
            const buckets = new Array(12).fill(0);
            for (let i = 0; i < data.length; i += 4) {
                if (data[i + 3] < 128) continue;
                const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
                const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
                if (d < 0.18 || max < 0.2) continue;
                let hue = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
                hue = (hue * 60 + 360) % 360;
                buckets[Math.floor(hue / 30)]++;
            }
            const ranked = buckets.map((n, i) => [n, i]).filter(([n]) => n > 0).sort((a, b) => b[0] - a[0]);
            if (!ranked.length) return;
            const h1 = ranked[0][1] * 30 + 15;
            const h2 = ranked.length > 1 && ranked[1][0] > ranked[0][0] * 0.15 ? ranked[1][1] * 30 + 15 : h1 + 35;
            cover.style.setProperty("--c1", `hsl(${h1} 70% 45%)`);
            cover.style.setProperty("--c2", `hsl(${h2} 70% 45%)`);
        } catch (err) {
            // Cross-origin image without CORS: keep the default colors.
        }
    }

    let projectsData = null;

    function renderProjects({ instant = false } = {}) {
        const grid = $("#projectsGrid");
        if (!projectsData.length) {
            grid.innerHTML = `<p class="empty">${esc(t("noProjects"))}</p>`;
            return;
        }
        // Featured first, then newest (API already sorts by date)
        const sorted = [...projectsData].sort((a, b) => Number(b.featured) - Number(a.featured));
        grid.innerHTML = sorted.map((p, idx) => {
            const { title, description } = projectText(p);
            const src = safeUrl(p.sourceCodeUrl);
            const demo = safeUrl(p.liveDemoUrl);
            return `
            <article class="project">
                <div class="project__cover">
                    ${p.featured ? `<span class="badge">${esc(t("featured"))}</span>` : ""}
                    ${coverHtml(p, idx)}
                </div>
                <div class="project__body">
                    <h3>${esc(title)}</h3>
                    <p class="project__desc">${esc(description)}</p>
                    <button class="more" type="button" hidden>${esc(t("readMore"))}</button>
                    ${p.techStack?.length ? `<ul class="tags">${p.techStack.map((s) => `<li dir="ltr">${esc(s)}</li>`).join("")}</ul>` : ""}
                    ${src || demo ? `<div class="project__links">
                        ${src ? `<a href="${esc(src)}" target="_blank" rel="noopener noreferrer">${ICON_GITHUB}${esc(t("sourceCode"))}</a>` : ""}
                        ${demo ? `<a href="${esc(demo)}" target="_blank" rel="noopener noreferrer">${ICON_EXTERNAL}${esc(t("liveDemo"))}</a>` : ""}
                    </div>` : ""}
                </div>
            </article>`;
        }).join("");

        $$(".cover-gen__logo", grid).forEach((img) => {
            if (img.complete && img.naturalWidth) tintCover(img);
            else img.addEventListener("load", () => tintCover(img), { once: true });
            img.addEventListener("error", () => img.remove(), { once: true });
        });

        // Show "Read more" only where the description is actually clamped
        $$(".project", grid).forEach((card) => {
            const desc = $(".project__desc", card);
            const btn = $(".more", card);
            if (desc.scrollHeight > desc.clientHeight + 2) {
                btn.hidden = false;
                btn.addEventListener("click", () => {
                    const expanded = card.classList.toggle("is-expanded");
                    btn.textContent = t(expanded ? "showLess" : "readMore");
                });
            }
        });
        reveal($$(".project", grid), { instant });
    }

    async function loadProjects() {
        try {
            projectsData = await getJson("/api/projects");
            renderProjects();
        } catch (err) {
            console.error("Failed to load projects", err);
            $("#projectsGrid").innerHTML = `<p class="empty">${esc(t("projectsError"))}</p>`;
        }
    }

    // ---------------- Tech stack ----------------
    const STACK_COLORS = ["#818cf8", "#34d399", "#c084fc", "#fbbf24", "#22d3ee", "#f472b6", "#f87171", "#a3e635"];
    let skillsData = null;

    function renderSkills({ instant = false } = {}) {
        const grid = $("#skillsGrid");
        if (!skillsData.length) {
            grid.innerHTML = `<p class="empty">${esc(t("noSkills"))}</p>`;
            return;
        }
        // Group by the English category (stable key); show the Arabic label when available
        const groups = new Map();
        skillsData.forEach((s) => {
            if (!groups.has(s.category)) {
                groups.set(s.category, { label: (isAr() && s.categoryAr) || s.category, items: [] });
            }
            groups.get(s.category).items.push(s);
        });
        grid.innerHTML = [...groups.values()].map(({ label, items }, idx) => `
            <article class="stack-card" style="--c:${STACK_COLORS[idx % STACK_COLORS.length]}">
                <div class="stack-card__head"><h3>${esc(label)}</h3><span>${items.length}</span></div>
                <ul class="chips">${items.map((s) => `<li dir="auto">${esc((isAr() && s.nameAr) || s.name)}</li>`).join("")}</ul>
            </article>`).join("");
        reveal($$(".stack-card", grid), { instant });
    }

    async function loadSkills() {
        try {
            skillsData = await getJson("/api/skills");
            renderSkills();
        } catch (err) {
            console.error("Failed to load skills", err);
            $("#skillsGrid").innerHTML = `<p class="empty">${esc(t("skillsError"))}</p>`;
        }
    }

    // ---------------- Contact form ----------------
    const form = $("#contactForm");
    const statusEl = $("#formStatus");
    const submitBtn = $("#contactSubmit");
    const submitLabel = $("span", submitBtn);
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function setStatus(text, type) {
        statusEl.textContent = text;
        statusEl.className = "form__status" + (type ? ` is-${type}` : "");
    }

    function showErrors(errors = {}) {
        $$("[data-error-for]", form).forEach((el) => {
            const msg = errors[el.dataset.errorFor] || "";
            el.textContent = msg;
            el.closest(".field").classList.toggle("has-error", Boolean(msg));
        });
    }

    function validate(data) {
        const errors = {};
        if (!data.senderName) errors.senderName = t("nameRequired");
        if (!data.senderEmail) errors.senderEmail = t("emailRequired");
        else if (!EMAIL_RE.test(data.senderEmail)) errors.senderEmail = t("emailInvalid");
        if (!data.message) errors.message = t("messageRequired");
        return errors;
    }

    /** Server messages are English; in Arabic mode replace them with Arabic equivalents. */
    function serverFieldErrors(fieldErrors = {}) {
        if (!isAr()) return fieldErrors;
        const map = t("fieldInvalid");
        return Object.fromEntries(Object.keys(fieldErrors).map((k) => [k, map[k] || t("genericError")]));
    }

    function serverErrorMessage(res, body) {
        if (res.status === 429) {
            const seconds = Number(res.headers.get("Retry-After")) || 600;
            return t("rateLimited")(Math.max(1, Math.ceil(seconds / 60)));
        }
        if (res.status === 400 && body.fieldErrors && Object.keys(body.fieldErrors).length) {
            return isAr() ? t("fixFields") : (body.message || t("fixFields"));
        }
        return isAr() ? t("genericError") : (body.message || t("genericError"));
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const payload = {
            senderName: fd.get("senderName").trim(),
            senderEmail: fd.get("senderEmail").trim(),
            subject: fd.get("subject").trim() || null,
            message: fd.get("message").trim(),
            website: fd.get("website")
        };

        const clientErrors = validate(payload);
        showErrors(clientErrors);
        if (Object.keys(clientErrors).length) {
            setStatus(t("fixFields"), "error");
            return;
        }

        submitBtn.disabled = true;
        submitLabel.textContent = t("sending");
        setStatus("");

        try {
            const res = await fetch(API_BASE + "/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify(payload)
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) {
                showErrors(serverFieldErrors(body.fieldErrors));
                setStatus(serverErrorMessage(res, body), "error");
                return;
            }
            form.reset();
            showErrors();
            setStatus(isAr() ? t("success") : (body.detail || t("success")), "success");
        } catch (err) {
            console.error("Contact submit failed", err);
            setStatus(t("networkError"), "error");
        } finally {
            submitBtn.disabled = false;
            submitLabel.textContent = t("send");
        }
    });

    // ---------------- Re-render on language change ----------------
    I18N.onChange((lang) => {
        updateLangButton(lang);
        startTypewriter();
        if (projectsData) renderProjects({ instant: true });
        if (skillsData) renderSkills({ instant: true });
        showErrors();
        setStatus("");
    });

    // ---------------- Init ----------------
    loadProjects();
    loadSkills();
})();
