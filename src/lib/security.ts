const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_CLEANUP_INTERVAL = 60000;
let cleanupInterval: NodeJS.Timeout | null = null;

if (typeof window === "undefined" && !cleanupInterval) {
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetAt < now) {
        rateLimitStore.delete(key);
      }
    }
  }, RATE_LIMIT_CLEANUP_INTERVAL);
}

export interface RateLimitConfig {
  identifier: string;
  maxRequests: number;
  windowMs: number;
}

export function checkRateLimit(config: RateLimitConfig): {
  allowed: boolean;
  remainingRequests: number;
  resetAt: number;
} {
  const now = Date.now();
  const key = config.identifier;
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt < now) {
    const resetAt = now + config.windowMs;
    rateLimitStore.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remainingRequests: config.maxRequests - 1,
      resetAt,
    };
  }

  if (existing.count >= config.maxRequests) {
    return {
      allowed: false,
      remainingRequests: 0,
      resetAt: existing.resetAt,
    };
  }

  existing.count++;
  return {
    allowed: true,
    remainingRequests: config.maxRequests - existing.count,
    resetAt: existing.resetAt,
  };
}

export function stripHtmlAndScripts(input: string): string {
  if (!input) return "";
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

export function sanitizeInput(input: string, maxLength: number = 5000): string {
  if (!input) return "";
  
  const stripped = stripHtmlAndScripts(input);
  return stripped.slice(0, maxLength);
}

export function validateEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  if (!phone) return false;
  
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, "");
  return cleaned.length >= 10 && cleaned.length <= 15 && /^\+?[\d]+$/.test(cleaned);
}

export function checkHoneypot(honeypotValue: string | null | undefined): boolean {
  return !honeypotValue || honeypotValue.trim() === "";
}

export interface InputValidation {
  value: string;
  minLength?: number;
  maxLength: number;
  fieldName: string;
  required?: boolean;
}

export function validateTextInput(validation: InputValidation): {
  valid: boolean;
  error?: string;
  sanitized: string;
} {
  const { value, minLength, maxLength, fieldName, required = false } = validation;

  if (!value || value.trim() === "") {
    if (required) {
      return {
        valid: false,
        error: `${fieldName} is required`,
        sanitized: "",
      };
    }
    return { valid: true, sanitized: "" };
  }

  const sanitized = sanitizeInput(value, maxLength);

  if (sanitized.length > maxLength) {
    return {
      valid: false,
      error: `${fieldName} must be ${maxLength} characters or less`,
      sanitized,
    };
  }

  if (minLength && sanitized.length < minLength) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${minLength} characters`,
      sanitized,
    };
  }

  return { valid: true, sanitized };
}
