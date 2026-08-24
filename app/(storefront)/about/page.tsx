import styles from "./About.module.css";
import { Shield, Award, Headphones, Truck } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "About Us | Zoma Tech",
  description:
    "Learn about Zoma Tech — Egypt's trusted destination for computers, laptops, monitors, and technology solutions.",
};

const stats = [
  { value: "5+", label: "Years of Experience" },
  { value: "10,000+", label: "Happy Customers" },
  { value: "500+", label: "Products Available" },
  { value: "50+", label: "Brands Offered" },
];

const values = [
  {
    icon: Shield,
    title: "Authenticity Guaranteed",
    description:
      "Every product we sell is 100% genuine, sourced directly from authorized distributors and brand manufacturers.",
  },
  {
    icon: Award,
    title: "Premium Quality",
    description:
      "We carefully vet every product before listing it. If it doesn't meet our standards, it doesn't make the cut.",
  },
  {
    icon: Headphones,
    title: "Expert Support",
    description:
      "Our tech-savvy team is available to help you choose the right product and support you after your purchase.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description:
      "We deliver across Egypt. Cairo and Giza orders typically arrive within 24 hours.",
  },
];

const team = [
  {
    name: "Abdoelfatah Mosalm",
    role: "Founder & CEO",
    initials: "AM",
  },
  {
    name: "Mohamed Mosalm",
    role: "Founder & CEO",
    initials: "MM",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
          <h1 className={styles.heroTitle}>About Zoma Tech</h1>
          <p className={styles.heroSubtitle}>
            Egypt&apos;s trusted destination for computers, laptops, monitors,
            and complete technology solutions — since 2019.
          </p>
          <Link href="/shop" className={`btn btn-primary ${styles.heroBtn}`}>
            Browse Our Products
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsSection}>
        <div className="container">
          <div className={styles.statsGrid}>
            {stats.map((stat) => (
              <div key={stat.label} className={styles.statCard}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story */}
      <div className="container" style={{ padding: "5rem 0" }}>
        <div className={styles.storyGrid}>
          <div>
            <h2 className={styles.sectionTitle}>Our Story</h2>
            <p className={styles.storyText}>
              Zoma Tech was founded in 2019 with a simple mission: make
              top-quality technology accessible to everyone in Egypt at fair,
              transparent prices. We started as a small shop in Cairo and have
              grown into one of Egypt&apos;s leading online tech retailers.
            </p>
            <p className={styles.storyText}>
              We specialize in laptops, desktop PCs, monitors, POS systems,
              active panels, projectors, and accessories — everything a
              business or individual needs to stay productive in a digital
              world.
            </p>
            <p className={styles.storyText}>
              Whether you&apos;re setting up a home office, equipping a
              corporate fleet, or building a gaming rig, our team is here to
              guide you every step of the way.
            </p>
          </div>
          <div className={styles.storyImagePlaceholder}>
            <span>🏢</span>
            <p>Zoma Tech HQ — Cairo, Egypt</p>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className={styles.valuesSection}>
        <div className="container">
          <h2 className={styles.sectionTitle} style={{ textAlign: "center", marginBottom: "3rem" }}>
            Why Choose Us
          </h2>
          <div className={styles.valuesGrid}>
            {values.map((v) => (
              <div key={v.title} className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <v.icon size={28} />
                </div>
                <h3 className={styles.valueTitle}>{v.title}</h3>
                <p className={styles.valueText}>{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="container" style={{ padding: "5rem 0" }}>
        <h2 className={styles.sectionTitle} style={{ textAlign: "center", marginBottom: "3rem" }}>
          Meet the Team
        </h2>
        <div className={styles.teamGrid}>
          {team.map((member) => (
            <div key={member.name} className={styles.teamCard}>
              <div className={styles.teamAvatar}>{member.initials}</div>
              <h3 className={styles.teamName}>{member.name}</h3>
              <p className={styles.teamRole}>{member.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className={styles.ctaSection}>
        <div className="container">
          <h2 className={styles.ctaTitle}>Ready to find your next device?</h2>
          <p className={styles.ctaText}>
            Browse our full catalog or get in touch — we&apos;d love to help.
          </p>
          <div className={styles.ctaActions}>
            <Link href="/shop" className="btn btn-primary">
              Shop Now
            </Link>
            <Link href="/contact" className="btn btn-outline">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
