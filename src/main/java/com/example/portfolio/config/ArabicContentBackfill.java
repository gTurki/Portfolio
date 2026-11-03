package com.example.portfolio.config;

import com.example.portfolio.entity.Project;
import com.example.portfolio.entity.Skill;
import com.example.portfolio.repository.ProjectRepository;
import com.example.portfolio.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * Fills in Arabic text for the seeded projects and skills on startup.
 * <p>
 * Runs after {@link DataInitializer} and only sets Arabic fields that are still empty, so it works on
 * databases created before Arabic support existed and never overwrites text edited in DataGrip.
 * Rows it doesn't recognise (projects/skills you add yourself) are left alone; give them Arabic
 * text by filling the *_ar columns.
 */
@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed-sample-data", havingValue = "true", matchIfMissing = true)
public class ArabicContentBackfill implements CommandLineRunner {

    /** English title -> {Arabic title, Arabic description} */
    private static final Map<String, String[]> PROJECTS = Map.of(
            "Atahad: AI Commitment & Accountability App", new String[]{
                    "أتعهّد: تطبيق الالتزام والمساءلة بالذكاء الاصطناعي",
                    "تطبيق عقود التزام يستخدم مبدأ النفور من الخسارة لبناء العادات: يضع المستخدم مبلغًا على أهدافه "
                            + "الأسبوعية، وكل التزام فائت يتحوّل إلى تبرّع لمنصة إحسان. تُفرض المساءلة عبر إثباتات يتحقق "
                            + "منها الذكاء الاصطناعي (تحدّي الصورة، مؤقّت التركيز، الاختبار القصير، النطاق الجغرافي عبر GPS، "
                            + "عدد الخطوات)، وقفل للتطبيق حتى إثبات التبرعات المستحقة، والتزامات جماعية بعقوبات مشتركة. "
                            + "بناه فريق من 4 أعضاء (193 نقطة نهاية)."},
            "Rifd: AI Operations Center for Expo 2030", new String[]{
                    "رِفد: مركز عمليات ذكي لإكسبو 2030",
                    "المركز الثالث في هاكاثون إكسبو 2030 الرياض بصفتي قائدًا لفريق من 5 أعضاء. مركز عمليات يوحّد "
                            + "التنبيهات من 7 مصادر في لوحة متابعة مباشرة، ويختصر دفعة من 40 تنبيهًا إلى 3 حوادث قابلة "
                            + "للتنفيذ. يصنّف الذكاء الاصطناعي درجة الخطورة ويدمج التنبيهات المكررة ويكتشف الحريق والدخان "
                            + "في الصور، مع أتمتة اقتراح خطط الاستجابة وتعيين أقرب موظف والتصعيد. "
                            + "الواجهة الخلفية كاملة: 18 كيانًا و70 نقطة نهاية."},
            "Ejad: AI Lost & Found Platform", new String[]{
                    "إيجاد: منصة المفقودات بالذكاء الاصطناعي",
                    "واجهة خلفية بمحرك مطابقة ذكي يقيس التشابه بين بلاغات المفقودات والموجودات، ويُشعر المالكين "
                            + "تلقائيًا بالتطابقات التي تتجاوز 70% داخل التطبيق وعبر البريد الإلكتروني وواتساب. يتيح الإبلاغ "
                            + "بالصور حيث يستخرج الذكاء الاصطناعي العنوان واللون والعلامة التجارية والفئة من الصورة، مع "
                            + "بحث جغرافي ضمن نطاق محدد. 8 كيانات و103 نقاط نهاية، وقائد الفريق."},
            "Personal Portfolio", new String[]{
                    "الموقع الشخصي",
                    "هذا الموقع: واجهة REST API مبنية بـ Spring Boot ومدعومة بقاعدة بيانات MySQL، تخدم واجهة أمامية "
                            + "متجاوبة مكتوبة بـ JavaScript مع نموذج تواصل يتحقق من المدخلات."}
    );

    private static final Map<String, String> CATEGORIES = Map.of(
            "Languages", "لغات البرمجة",
            "Frameworks & Libraries", "أطر العمل والمكتبات",
            "AI Integration", "تكامل الذكاء الاصطناعي",
            "APIs & Automation", "الواجهات البرمجية والأتمتة",
            "Databases", "قواعد البيانات",
            "DevOps & Tooling", "DevOps والأدوات",
            "Concepts", "المفاهيم والمنهجيات"
    );

    /** Only skills whose name reads better in Arabic; tech names (Java, Docker, ...) stay as they are. */
    private static final Map<String, String> SKILL_NAMES = Map.of(
            "Relational Database Design", "تصميم قواعد البيانات العلائقية",
            "OOP", "البرمجة كائنية التوجه (OOP)",
            "SDLC", "دورة حياة تطوير البرمجيات (SDLC)",
            "Project Management (CBP-PM)", "إدارة المشاريع (CBP-PM)",
            "WhatsApp", "واتساب"
    );

    private final ProjectRepository projectRepository;
    private final SkillRepository skillRepository;

    @Override
    @Transactional
    public void run(String... args) {
        int updated = 0;

        for (Project p : projectRepository.findAll()) {
            String[] ar = PROJECTS.get(p.getTitle());
            if (ar == null) continue;
            if (isBlank(p.getTitleAr())) { p.setTitleAr(ar[0]); updated++; }
            if (isBlank(p.getDescriptionAr())) { p.setDescriptionAr(ar[1]); updated++; }
        }

        for (Skill s : skillRepository.findAll()) {
            String category = CATEGORIES.get(s.getCategory());
            if (category != null && isBlank(s.getCategoryAr())) { s.setCategoryAr(category); updated++; }
            String name = SKILL_NAMES.get(s.getName());
            if (name != null && isBlank(s.getNameAr())) { s.setNameAr(name); updated++; }
        }

        if (updated > 0) {
            log.info("Filled {} missing Arabic fields", updated);
        }
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
