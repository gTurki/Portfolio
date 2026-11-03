/*
 * Minimal i18n for the portfolio.
 *
 * English lives in index.html itself (good for SEO and no-JS visitors). On startup we capture each
 * translatable element's English content, so switching back to English needs no English dictionary.
 * Arabic strings live below. Markup hooks:
 *   data-i18n="key"                -> textContent
 *   data-i18n-html="key"           -> innerHTML (only our own trusted strings)
 *   data-i18n-attr="attr:key;..."  -> attributes (placeholder, aria-label, alt, content)
 */
(function () {
    "use strict";

    const AR = {
        "meta.title": "تركي الغامدي | مهندس برمجيات",
        "meta.description": "معرض أعمال تركي الغامدي، مهندس برمجيات ومطوّر واجهات خلفية بـ Java وSpring Boot في الرياض.",

        "nav.home": "الرئيسية",
        "nav.about": "نبذة عني",
        "nav.projects": "المشاريع",
        "nav.skills": "المهارات التقنية",
        "nav.certs": "الشهادات",
        "nav.contact": "تواصل معي",
        "nav.menu": "فتح القائمة",

        "hero.kicker": "مرحبًا، أنا",
        "hero.name": "تركي الغامدي",
        "hero.bio": "مهندس برمجيات متخصص في Java وSpring Boot. أبني واجهات REST API آمنة وأنظمة تعمل في الوقت الفعلي وواجهات خلفية مدمجة بالذكاء الاصطناعي، وأقود الفرق من جمع المتطلبات حتى التسليم الفعلي.",
        "hero.work": "استعرض أعمالي",
        "hero.contact": "تواصل معي",
        "hero.scroll": "انتقل إلى نبذة عني",

        "about.eyebrow": "نبذة عني",
        "about.title": 'من المتطلبات إلى <span class="grad">التسليم</span>',
        "about.p1": "تخرّجت في هندسة البرمجيات من جامعة الملك فهد للبترول والمعادن، وأركّز على منظومة Java: ‏Spring Boot وSpring Security وJPA/Hibernate وMySQL. أطلقت منتجات بـ Spring Boot تتكامل مع OpenAI وGemini وخرائط Google وGmail SMTP وبوت تيليجرام وواتساب.",
        "about.p2": "في معسكر Java والذكاء الاصطناعي المكثّف (300 ساعة) من أكاديمية طويق ومؤسسة مسك، انتقلت من واجهات CRUD البسيطة إلى أنظمة بمستوى الإنتاج تشمل أمان JWT وWebSockets والتحكم في التزامن وبدائل الذكاء الاصطناعي والنشر عبر Docker، وقدت مشروعين متكاملين بصفتي قائد الفريق.",
        "about.stat1.value": "الثالث",
        "about.stat1.label": "هاكاثون إكسبو 2030 الرياض",
        "about.stat2.label": "مشاريع Spring Boot API",
        "about.stat3.value": "300",
        "about.stat3.label": "ساعة في معسكر Java والذكاء الاصطناعي",
        "about.talk": "لنتحدث",
        "about.cv": "تحميل السيرة الذاتية",

        "projects.eyebrow": "معرض الأعمال",
        "projects.title": 'مشاريع <span class="grad">مميزة</span>',
        "projects.sub": "منتجات صمّمتها وقدتها وبنيتها من البداية إلى النهاية",

        "skills.eyebrow": "المهارات والخبرات",
        "skills.title": 'مهاراتي <span class="grad">التقنية</span>',
        "skills.sub": "التقنيات والأدوات التي أستخدمها لتحويل الأفكار إلى واقع",

        "certs.eyebrow": "المؤهلات",
        "certs.title": 'التدريب <span class="grad">والشهادات</span>',
        "certs.sub": "معسكرات واعتمادات وشهادات تدعم مهاراتي العملية",
        "certs.oct2026": "أكتوبر 2026",
        "certs.c1.title": "تطوير الويب باستخدام Java ودمج تقنيات الذكاء الاصطناعي",
        "certs.c1.meta": "<span>أكاديمية طويق ومؤسسة مسك</span> · 300 ساعة",
        "certs.c2.title": "الاعتماد المهني: مهندس برمجيات",
        "certs.c2.meta": "<span>الهيئة السعودية للمهندسين</span>",
        "certs.c3.title": "محترف أعمال معتمد في إدارة المشاريع (CBP-PM)",
        "certs.c4.title": "شهادة سيسكو المعتمدة CCNA في التوجيه والتحويل",
        "certs.c5.title": "التدريب الصيفي في هندسة البرمجيات",
        "certs.c5.meta": "<span>شركة الأسمنت المتحدة الصناعية</span> · 200 ساعة",
        "certs.c6.title": "المركز الثالث: هاكاثون إكسبو 2030 الرياض",
        "certs.c6.meta": "<span>أكاديمية طويق ومؤسسة مسك</span> · قائد الفريق",

        "contact.eyebrow": "تواصل",
        "contact.title": 'تواصل <span class="grad">معي</span>',
        "contact.sub": "لديك فرصة عمل أو مشروع، أو تودّ إلقاء التحية؟ يسعدني تواصلك.",

        "form.name": "الاسم",
        "form.name.ph": "اسمك",
        "form.email": "البريد الإلكتروني",
        "form.subject": "الموضوع",
        "form.subject.ph": "عن ماذا تريد التحدث؟",
        "form.message": "الرسالة",
        "form.message.ph": "اكتب رسالتك...",
        "form.send": "إرسال الرسالة",

        "footer.email": "البريد"
    };

    /** Strings used from JavaScript (dynamic content, form feedback). */
    const MESSAGES = {
        en: {
            typed: [
                "Building secure, scalable backends",
                "Integrating AI into real products",
                "Real-time systems with Spring Boot",
                "Leading teams from idea to delivery"
            ],
            featured: "Featured",
            readMore: "Read more",
            showLess: "Show less",
            sourceCode: "Source Code",
            liveDemo: "Live Demo",
            noProjects: "No projects yet.",
            noFeatured: "No featured projects yet.",
            projectsError: "Couldn't load projects right now.",
            noSkills: "No skills added yet.",
            skillsError: "Couldn't load skills right now.",
            sending: "Sending…",
            send: "Send Message",
            nameRequired: "Name is required",
            emailRequired: "Email is required",
            emailInvalid: "Email must be valid",
            messageRequired: "Message is required",
            fixFields: "Please fix the highlighted fields.",
            success: "Thanks for reaching out! I'll get back to you soon.",
            genericError: "Something went wrong. Please try again.",
            networkError: "Network error. Please check your connection and try again.",
            rateLimited: (min) => `You've sent several messages in a short time. Please wait about ${min} ${min === 1 ? "minute" : "minutes"} and try again.`,
            fieldInvalid: {},
            switchTo: "Switch to Arabic",
            logoAlt: (name) => `${name} logo`,
            coverAlt: (name) => `${name} cover`
        },
        ar: {
            typed: [
                "أبني واجهات خلفية آمنة وقابلة للتوسع",
                "أدمج الذكاء الاصطناعي في منتجات حقيقية",
                "أنظمة فورية باستخدام Spring Boot",
                "أقود الفرق من الفكرة إلى التسليم"
            ],
            featured: "مميز",
            readMore: "اقرأ المزيد",
            showLess: "عرض أقل",
            sourceCode: "الكود المصدري",
            liveDemo: "عرض مباشر",
            noProjects: "لا توجد مشاريع بعد.",
            noFeatured: "لا توجد مشاريع مميزة بعد.",
            projectsError: "تعذّر تحميل المشاريع حاليًا.",
            noSkills: "لا توجد مهارات بعد.",
            skillsError: "تعذّر تحميل المهارات حاليًا.",
            sending: "جارٍ الإرسال…",
            send: "إرسال الرسالة",
            nameRequired: "الاسم مطلوب",
            emailRequired: "البريد الإلكتروني مطلوب",
            emailInvalid: "يرجى إدخال بريد إلكتروني صحيح",
            messageRequired: "الرسالة مطلوبة",
            fixFields: "يرجى تصحيح الحقول المظللة.",
            success: "شكرًا لتواصلك! سأرد عليك قريبًا.",
            genericError: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
            networkError: "خطأ في الاتصال. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.",
            rateLimited: (min) => `أرسلت عدة رسائل خلال وقت قصير. يرجى الانتظار ${arabicMinutes(min)} ثم المحاولة مجددًا.`,
            // Server validation messages are English; show Arabic per field instead
            fieldInvalid: {
                senderName: "يرجى التحقق من الاسم",
                senderEmail: "يرجى إدخال بريد إلكتروني صحيح",
                subject: "الموضوع طويل جدًا",
                message: "يرجى التحقق من الرسالة"
            },
            switchTo: "التبديل إلى الإنجليزية",
            logoAlt: (name) => `شعار ${name}`,
            coverAlt: (name) => `صورة ${name}`
        }
    };

    /** Arabic number agreement for "minutes". */
    function arabicMinutes(n) {
        if (n === 1) return "دقيقة واحدة";
        if (n === 2) return "دقيقتين";
        if (n >= 3 && n <= 10) return `${n} دقائق`;
        return `${n} دقيقة`;
    }

    const original = new Map(); // element -> {text, html, attrs}
    const listeners = [];
    let current = "en";

    function capture() {
        document.querySelectorAll("[data-i18n],[data-i18n-html],[data-i18n-attr]").forEach((el) => {
            const entry = { attrs: {} };
            if (el.hasAttribute("data-i18n")) entry.text = el.textContent;
            if (el.hasAttribute("data-i18n-html")) entry.html = el.innerHTML;
            parseAttrs(el).forEach(([attr]) => { entry.attrs[attr] = el.getAttribute(attr); });
            original.set(el, entry);
        });
    }

    function parseAttrs(el) {
        const spec = el.getAttribute("data-i18n-attr");
        if (!spec) return [];
        return spec.split(";").map((pair) => pair.split(":").map((s) => s.trim())).filter((p) => p.length === 2);
    }

    function apply(lang) {
        const ar = lang === "ar";
        original.forEach((entry, el) => {
            if (el.hasAttribute("data-i18n")) {
                const key = el.getAttribute("data-i18n");
                el.textContent = ar && AR[key] != null ? AR[key] : entry.text;
            }
            if (el.hasAttribute("data-i18n-html")) {
                const key = el.getAttribute("data-i18n-html");
                el.innerHTML = ar && AR[key] != null ? AR[key] : entry.html;
            }
            parseAttrs(el).forEach(([attr, key]) => {
                const value = ar && AR[key] != null ? AR[key] : entry.attrs[attr];
                if (value != null) el.setAttribute(attr, value);
            });
        });
    }

    function setLang(lang, { persist = true } = {}) {
        current = lang === "ar" ? "ar" : "en";
        const root = document.documentElement;
        root.lang = current;
        root.dir = current === "ar" ? "rtl" : "ltr";
        apply(current);
        if (persist) {
            try { localStorage.setItem("lang", current); } catch (e) { /* private mode etc. */ }
        }
        listeners.forEach((fn) => fn(current));
    }

    function initialLang() {
        let lang = null;
        try { lang = new URLSearchParams(location.search).get("lang"); } catch (e) { /* ignore */ }
        if (!lang) {
            try { lang = localStorage.getItem("lang"); } catch (e) { /* ignore */ }
        }
        return lang === "ar" ? "ar" : "en"; // English is the default
    }

    window.I18N = {
        init() {
            capture();
            setLang(initialLang(), { persist: false });
        },
        get lang() { return current; },
        set: setLang,
        toggle() { setLang(current === "ar" ? "en" : "ar"); },
        t(key) { return MESSAGES[current][key]; },
        onChange(fn) { listeners.push(fn); }
    };
})();
