import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { emailService } from "@/lib/email/email-service";
import { contactFormTemplate } from "@/lib/email/email-templates";
import { logError, logInfo } from "@/lib/logger";
import type { ContactFormData } from "@/types/contact";

// Enhanced email validation regex
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Enhanced contact form schema with detailed validation
const contactSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .regex(/^[a-zA-Z\s]*$/, "Name must contain only letters")
    .transform(val => val.trim()),
  email: z.string()
    .email("Invalid email format")
    .regex(emailRegex, "Please enter a valid email address")
    .transform(val => val.toLowerCase().trim()),
  subject: z.string()
    .min(5, "Subject must be at least 5 characters")
    .max(200, "Subject must not exceed 200 characters")
    .transform(val => val.trim()),
  message: z.string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must not exceed 1000 characters")
    .transform(val => val.trim()),
  timestamp: z.string().datetime().optional(),
  token: z.string().optional(),
  honeypot: z.string().max(0).optional(),
});

// Define proper reCAPTCHA response type
interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

// Enhanced reCAPTCHA verification with detailed error handling
const verifyRecaptcha = async (token?: string) => {
  const diagnosticInfo = {
    startTime: new Date().toISOString(),
    development: process.env.NODE_ENV === 'development'
  };

  // Skip verification in development
  if (process.env.NODE_ENV === 'development' || !token) {
    return true;
  }

  try {
    // Skip actual verification if secret key is not set
    if (!process.env.RECAPTCHA_SECRET_KEY) {
      console.warn("reCAPTCHA verification skipped: No secret key configured");
      return true;
    }

    const recaptchaResponse = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
      { 
        method: "POST",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    if (!recaptchaResponse.ok) {
      throw new Error(`reCAPTCHA verification failed: ${recaptchaResponse.statusText}`);
    }

    const recaptchaData: RecaptchaResponse = await recaptchaResponse.json();
    
    const enhancedDiagnosticInfo = {
      ...diagnosticInfo,
      success: recaptchaData.success,
      score: recaptchaData.score,
      action: recaptchaData.action,
    };
    
    if (!recaptchaData.success) {
      logError('reCAPTCHA Verification Failed', null, {
        ...enhancedDiagnosticInfo,
        errorCodes: recaptchaData['error-codes']
      });
    }

    return recaptchaData.success;
  } catch (error) {
    logError('reCAPTCHA Verification Error', error, diagnosticInfo);
    return false;
  }
};

export async function POST(request: Request) {
  const diagnosticInfo = {
    startTime: new Date().toISOString(),
    clientIP: request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent'),
  };

  try {
    // Rate limiting with enhanced error handling
    const limiter = await rateLimit(request);
    
    if (!limiter.success) {
      logError('Rate Limit Exceeded', null, diagnosticInfo);
      return NextResponse.json(
        { error: "Too many requests. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    const data = await request.json();
    
    // Enhanced validation with detailed error messages
    const validationResult = contactSchema.safeParse(data);
    
    if (!validationResult.success) {
      const validationErrors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      logError('Form Validation Failed', null, {
        ...diagnosticInfo,
        validationErrors
      });

      return NextResponse.json(
        { 
          error: "Please check your input and try again",
          details: validationErrors
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Check honeypot
    if (validatedData.honeypot) {
      logError('Honeypot Triggered', null, diagnosticInfo);
      return NextResponse.json(
        { error: "Form submission rejected" },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA token if provided
    const isRecaptchaValid = await verifyRecaptcha(validatedData.token);
    
    if (!isRecaptchaValid) {
      return NextResponse.json(
        { error: "Security verification failed. Please refresh the page and try again." },
        { status: 400 }
      );
    }

    try {
      const emailSent = await emailService.sendEmail({
        to: process.env.SMTP_USER || 'test@example.com',
        subject: `Contact Form: ${validatedData.subject}`,
        template: contactFormTemplate,
        templateData: {
          name: validatedData.name,
          email: validatedData.email,
          subject: validatedData.subject,
          message: validatedData.message,
          timestamp: validatedData.timestamp || new Date().toISOString(),
          ip: diagnosticInfo.clientIP,
          userAgent: diagnosticInfo.userAgent
        }
      });

      if (!emailSent) {
        throw new Error("Failed to send email notification");
      }

      // Log successful submission
      logInfo('Form Submission Success', 'Contact form submitted successfully', {
        ...diagnosticInfo,
        email: validatedData.email
      });

      return NextResponse.json(
        { message: "Message sent successfully" },
        { status: 200 }
      );
    } catch (error) {
      logError('Email Sending Failed', error, {
        ...diagnosticInfo,
        email: validatedData.email
      });
      
      return NextResponse.json(
        { 
          error: "We're experiencing technical difficulties. Please try again later or contact support directly at support@carlora.com"
        },
        { status: 500 }
      );
    }
  } catch (error) {
    logError('Unexpected Form Error', error, diagnosticInfo);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Please check your input and try again",
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: "We're experiencing technical difficulties. Please try again later or contact support directly at support@carlora.com"
      },
      { status: 500 }
    );
  }
}