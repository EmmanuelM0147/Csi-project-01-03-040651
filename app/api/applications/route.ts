import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { emailService } from "@/lib/email/email-service";
import { applicationFormTemplate } from "@/lib/email/email-templates";
import { logError, logInfo } from "@/lib/logger";

// Application form schema
const applicationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  servicePackage: z.enum(["Business Strategy", "Market Research", "Digital Transformation"]),
  consultationGoals: z.string().min(10, "Please provide detailed goals"),
  businessStage: z.enum(["Startup", "Growth", "Maturity", "Decline"]),
  primaryAreaOfExpertise: z.enum(["Marketing", "Operations", "Finance/Fintech", "Strategy", "Production Development", "Sales", "Other"]),
  yearsOfExperience: z.number().min(1, "Please enter a valid number of years"),
  challenges: z.string().min(10, "Please describe your challenges"),
  businessObjectives: z.string().min(10, "Please describe your business objectives"),
  successMetrics: z.string().min(10, "Please define your success metrics"),
  budget: z.string(),
  additionalDetails: z.string().optional(),
  projectDuration: z.enum(["1-3 months", "4-6 months", "7-12 months"]),
  preferredTimeline: z.string().optional(),
  honeypot: z.string().max(0).optional(),
});

export async function POST(request: Request) {
  const diagnosticInfo = {
    startTime: new Date().toISOString(),
    clientIP: request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent'),
  };

  try {
    // Rate limiting
    const limiter = await rateLimit(request);
    
    if (!limiter.success) {
      logError('Rate Limit Exceeded', null, diagnosticInfo);
      return NextResponse.json(
        { error: "Too many requests. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    const data = await request.json();
    
    // Validate form data
    const validationResult = applicationSchema.safeParse(data);
    
    if (!validationResult.success) {
      const validationErrors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      logError('Application Form Validation Failed', null, {
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

    // Send email notification
    const emailSent = await emailService.sendEmail({
      to: process.env.SMTP_USER!,
      subject: `New Application: ${validatedData.firstName} ${validatedData.lastName}`,
      template: applicationFormTemplate,
      templateData: {
        ...validatedData,
        timestamp: new Date().toISOString(),
        ip: diagnosticInfo.clientIP,
        userAgent: diagnosticInfo.userAgent
      }
    });

    if (!emailSent) {
      throw new Error("Failed to send email notification");
    }

    // Log successful submission
    logInfo('Application Form Submission Success', 'Application submitted successfully', {
      ...diagnosticInfo,
      email: validatedData.email
    });

    return NextResponse.json(
      { success: true, message: "Application submitted successfully" },
      { status: 200 }
    );
  } catch (error) {
    logError('Application Form Submission Error', error, diagnosticInfo);
    
    return NextResponse.json(
      { 
        error: "We're experiencing technical difficulties. Please try again later or contact support directly."
      },
      { status: 500 }
    );
  }
}