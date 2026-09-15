"use server";

import { Resend } from "resend";

interface ContactFormData {
  name: string;
  email: string;
  company: string;
  service: string;
  message: string;
}

export async function submitContactForm(formData: ContactFormData) {
  const { name, email, company, service, message } = formData;

  if (!name || !email || !message) {
    return {
      success: false,
      error: "Please fill in all required fields.",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      error: "Please enter a valid email address.",
    };
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

  try {
    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `New Contact Form Submission from ${name}`,
      replyTo: email,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${company || "Not provided"}</p>
        <p><strong>Service Interest:</strong> ${service || "Not specified"}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
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
