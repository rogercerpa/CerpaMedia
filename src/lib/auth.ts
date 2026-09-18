import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const AUTH_SECRET = process.env.AUTH_SECRET || "default-secret-change-in-production";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "cerpamedia@gmail.com";

const secret = new TextEncoder().encode(AUTH_SECRET);

export async function createMagicLinkToken(email: string): Promise<string> {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.magicLinkToken.create({
    data: {
      email,
      token,
      expiresAt,
    },
  });

  return token;
}

export async function verifyMagicLinkToken(token: string): Promise<string | null> {
  const magicLink = await prisma.magicLinkToken.findUnique({
    where: { token },
  });

  if (!magicLink) {
    return null;
  }

  if (magicLink.used) {
    return null;
  }

  if (magicLink.expiresAt < new Date()) {
    return null;
  }

  if (magicLink.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return null;
  }

  await prisma.magicLinkToken.update({
    where: { token },
    data: { used: true },
  });

  return magicLink.email;
}

export async function createAdminSession(email: string): Promise<string> {
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.adminSession.create({
    data: {
      email,
      token,
      expiresAt,
    },
  });

  return token;
}

export async function verifyAdminSession(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    const email = payload.email as string;

    if (!email || email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return null;
    }

    const session = await prisma.adminSession.findUnique({
      where: { token },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return email;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;

  if (!token) {
    return null;
  }

  return verifyAdminSession(token);
}

export async function setAdminSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
}

export function isAdminEmail(email: string): boolean {
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
