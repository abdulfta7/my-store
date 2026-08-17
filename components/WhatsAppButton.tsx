"use client";

import styles from "./WhatsAppButton.module.css";

export function WhatsAppButton() {
  const phoneNumber = "201554473748";
  const message = encodeURIComponent("Hello Zoma Tech, I need help with a product.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a 
      href={whatsappUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={styles.whatsappBtn}
      aria-label="Chat with Zoma Tech on WhatsApp"
      title="Chat with Zoma Tech"
    >
      <svg viewBox="0 0 24 24" className={styles.whatsappIcon}>
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.666.598 1.236.784 1.41.874.174.086.275.072.376-.043l.405-.506c.116-.145.231-.116.39-.058.159.058 1.012.477 1.185.564.173.087.289.129.332.202.043.073.043.423-.101.827z"/>
      </svg>
    </a>
  );
}
