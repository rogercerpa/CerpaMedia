import { NextRequest, NextResponse } from "next/server";
import { createMagicLinkToken, isAllowedAdminEmail } from "@/lib/auth";
import { renderAdminMagicLink } from "@/emails/messages";
import { getEmailFrom } from "@/lib/email";
import { Resend } from "resend";
import { checkRateLimit, validateEmail } from "@/lib/security";

function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY || "dummy-key-for-build");
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";

    const rateLimit = checkRateLimit({
      identifier: `admin-login:${ip}`,
      maxRequests: 5,
      windowMs: 60 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    if (!(await isAllowedAdminEmail(email))) {
      return NextResponse.json(
        { error: "Unauthorized email address" },
        { status: 403 }
      );
    }

    const token = await createMagicLinkToken(email);
    const magicLink = `${BASE_URL}/admin/verify?token=${token}`;

    if (!process.env.RESEND_API_KEY) {
      console.log("RESEND_API_KEY not set. Magic link:", magicLink);
      return NextResponse.json({
        message: "Magic link generated (email not sent - no API key)",
        devLink: magicLink,
      });
    }

    const resend = getResendClient();
    const loginEmail = await renderAdminMagicLink({ magicLink });

    const { error } = await resend.emails.send({
      from: getEmailFrom(),
      to: email,
      subject: loginEmail.subject,
      html: loginEmail.html,
      text: loginEmail.text,
    });

    if (error) {
      console.error("Resend API error:", error);
      return NextResponse.json(
        { error: "Failed to send magic link email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Magic link sent to your email",
    });
  } catch (error) {
    console.error("Error sending magic link:", error);
    return NextResponse.json(
      { error: "Failed to send magic link" },
      { status: 500 }
    );
  }
}
