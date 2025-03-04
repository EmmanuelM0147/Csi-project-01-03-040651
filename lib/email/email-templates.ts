import Handlebars from 'handlebars';

export interface RenderedTemplate {
  html: string;
  text: string;
}

export class EmailTemplate {
  private htmlTemplate: HandlebarsTemplateDelegate;
  private textTemplate: HandlebarsTemplateDelegate;

  constructor(htmlContent: string, textContent: string) {
    this.htmlTemplate = Handlebars.compile(htmlContent);
    this.textTemplate = Handlebars.compile(textContent);
  }

  render(data: Record<string, any>): RenderedTemplate {
    return {
      html: this.htmlTemplate(data),
      text: this.textTemplate(data)
    };
  }
}

// Contact Form Template
export const contactFormTemplate = new EmailTemplate(
  `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission</title>
    <style>
      body { 
        font-family: Arial, sans-serif; 
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .header { 
        background-color: #0A2240;
        color: white;
        padding: 20px;
        text-align: center;
        border-radius: 5px 5px 0 0;
      }
      .content {
        padding: 20px;
        border: 1px solid #ddd;
        border-top: none;
        border-radius: 0 0 5px 5px;
      }
      .footer {
        margin-top: 20px;
        font-size: 12px;
        color: #666;
        text-align: center;
      }
      .field {
        margin-bottom: 15px;
      }
      .label {
        font-weight: bold;
        margin-bottom: 5px;
      }
      .value {
        margin-bottom: 15px;
      }
      .metadata {
        margin-top: 30px;
        padding-top: 15px;
        border-top: 1px solid #eee;
        font-size: 12px;
        color: #666;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>New Contact Form Submission</h1>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">Name:</div>
        <div class="value">{{name}}</div>
      </div>
      
      <div class="field">
        <div class="label">Email:</div>
        <div class="value">{{email}}</div>
      </div>
      
      <div class="field">
        <div class="label">Subject:</div>
        <div class="value">{{subject}}</div>
      </div>
      
      <div class="field">
        <div class="label">Message:</div>
        <div class="value">{{message}}</div>
      </div>
      
      <div class="metadata">
        <p>Submission Time: {{timestamp}}</p>
        <p>IP Address: {{ip}}</p>
        <p>User Agent: {{userAgent}}</p>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated message from the Carlora website contact form.</p>
    </div>
  </body>
  </html>
  `,
  `
  NEW CONTACT FORM SUBMISSION
  
  Name: {{name}}
  Email: {{email}}
  Subject: {{subject}}
  
  Message:
  {{message}}
  
  ---
  Submission Time: {{timestamp}}
  IP Address: {{ip}}
  User Agent: {{userAgent}}
  
  This is an automated message from the Carlora website contact form.
  `
);

// Application Form Template
export const applicationFormTemplate = new EmailTemplate(
  `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Application Submission</title>
    <style>
      body { 
        font-family: Arial, sans-serif; 
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .header { 
        background-color: #0A2240;
        color: white;
        padding: 20px;
        text-align: center;
        border-radius: 5px 5px 0 0;
      }
      .content {
        padding: 20px;
        border: 1px solid #ddd;
        border-top: none;
        border-radius: 0 0 5px 5px;
      }
      .footer {
        margin-top: 20px;
        font-size: 12px;
        color: #666;
        text-align: center;
      }
      .field {
        margin-bottom: 15px;
      }
      .label {
        font-weight: bold;
        margin-bottom: 5px;
      }
      .value {
        margin-bottom: 15px;
      }
      .section {
        margin-top: 25px;
        padding-top: 15px;
        border-top: 1px solid #eee;
      }
      .section-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 15px;
        color: #0A2240;
      }
      .metadata {
        margin-top: 30px;
        padding-top: 15px;
        border-top: 1px solid #eee;
        font-size: 12px;
        color: #666;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>New Application Submission</h1>
    </div>
    <div class="content">
      <div class="section">
        <div class="section-title">Personal Information</div>
        <div class="field">
          <div class="label">Name:</div>
          <div class="value">{{firstName}} {{lastName}}</div>
        </div>
        
        <div class="field">
          <div class="label">Email:</div>
          <div class="value">{{email}}</div>
        </div>
        
        <div class="field">
          <div class="label">Phone:</div>
          <div class="value">{{phone}}</div>
        </div>
        
        <div class="field">
          <div class="label">Address:</div>
          <div class="value">
            {{#if street}}{{street}}<br>{{/if}}
            {{#if city}}{{city}}{{#if state}}, {{state}}{{/if}} {{#if zipCode}}{{zipCode}}{{/if}}{{/if}}
          </div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Professional Information</div>
        <div class="field">
          <div class="label">Service Package:</div>
          <div class="value">{{servicePackage}}</div>
        </div>
        
        <div class="field">
          <div class="label">Business Stage:</div>
          <div class="value">{{businessStage}}</div>
        </div>
        
        <div class="field">
          <div class="label">Primary Area of Expertise:</div>
          <div class="value">{{primaryAreaOfExpertise}}</div>
        </div>
        
        <div class="field">
          <div class="label">Years of Experience:</div>
          <div class="value">{{yearsOfExperience}}</div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Project Details</div>
        <div class="field">
          <div class="label">Consultation Goals:</div>
          <div class="value">{{consultationGoals}}</div>
        </div>
        
        <div class="field">
          <div class="label">Challenges:</div>
          <div class="value">{{challenges}}</div>
        </div>
        
        <div class="field">
          <div class="label">Business Objectives:</div>
          <div class="value">{{businessObjectives}}</div>
        </div>
        
        <div class="field">
          <div class="label">Success Metrics:</div>
          <div class="value">{{successMetrics}}</div>
        </div>
        
        <div class="field">
          <div class="label">Budget:</div>
          <div class="value">{{budget}}</div>
        </div>
        
        <div class="field">
          <div class="label">Project Duration:</div>
          <div class="value">{{projectDuration}}</div>
        </div>
        
        <div class="field">
          <div class="label">Preferred Timeline:</div>
          <div class="value">{{preferredTimeline}}</div>
        </div>
        
        {{#if additionalDetails}}
        <div class="field">
          <div class="label">Additional Details:</div>
          <div class="value">{{additionalDetails}}</div>
        </div>
        {{/if}}
      </div>
      
      <div class="metadata">
        <p>Submission Time: {{timestamp}}</p>
        <p>IP Address: {{ip}}</p>
        <p>User Agent: {{userAgent}}</p>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated message from the Carlora website application form.</p>
    </div>
  </body>
  </html>
  `,
  `
  NEW APPLICATION SUBMISSION
  
  PERSONAL INFORMATION
  --------------------
  Name: {{firstName}} {{lastName}}
  Email: {{email}}
  Phone: {{phone}}
  Address: {{#if street}}{{street}}, {{/if}}{{#if city}}{{city}}{{#if state}}, {{state}}{{/if}} {{#if zipCode}}{{zipCode}}{{/if}}{{/if}}
  
  PROFESSIONAL INFORMATION
  -----------------------
  Service Package: {{servicePackage}}
  Business Stage: {{businessStage}}
  Primary Area of Expertise: {{primaryAreaOfExpertise}}
  Years of Experience: {{yearsOfExperience}}
  
  PROJECT DETAILS
  --------------
  Consultation Goals: {{consultationGoals}}
  
  Challenges: {{challenges}}
  
  Business Objectives: {{businessObjectives}}
  
  Success Metrics: {{successMetrics}}
  
  Budget: {{budget}}
  Project Duration: {{projectDuration}}
  Preferred Timeline: {{preferredTimeline}}
  
  {{#if additionalDetails}}
  Additional Details: {{additionalDetails}}
  {{/if}}
  
  ---
  Submission Time: {{timestamp}}
  IP Address: {{ip}}
  User Agent: {{userAgent}}
  
  This is an automated message from the Carlora website application form.
  `
);

// Consultation Booking Template
export const consultationBookingTemplate = new EmailTemplate(
  `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Consultation Booking</title>
    <style>
      body { 
        font-family: Arial, sans-serif; 
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .header { 
        background-color: #0A2240;
        color: white;
        padding: 20px;
        text-align: center;
        border-radius: 5px 5px 0 0;
      }
      .content {
        padding: 20px;
        border: 1px solid #ddd;
        border-top: none;
        border-radius: 0 0 5px 5px;
      }
      .footer {
        margin-top: 20px;
        font-size: 12px;
        color: #666;
        text-align: center;
      }
      .field {
        margin-bottom: 15px;
      }
      .label {
        font-weight: bold;
        margin-bottom: 5px;
      }
      .value {
        margin-bottom: 15px;
      }
      .metadata {
        margin-top: 30px;
        padding-top: 15px;
        border-top: 1px solid #eee;
        font-size: 12px;
        color: #666;
      }
      .highlight {
        background-color: #f8f9fa;
        padding: 15px;
        border-left: 4px solid #0A2240;
        margin: 15px 0;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>New Consultation Booking</h1>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">Name:</div>
        <div class="value">{{name}}</div>
      </div>
      
      <div class="field">
        <div class="label">Email:</div>
        <div class="value">{{email}}</div>
      </div>
      
      <div class="field">
        <div class="label">Company:</div>
        <div class="value">{{company}}</div>
      </div>
      
      <div class="field">
        <div class="label">Industry:</div>
        <div class="value">{{industry}}</div>
      </div>
      
      <div class="field">
        <div class="label">Company Size:</div>
        <div class="value">{{companySize}}</div>
      </div>
      
      <div class="field">
        <div class="label">Consultation Type:</div>
        <div class="value">{{consultationType}}</div>
      </div>
      
      <div class="field">
        <div class="label">Message:</div>
        <div class="value">{{message}}</div>
      </div>
      
      <div class="highlight">
        <div class="label">Preferred Consultation Date:</div>
        <div class="value">{{preferredDate}}</div>
      </div>
      
      <div class="metadata">
        <p>Submission Time: {{timestamp}}</p>
        <p>IP Address: {{ip}}</p>
        <p>User Agent: {{userAgent}}</p>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated message from the Carlora website consultation booking form.</p>
    </div>
  </body>
  </html>
  `,
  `
  NEW CONSULTATION BOOKING
  
  Name: {{name}}
  Email: {{email}}
  Company: {{company}}
  Industry: {{industry}}
  Company Size: {{companySize}}
  Consultation Type: {{consultationType}}
  
  Message:
  {{message}}
  
  Preferred Consultation Date: {{preferredDate}}
  
  ---
  Submission Time: {{timestamp}}
  IP Address: {{ip}}
  User Agent: {{userAgent}}
  
  This is an automated message from the Carlora website consultation booking form.
  `
);