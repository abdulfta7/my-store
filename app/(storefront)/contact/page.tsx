import styles from "./Contact.module.css";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { ContactForm } from "./ContactForm";

export const metadata = {
  title: "Contact Us | Zoma Tech",
  description: "Get in touch with Zoma Tech — we're here to help with products, orders, and technical support.",
};

const contactDetails = [
  { icon: Phone, title: "Phone & WhatsApp", lines: ["01554473748", "01070217520"] },
  { icon: Mail, title: "Email", lines: ["abdulftahmosalm@gmail.com"] },
  { icon: MapPin, title: "Address", lines: ["Cairo, Egypt"] },
  { icon: Clock, title: "Working Hours", lines: ["Saturday – Thursday", "10:00 AM – 8:00 PM"] },
];

export default function ContactPage() {
  return (
    <div>
      <div className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
          <h1 className={styles.heroTitle}>Contact Us</h1>
          <p className={styles.heroSubtitle}>
            Have a question or need help? Our team is here for you.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: "4rem 0" }}>
        <div className={styles.layout}>
          <div className={styles.infoColumn}>
            <h2 className={styles.infoTitle}>Get in Touch</h2>
            <p className={styles.infoText}>
              Fill in the form and we'll get back to you within one business day.
              Or reach us directly via phone or WhatsApp.
            </p>
            <div className={styles.detailsGrid}>
              {contactDetails.map((d) => (
                <div key={d.title} className={styles.detailCard}>
                  <div className={styles.detailIcon}><d.icon size={20} /></div>
                  <div>
                    <h3 className={styles.detailTitle}>{d.title}</h3>
                    {d.lines.map((l) => (
                      <p key={l} className={styles.detailLine}>{l}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.formColumn}>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
