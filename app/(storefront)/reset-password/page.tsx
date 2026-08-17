"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../login/Login.module.css";
import { useLang } from "@/lib/i18n/LanguageContext";

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLang();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className={styles.authCard}>
        <div className={styles.error}>{t("invalidToken")}</div>
        <div className={styles.footer}>
          <Link href="/forgot-password" className={styles.link}>{t("requestNewLink")}</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError(t("passwordTooShort")); return; }
    if (password !== confirm) { setError(t("passwordsMismatch")); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || t("unexpectedError"));
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.authCard} style={{ textAlign: "center" }}>
        <p style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>✓</p>
        <h2 className={styles.title}>{t("passwordUpdated")}</h2>
        <p className={styles.subtitle}>{t("passwordUpdatedDesc")}</p>
      </div>
    );
  }

  return (
    <div className={styles.authCard}>
      <h1 className={styles.title}>{t("resetPasswordTitle")}</h1>
      <p className={styles.subtitle}>{t("resetPasswordSubtitle")}</p>
      {error && <div className={styles.error}>{error}</div>}
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>{t("newPassword")}</label>
          <input type="password" required minLength={8} className={styles.input}
            value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder={t("newPasswordPlaceholder")} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>{t("confirmPassword")}</label>
          <input type="password" required minLength={8} className={styles.input}
            value={confirm} onChange={(e) => setConfirm(e.target.value)}
            placeholder={t("confirmPasswordPlaceholder")} />
        </div>
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? t("saving") : t("setNewPassword")}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  const { t } = useLang();
  return (
    <div className={styles.container}>
      <Suspense fallback={<div className={styles.authCard}><p className={styles.subtitle}>{t("loading")}</p></div>}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
