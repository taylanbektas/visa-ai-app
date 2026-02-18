import { Link } from "react-router-dom";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  const footerLinks = [
    {
      title: t("footer.quickLinks"),
      links: [
        { label: t("nav.home"), to: "/" },
        { label: t("nav.learn"), to: "/learn" },
        { label: t("nav.pricing"), to: "/pricing" },
        { label: t("nav.track"), to: "/track" },
        { label: t("nav.faq"), to: "/#sss" },
      ],
    },
    {
      title: t("footer.support"),
      links: [
        { label: t("nav.contact"), to: "/contact" },
        { label: t("footer.joinAdvisor"), to: "/join-advisor" },
        { label: t("nav.whatsapp"), to: "https://wa.me/905XXXXXXXXX", external: true },
        { label: t("footer.helpCenter"), to: "/learn" },
        { label: t("footer.videoGuides"), to: "/learn" },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        { label: t("footer.privacy"), to: "/privacy" },
        { label: t("footer.terms"), to: "/terms" },
        { label: t("footer.cookies"), to: "/privacy#cookies" },
        { label: t("footer.refund"), to: "/terms#refund" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-white">
      <div className="container mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="grid gap-10 md:grid-cols-4 md:gap-12">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">✈️</span>
              <span className="text-xl font-extrabold tracking-tight">
                <span className="text-navy-dark">Visa</span>
                <span className="text-gradient-mint">Path</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              {t("footer.tagline")}
            </p>

            <div className="mb-5 grid grid-cols-3 gap-2">
              <a
                href="https://wa.me/905XXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-border px-2 py-2 text-xs font-semibold text-foreground/80 transition-colors hover:bg-secondary"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
              <a
                href="tel:+905555555555"
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-border px-2 py-2 text-xs font-semibold text-foreground/80 transition-colors hover:bg-secondary"
              >
                <Phone size={14} /> Ara
              </a>
              <a
                href="mailto:info@visapath.com.tr"
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-border px-2 py-2 text-xs font-semibold text-foreground/80 transition-colors hover:bg-secondary"
              >
                <Mail size={14} /> E-posta
              </a>
            </div>

            <div className="text-sm text-muted-foreground space-y-1.5 mb-5">
              <p>📍 İstanbul, Türkiye</p>
              <p>📧 info@visapath.com.tr</p>
              <p>📞 +90 (555) 555 55 55</p>
            </div>

            <div className="flex gap-3">
              <a
                href="https://instagram.com/visapath"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-[#E1306C] hover:bg-pink-50 transition-colors"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="https://wa.me/905XXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-[#25D366] hover:bg-green-50 transition-colors"
                aria-label="WhatsApp"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-3">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h4 className="mb-4 text-sm font-bold text-foreground">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          href={link.to}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground transition-colors hover:text-[#00D69E]"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          to={link.to}
                          className="text-sm text-muted-foreground transition-colors hover:text-[#00D69E]"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border mt-10 md:mt-12 pt-6 text-center">
          <p className="text-xs leading-relaxed text-muted-foreground">
            © 2026 VisaPath. {t("footer.rights")} VisaPath bir vize danışmanlık hizmetidir ve resmi konsolosluk temsilcisi değildir.
          </p>
        </div>
      </div>
    </footer>
  );
}
