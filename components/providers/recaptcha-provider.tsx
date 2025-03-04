"use client";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export function ReCaptchaProvider({ children }: { children: React.ReactNode }) {
  // Get the current hostname for development/production environments
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Use a default key for development if not provided
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // This is Google's test key

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={siteKey}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: "head",
      }}
      // Add localhost to allowed domains in development
      container={{
        parameters: {
          badge: 'bottomright',
        },
        ...(isDevelopment && {
          sitekey: siteKey,
          actions: ['contact_form'],
          hostname: hostname,
        }),
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}