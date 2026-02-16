import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

const footerLinks = {
  Company: [
    { label: "About Us", to: "/about" },
    { label: "Careers", to: "/careers" },
    { label: "Press", to: "/press" },
    { label: "Contact", to: "/contact" },
  ],
  "Visa Types": [
    { label: "Schengen Visa", to: "/learn" },
    { label: "USA Visa", to: "/learn" },
    { label: "UK Visa", to: "/learn" },
    { label: "Canada Visa", to: "/learn" },
    { label: "Australia Visa", to: "/learn" },
  ],
  Resources: [
    { label: "Knowledge Base", to: "/learn" },
    { label: "Visa Checker", to: "/visa-checker" },
    { label: "Pricing", to: "/pricing" },
    { label: "FAQs", to: "/pricing" },
  ],
  Contact: [
    { label: "support@visapath.co", to: "mailto:support@visapath.co" },
    { label: "+1 (555) 123-4567", to: "tel:+15551234567" },
    { label: "Istanbul, Turkey", to: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider opacity-70">
                {title}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm opacity-80 hover:opacity-100 transition-opacity"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-xs font-bold text-accent-foreground">VP</span>
            </div>
            <span className="font-semibold">VisaPath</span>
          </div>

          <div className="flex items-center gap-2 text-xs opacity-70">
            <Shield size={14} />
            <span>All payments secured by Stripe</span>
          </div>

          <div className="flex items-center gap-4 text-xs opacity-60">
            <Link to="/privacy" className="hover:opacity-100">Privacy Policy</Link>
            <Link to="/terms" className="hover:opacity-100">Terms of Service</Link>
            <Link to="/cookies" className="hover:opacity-100">Cookie Policy</Link>
          </div>
        </div>

        <p className="text-center text-xs opacity-40 mt-8">
          © 2026 VisaPath. All rights reserved. VisaPath is not affiliated with any government entity.
        </p>
      </div>
    </footer>
  );
}
