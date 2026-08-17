"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../login/Login.module.css";
import { useLang } from "@/lib/i18n/LanguageContext";

export default function ForgotPasswordPage() {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || t("unexpectedError"));
      }
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.authCard}>
        <h1 className={styles.title}>{t("forgotPasswordTitle")}</h1>

        {sent ? (
          <>
            <p className={styles.subtitle} style={{ color: "#16a34a", fontWeight: 600 }}>
              {t("forgotPasswordSentTitle")}
            </p>
            <p className={styles.subtitle} style={{ marginTop: "0.5rem" }}>
              {t("forgotPasswordSentDesc")}
            </p>
            <div className={styles.footer}>
              <Link href="/login" className={styles.link}>{t("backToLogin")}</Link>
            </div>
          </>
        ) : (
          <>
            <p className={styles.subtitle}>{t("forgotPasswordSubtitle")}</p>
            {error && <div className={styles.error}>{error}</div>}
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t("emailLabel")}</label>
                <input
                  type="email"
                  required
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? t("sending") : t("sendResetLink")}
              </button>
            </form>
            <div className={styles.footer}>
              <Link href="/login" className={styles.link}>{t("backToLogin")}</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
