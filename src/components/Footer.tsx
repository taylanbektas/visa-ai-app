import { Link } from "react-router-dom";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  const footerLinks = [
    {
      title: t("footer.support"),
      links: [
        { label: t("nav.contact"), to: "/contact" },
        { label: t("nav.whatsapp"), to: "https://wa.me/905XXXXXXXXX", external: true },
        { label: t("footer.videoGuides"), to: "/video-guides" },
      ],
    },
    {
      title: "Kurumsal",
      links: [
        { label: "Danışman Girişi", to: "/staff-login" },
        { label: "Danışman Ol", to: "/join-advisor" },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        { label: t("footer.privacy"), to: "/privacy" },
        { label: t("footer.terms"), to: "/terms" },
        { label: t("footer.cookies"), to: "/cookies" },
        { label: t("footer.refund"), to: "/refund" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-white">
      <div className="container mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16">
          <div className="md:col-span-4 lg:col-span-4">
            <Link to="/" className="flex items-center gap-2 mb-4" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              <span className="text-2xl">✈️</span>
              <span className="text-xl font-extrabold tracking-tight">
                <span className="text-navy-dark">Visa</span>
                <span className="text-gradient-mint">Path</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {t("footer.tagline")}
            </p>

            <div className="flex flex-col gap-3 mb-6">
              <a
                href="https://wa.me/905XXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-green-600 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <MessageCircle size={16} />
                </div>
                WhatsApp Destek
              </a>
              <a
                href="tel:+905555555555"
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-blue-600 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Phone size={16} />
                </div>
                +90 (555) 555 55 55
              </a>
              <a
                href="mailto:info@visapath.com.tr"
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-purple-600 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                  <Mail size={16} />
                </div>
                info@visapath.com.tr
              </a>
            </div>

            <div className="flex gap-3">
              <a
                href="https://instagram.com/visapath"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-[#E1306C] hover:bg-pink-50 transition-all duration-300"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="md:col-span-8 lg:col-span-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              {footerLinks.map((section) => (
                <div key={section.title}>
                  <h4 className="mb-4 text-base font-bold text-navy-dark">{section.title}</h4>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        {link.external ? (
                          <a
                            href={link.to}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground transition-colors hover:text-[#00D69E] hover:underline"
                          >
                            {link.label}
                          </a>
                        ) : (
                          <Link
                            to={link.to}
                            className="text-sm text-muted-foreground transition-colors hover:text-[#00D69E] hover:underline"
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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
