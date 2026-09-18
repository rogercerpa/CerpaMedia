import { NextRequest, NextResponse } from "next/server";
import { createMagicLinkToken, isAdminEmail } from "@/lib/auth";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
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

    if (!isAdminEmail(email)) {
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

    await resend.emails.send({
      from: "CerpaMedia Admin <admin@cerpamedia.com>",
      to: email,
      subject: "Your CerpaMedia Admin Login Link",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #65a30d;">CerpaMedia Admin</h1>
          <p>Click the link below to sign in to the admin panel:</p>
          <p>
            <a href="${magicLink}" style="display: inline-block; padding: 12px 24px; background-color: #65a30d; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Sign In to Admin Panel
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
            This link expires in 15 minutes. If you didn't request this, you can safely ignore this email.
          </p>
          <p style="color: #999; font-size: 12px;">
            Or copy and paste this URL into your browser:<br>
            ${magicLink}
          </p>
        </div>
      `,
    });

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
