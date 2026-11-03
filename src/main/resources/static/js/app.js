(() => {
    "use strict";

    // Same-origin by default. Point this at e.g. "http://localhost:8080" if the UI is served elsewhere.
    const API_BASE = "";

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    const phrases = [
        "Building secure, scalable backends",
        "Integrating AI into real products",
        "Real-time systems with Spring Boot",
        "Leading teams from idea to delivery"
    ];
    const typedEl = $("#typed");
    if (!reducedMotion) {
        let p = 0, i = phrases[0].length, deleting = true;
        const tick = () => {
            const word = phrases[p];
            i += deleting ? -1 : 1;
            typedEl.textContent = word.slice(0, i);
            let delay = deleting ? 35 : 70;
            if (!deleting && i === word.length) { deleting = true; delay = 2200; }
            else if (deleting && i === 0) { deleting = false; p = (p + 1) % phrases.length; delay = 400; }
            setTimeout(tick, delay);
        };
        setTimeout(tick, 2500);
    }

    // ---------------- Profile photo fallback ----------------
    const photo = $("#profilePhoto");
    const markNoPhoto = () => photo.closest(".about__photo").classList.add("no-photo");
    photo.addEventListener("error", markNoPhoto);
    if (photo.complete && photo.naturalWidth === 0) markNoPhoto();

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

    function reveal(elements) {
        elements.forEach((el, idx) => {
            el.classList.add("reveal");
            el.style.transitionDelay = `${Math.min(idx % 3, 2) * 80}ms`;
            if (revealObserver) revealObserver.observe(el);
            else el.classList.add("is-visible");
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

    function coverHtml(p, idx) {
        // "Rifd: AI Operations Center" -> name "Rifd", tag "AI Operations Center"
        const [name, ...rest] = String(p.title).split(":");
        const tag = rest.join(":").trim() || (p.techStack?.[0] ?? "");
        const [c1, c2] = COVER_COLORS[idx % COVER_COLORS.length];
        const img = safeUrl(p.imageUrl);
        // With an image we show it as a logo on the gradient (colors get re-tinted from the logo
        // in tintCover); a wide, fully opaque image (a screenshot) switches to full-bleed instead.
        return `<div class="cover-gen${img ? " cover-gen--logo" : ""}" style="--c1:${c1};--c2:${c2}">
                    ${img
                        ? `<img class="cover-gen__logo" src="${esc(img)}" alt="${esc(name.trim())} logo" loading="lazy">`
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

    function renderProjects(projects) {
        const grid = $("#projectsGrid");
        if (!projects.length) {
            grid.innerHTML = `<p class="empty">No projects yet.</p>`;
            return;
        }
        // Featured first, then newest (API already sorts by date)
        const sorted = [...projects].sort((a, b) => Number(b.featured) - Number(a.featured));
        grid.innerHTML = sorted.map((p, idx) => {
            const src = safeUrl(p.sourceCodeUrl);
            const demo = safeUrl(p.liveDemoUrl);
            return `
            <article class="project">
                <div class="project__cover">
                    ${p.featured ? `<span class="badge">Featured</span>` : ""}
                    ${coverHtml(p, idx)}
                </div>
                <div class="project__body">
                    <h3>${esc(p.title)}</h3>
                    <p class="project__desc">${esc(p.description)}</p>
                    <button class="more" type="button" hidden>Read more</button>
                    ${p.techStack?.length ? `<ul class="tags">${p.techStack.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
                    ${src || demo ? `<div class="project__links">
                        ${src ? `<a href="${esc(src)}" target="_blank" rel="noopener noreferrer">${ICON_GITHUB}Source Code</a>` : ""}
                        ${demo ? `<a href="${esc(demo)}" target="_blank" rel="noopener noreferrer">${ICON_EXTERNAL}Live Demo</a>` : ""}
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
                    btn.textContent = expanded ? "Show less" : "Read more";
                });
            }
        });
        reveal($$(".project", grid));
    }

    async function loadProjects() {
        try {
            renderProjects(await getJson("/api/projects"));
        } catch (err) {
            console.error("Failed to load projects", err);
            $("#projectsGrid").innerHTML = `<p class="empty">Couldn't load projects right now.</p>`;
        }
    }

    // ---------------- Tech stack ----------------
    const STACK_COLORS = ["#818cf8", "#34d399", "#c084fc", "#fbbf24", "#22d3ee", "#f472b6", "#f87171", "#a3e635"];

    async function loadSkills() {
        const grid = $("#skillsGrid");
        try {
            const skills = await getJson("/api/skills");
            if (!skills.length) {
                grid.innerHTML = `<p class="empty">No skills added yet.</p>`;
                return;
            }
            const groups = new Map();
            skills.forEach((s) => {
                if (!groups.has(s.category)) groups.set(s.category, []);
                groups.get(s.category).push(s);
            });
            grid.innerHTML = [...groups.entries()].map(([category, items], idx) => `
                <article class="stack-card" style="--c:${STACK_COLORS[idx % STACK_COLORS.length]}">
                    <div class="stack-card__head"><h3>${esc(category)}</h3><span>${items.length}</span></div>
                    <ul class="chips">${items.map((s) => `<li>${esc(s.name)}</li>`).join("")}</ul>
                </article>`).join("");
            reveal($$(".stack-card", grid));
        } catch (err) {
            console.error("Failed to load skills", err);
            grid.innerHTML = `<p class="empty">Couldn't load skills right now.</p>`;
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
        if (!data.senderName) errors.senderName = "Name is required";
        if (!data.senderEmail) errors.senderEmail = "Email is required";
        else if (!EMAIL_RE.test(data.senderEmail)) errors.senderEmail = "Email must be valid";
        if (!data.message) errors.message = "Message is required";
        return errors;
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
            setStatus("Please fix the highlighted fields.", "error");
            return;
        }

        submitBtn.disabled = true;
        submitLabel.textContent = "Sending…";
        setStatus("");

        try {
            const res = await fetch(API_BASE + "/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify(payload)
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) {
                showErrors(body.fieldErrors);
                setStatus(body.message || "Something went wrong. Please try again.", "error");
                return;
            }
            form.reset();
            showErrors();
            setStatus(body.detail || "Message sent. Thank you!", "success");
        } catch (err) {
            console.error("Contact submit failed", err);
            setStatus("Network error. Please check your connection and try again.", "error");
        } finally {
            submitBtn.disabled = false;
            submitLabel.textContent = "Send Message";
        }
    });

    // ---------------- Init ----------------
    loadProjects();
    loadSkills();
})();
