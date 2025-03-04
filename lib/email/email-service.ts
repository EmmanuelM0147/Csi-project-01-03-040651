import nodemailer from 'nodemailer';
import { EmailTemplate } from './email-templates';
import { logError } from '@/lib/logger';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  replyTo?: string;
  attachments?: any[];
  template?: EmailTemplate;
  templateData?: Record<string, any>;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private defaultFrom: string;
  private isConfigured: boolean = false;

  constructor() {
    this.defaultFrom = process.env.SMTP_FROM || '';
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        this.isConfigured = false;
        console.warn('Email service not configured: Missing SMTP credentials');
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === 'production',
          minVersion: 'TLSv1.2'
        },
        debug: process.env.NODE_ENV !== 'production',
        logger: process.env.NODE_ENV !== 'production'
      });

      this.isConfigured = true;
    } catch (error) {
      this.isConfigured = false;
      logError('Email Service Initialization Error', error);
    }
  }

  public async verifyConnection(): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      logError('Email Connection Verification Error', error);
      return false;
    }
  }

  public async sendEmail(options: EmailOptions): Promise<boolean> {
    // In development or if not configured, just log and return success
    if (process.env.NODE_ENV === 'development' || !this.isConfigured || !this.transporter) {
      console.log('Email would be sent in production:', options);
      return true;
    }

    try {
      // Apply template if provided
      let html = options.html;
      let text = options.text;

      if (options.template && options.templateData) {
        const rendered = options.template.render(options.templateData);
        html = rendered.html;
        text = rendered.text;
      }

      const mailOptions = {
        from: options.from || this.defaultFrom,
        to: Array.isArray(options.to) ? options.to.join(',') : options.to,
        subject: options.subject,
        text: text,
        html: html,
        replyTo: options.replyTo,
        attachments: options.attachments
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('Email sent:', info.messageId);
        if (nodemailer.getTestMessageUrl) {
          console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        }
      }
      
      return true;
    } catch (error) {
      logError('Email Sending Error', error, {
        to: options.to,
        subject: options.subject
      });
      return false;
    }
  }
}

// Singleton instance
export const emailService = new EmailService();