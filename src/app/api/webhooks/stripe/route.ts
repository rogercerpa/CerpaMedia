import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { Resend } from "resend";
import { toConsultBrief, formatConsultBriefForAdmin } from "@/lib/consult-brief";

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY not configured");
  }
  return new Stripe(key, {
    apiVersion: "2026-09-30.endive",
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET not configured");
    }
    
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;

    if (!bookingId) {
      console.error("No bookingId in session metadata");
      return NextResponse.json({ received: true });
    }

    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        console.error("Booking not found:", bookingId);
        return NextResponse.json({ received: true });
      }

      if (booking.status === "confirmed") {
        return NextResponse.json({ received: true });
      }

      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "confirmed" },
      });

      const consultBrief = toConsultBrief(booking, "confirmed");
      
      console.log("[Consult Secretary Hook] Booking confirmed:", JSON.stringify(consultBrief, null, 2));

      await sendConfirmationEmails(booking);
    } catch (error) {
      console.error("Error processing webhook:", error);
      return NextResponse.json(
        { error: "Failed to process webhook" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}

async function sendConfirmationEmails(booking: any) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error("RESEND_API_KEY not configured, skipping emails");
    return;
  }
  
  const resend = new Resend(resendKey);
  const fromEmail = process.env.CONTACT_FROM_EMAIL || "onboarding@resend.dev";
  const adminEmail = process.env.CONTACT_TO_EMAIL || "cerpamedia@gmail.com";

  const formattedStartTime = booking.startTime.toLocaleString("en-US", {
    timeZone: "America/New_York",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const consultBrief = toConsultBrief(booking, "confirmed");
  const serviceLabels: Record<string, string> = {
    general: "Technology Strategy Call (general)",
    web_mobile: "Web & mobile applications",
    ai: "AI integration / AI consulting",
    automation: "Automation & process improvement",
    strategy: "Strategy / architecture / roadmap",
    not_sure: "Not sure yet",
  };
  const serviceLabel = serviceLabels[booking.serviceInterest] || booking.serviceInterest;

  try {
    await resend.emails.send({
        from: fromEmail,
        to: booking.customerEmail,
        subject: "Your Technology Strategy Call is Confirmed",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Technology Strategy Call Confirmed</h1>
            <p>Hi ${booking.customerName},</p>
            <p>Thank you for booking a Technology Strategy Call with CerpaMedia. Your payment has been received and your session is confirmed.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-left: 4px solid #65a30d;">
              <h2 style="margin-top: 0;">Session Details</h2>
              <p><strong>Date & Time:</strong> ${formattedStartTime}</p>
              <p><strong>Duration:</strong> 30-45 minutes</p>
              <p><strong>Platform:</strong> ${booking.platformPref}</p>
            </div>

            <h3>What's Next?</h3>
            <p>Roger Cerpa will send you the ${booking.platformPref} meeting link shortly before your scheduled session.</p>
            
            <p>To get the most out of your call, please come prepared with:</p>
            <ul>
              <li>A brief overview of your business and current technology setup</li>
              <li>Specific challenges or opportunities you'd like to discuss</li>
              <li>Any questions you have about technology integration</li>
            </ul>

            <p>Within 24-48 hours after your call, you'll receive an email summary with 3-5 key opportunities and recommended next steps.</p>

            <p style="margin-top: 30px;">If you need to reschedule or have any questions, please contact us at ${adminEmail}.</p>

            <p>Looking forward to speaking with you!</p>
            <p><strong>CerpaMedia</strong></p>
          </div>
        `,
      });

    await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `New Booking: ${booking.customerName} - ${formattedStartTime}`,
      replyTo: booking.customerEmail,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>New Technology Strategy Call Booking</h1>
          
          <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Customer Information</h2>
            <p><strong>Name:</strong> ${booking.customerName}</p>
            <p><strong>Email:</strong> ${booking.customerEmail}</p>
            <p><strong>Phone:</strong> ${booking.customerPhone}</p>
            <p><strong>Company:</strong> ${booking.customerCompany}</p>
          </div>

          <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Session Details</h2>
            <p><strong>Date & Time:</strong> ${formattedStartTime}</p>
            <p><strong>Duration:</strong> 30-45 minutes</p>
            <p><strong>Platform Preference:</strong> ${booking.platformPref}</p>
            <p><strong>Service Interest:</strong> ${serviceLabel}</p>
            <p><strong>Booking ID:</strong> ${booking.id}</p>
          </div>

          <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Challenge / Problem Statement</h2>
            <p>${booking.notes.replace(/\n/g, "<br>")}</p>
          </div>

          ${booking.intakeAnswers && Object.keys(booking.intakeAnswers).length > 0 ? `
            <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0;">
              <h2 style="margin-top: 0;">Additional Context</h2>
              ${Object.entries(booking.intakeAnswers).filter(([_, value]) => value).map(([key, value]) => 
                `<p><strong>${key.replace(/_/g, ' ')}:</strong> ${value}</p>`
              ).join('')}
            </div>
          ` : ""}

          <div style="background-color: #fff3cd; padding: 20px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="margin-top: 0;">For Consult Secretary Bot</h3>
            <pre style="background-color: #f8f9fa; padding: 15px; overflow-x: auto; font-size: 12px; border: 1px solid #dee2e6;">${formatConsultBriefForAdmin(consultBrief)}</pre>
          </div>

          <p style="margin-top: 30px;"><strong>Action Required:</strong> Send ${booking.platformPref} meeting link to the customer before the scheduled time.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending confirmation emails:", error);
  }
}
