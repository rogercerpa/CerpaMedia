"use server";

import { Resend } from "resend";
import { headers } from "next/headers";
import {
  checkRateLimit,
  validateTextInput,
  validateEmail,
  checkHoneypot,
} from "@/lib/security";

interface ContactFormData {
  name: string;
  email: string;
  company: string;
  service: string;
  message: string;
  website?: string;
}

export async function submitContactForm(formData: ContactFormData) {
  const { name, email, company, service, message, website } = formData;

  if (!checkHoneypot(website)) {
    return {
      success: false,
      error: "Please try again.",
    };
  }

  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";

  const rateLimit = checkRateLimit({
    identifier: `contact:${ip}`,
    maxRequests: 3,
    windowMs: 60 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return {
      success: false,
      error: "Too many submissions. Please try again later.",
    };
  }

  const nameValidation = validateTextInput({
    value: name,
    minLength: 2,
    maxLength: 100,
    fieldName: "Name",
    required: true,
  });

  if (!nameValidation.valid) {
    return { success: false, error: nameValidation.error };
  }

  if (!validateEmail(email)) {
    return {
      success: false,
      error: "Please enter a valid email address.",
    };
  }

  const messageValidation = validateTextInput({
    value: message,
    minLength: 10,
    maxLength: 2000,
    fieldName: "Message",
    required: true,
  });

  if (!messageValidation.valid) {
    return { success: false, error: messageValidation.error };
  }

  const companyValidation = validateTextInput({
    value: company,
    maxLength: 200,
    fieldName: "Company",
    required: false,
  });

  if (!companyValidation.valid) {
    return { success: false, error: companyValidation.error };
  }

  const serviceValidation = validateTextInput({
    value: service,
    maxLength: 200,
    fieldName: "Service",
    required: false,
  });

  if (!serviceValidation.valid) {
    return { success: false, error: serviceValidation.error };
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    return {
      success: false,
      error: "Contact form submissions are temporarily unavailable. Please email us directly at cerpamedia@gmail.com.",
    };
  }

  const resend = new Resend(resendApiKey);
  const toEmail = process.env.CONTACT_TO_EMAIL || "cerpamedia@gmail.com";
  const fromEmail = process.env.CONTACT_FROM_EMAIL || "onboarding@resend.dev";

  const sanitizedName = nameValidation.sanitized;
  const sanitizedEmail = email.trim().slice(0, 254);
  const sanitizedCompany = companyValidation.sanitized;
  const sanitizedService = serviceValidation.sanitized;
  const sanitizedMessage = messageValidation.sanitized;

  try {
    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `New Contact Form Submission from ${sanitizedName}`,
      replyTo: sanitizedEmail,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${sanitizedName}</p>
        <p><strong>Email:</strong> ${sanitizedEmail}</p>
        <p><strong>Company:</strong> ${sanitizedCompany || "Not provided"}</p>
        <p><strong>Service Interest:</strong> ${sanitizedService || "Not specified"}</p>
        <p><strong>Message:</strong></p>
        <p>${sanitizedMessage.replace(/\n/g, "<br>")}</p>
      `,
    });

    return {
      success: true,
      message: "Thank you for your message. We'll get back to you soon!",
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: "There was an error sending your message. Please try again or email us directly at cerpamedia@gmail.com.",
    };
  }
}
