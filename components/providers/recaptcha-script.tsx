"use client";

import { useEffect } from "react";
import Script from "next/script";

export function ReCaptchaScript() {
  // Use a default key for development if not provided
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // This is Google's test key

  const handleError = (e: Error) => {
    console.error("reCAPTCHA failed to load:", e);
  };

  return (
    <Script
      src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
      strategy="lazyOnload"
      onError={handleError}
    />
  );
}