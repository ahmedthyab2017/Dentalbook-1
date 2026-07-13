import type { Lang } from "@/types/session";
import { L } from "@/lib/i18n";

export type ConsentType = "ortho" | "implant" | "extraction" | "anesthesia" | "general";

export function consentTemplates(lang: Lang): Record<ConsentType, { title: string; text: string }> {
  return {
    ortho: {
      title: L("تعهّد علاج التقويم", "Orthodontic Consent", lang),
      text: L(
        "أقرّ أنا الموقّع أدناه بأنني فهمت طبيعة علاج تقويم الأسنان ومدّته المتوقّعة، وأن النتيجة تعتمد على التزامي بالمواعيد والتعليمات والعناية بنظافة الفم.",
        "I confirm I understand the nature and expected duration of orthodontic treatment, and that results depend on my compliance with appointments, instructions and oral hygiene.",
        lang
      ),
    },
    implant: {
      title: L("تعهّد زراعة الأسنان", "Dental Implant Consent", lang),
      text: L(
        "أقرّ بأنني فهمت إجراء زراعة الأسنان ومراحله ومدّته الزمنية، والبدائل العلاجية المتاحة، والمضاعفات المحتملة.",
        "I confirm I understand the dental implant procedure, its stages and timeline, the available alternatives, and possible complications.",
        lang
      ),
    },
    extraction: {
      title: L("تعهّد قلع الأسنان", "Extraction Consent", lang),
      text: L(
        "أوافق على إجراء قلع السن/الأسنان بعد أن شُرحت لي البدائل والمضاعفات المحتملة.",
        "I consent to extraction after being informed of alternatives and possible complications.",
        lang
      ),
    },
    anesthesia: {
      title: L("تعهّد التخدير الموضعي", "Local Anesthesia Consent", lang),
      text: L(
        "أوافق على استخدام التخدير الموضعي، وقد أبلغت الطبيب بحالتي الصحية وأدويتي وأي حساسية لديّ.",
        "I consent to local anesthesia and have informed the dentist of my medical status, medications and any allergies.",
        lang
      ),
    },
    general: {
      title: L("تعهّد علاجي عام", "General Treatment Consent", lang),
      text: L(
        "أوافق على تلقّي العلاج السنّي الموصوف بعد أن شُرحت لي طبيعته وبدائله ومضاعفاته المحتملة.",
        "I consent to the prescribed dental treatment after being informed of its nature, alternatives and possible complications.",
        lang
      ),
    },
  };
}
