"use client";

import { useState } from "react";
import { toast } from "sonner";
import styles from "./Contact.module.css";
import { Send } from "lucide-react";

export function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      toast.success("Message sent! We'll get back to you shortly.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className={styles.successBox}>
        <div className={styles.successIcon}>✓</div>
        <h3>Message Received!</h3>
        <p>We'll respond within one business day.</p>
        <button className="btn btn-primary" onClick={() => { setSent(false); setFormData({ name:"",email:"",phone:"",subject:"",message:"" }); }}>
          Send Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Full Name *</label>
          <input type="text" name="name" required className={styles.input} value={formData.name} onChange={handleChange} placeholder="Your name" />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Email *</label>
          <input type="email" name="email" required className={styles.input} value={formData.email} onChange={handleChange} placeholder="your@email.com" />
        </div>
      </div>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Phone</label>
          <input type="tel" name="phone" className={styles.input} value={formData.phone} onChange={handleChange} placeholder="+20 1xx xxx xxxx" />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Subject *</label>
          <select name="subject" required className={styles.input} value={formData.subject} onChange={handleChange}>
            <option value="">Select subject</option>
            <option>Product Inquiry</option>
            <option>Order Support</option>
            <option>Technical Support</option>
            <option>Return / Refund</option>
            <option>Corporate / Bulk Order</option>
            <option>Other</option>
          </select>
        </div>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Message *</label>
        <textarea name="message" required rows={6} className={styles.textarea} value={formData.message} onChange={handleChange} placeholder="How can we help you?" />
      </div>
      <button type="submit" disabled={submitting} className={`btn btn-primary ${styles.submitBtn}`}>
        {submitting ? "Sending…" : <><Send size={16} /> Send Message</>}
      </button>
    </form>
  );
}
