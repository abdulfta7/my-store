"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./Register.module.css";
import { useLang } from "@/lib/i18n/LanguageContext";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLang();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || t("registrationFailed"));
        setIsLoading(false);
        return;
      }
      const signInRes = await signIn("credentials", { email, password, redirect: false });
      if (signInRes?.error) {
        setError(t("autoSignInFailed"));
        setIsLoading(false);
      } else {
        window.location.href = "/account";
      }
    } catch {
      setError(t("unexpectedError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`container ${styles.container}`}>
      <div className={styles.authCard}>
        <h1 className={styles.title}>{t("registerTitle")}</h1>
        <p className={styles.subtitle}>{t("registerSubtitle")}</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t("fullNameLabel")}</label>
            <input
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder={t("fullNamePlaceholder")}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t("emailLabel")}</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="user@example.com"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Phone Number</label>
            <input
              type="tel"
              className={styles.input}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="01xxxxxxxxx"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t("passwordLabel")}</label>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={8}
            />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? t("creatingAccount") : t("createAccount")}
          </button>
        </form>

        <div className={styles.footer}>
          <p>{t("alreadyHaveAccount")} <Link href="/login" className={styles.link}>{t("signInLink")}</Link></p>
        </div>
      </div>
    </div>
  );
}
