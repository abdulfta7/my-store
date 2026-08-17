"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./Login.module.css";
import { useLang } from "@/lib/i18n/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        setError(t("invalidCredentials"));
      } else {
        router.push("/account");
        router.refresh();
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
        <h1 className={styles.title}>{t("loginTitle")}</h1>
        <p className={styles.subtitle}>{t("loginSubtitle")}</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t("emailLabel")}</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@zomatech.com"
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
            />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? t("signingIn") : t("signIn")}
          </button>
        </form>

        <div style={{ textAlign: "end", marginTop: "-0.5rem" }}>
          <Link href="/forgot-password" className={styles.link} style={{ fontSize: "0.875rem" }}>
            {t("forgotPassword")}
          </Link>
        </div>

        <div className={styles.footer}>
          <p>{t("noAccount")} <Link href="/register" className={styles.link}>{t("createOne")}</Link></p>
        </div>
      </div>
    </div>
  );
}
