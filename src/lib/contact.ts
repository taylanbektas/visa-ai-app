/**
 * Centralized contact links. Set in .env for production:
 * VITE_WHATSAPP_NUMBER, VITE_PHONE_NUMBER, VITE_CONTACT_EMAIL, VITE_INSTAGRAM_URL
 */

const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "905XXXXXXXXX";
const phoneNumber = import.meta.env.VITE_PHONE_NUMBER || "+905555555555";
const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || "info@visapath.com.tr";
const instagramUrl = import.meta.env.VITE_INSTAGRAM_URL || "https://instagram.com/visapath";

export const contact = {
  whatsappNumber,
  whatsappUrl: `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`,
  phoneNumber,
  telUrl: `tel:${phoneNumber.replace(/\s/g, "")}`,
  contactEmail,
  mailtoUrl: `mailto:${contactEmail}`,
  instagramUrl,
};
