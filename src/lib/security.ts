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

function hasLongConsonantRun(text: string): boolean {
  const consonantRun = /[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{5,}/;
  return consonantRun.test(text);
}

function hasLowVowelRatio(word: string): boolean {
  if (word.length < 5) return false;
  
  const vowels = word.match(/[aeiouAEIOU]/g);
  const vowelCount = vowels ? vowels.length : 0;
  const vowelRatio = vowelCount / word.length;
  
  return vowelRatio < 0.2;
}

function hasNoSpacesInLongText(text: string): boolean {
  const cleanText = text.trim();
  return cleanText.length >= 20 && !cleanText.includes(" ");
}

function hasMixedCaseRandomPattern(text: string): boolean {
  if (text.length < 8) return false;
  
  let upperCount = 0;
  let lowerCount = 0;
  let transitions = 0;
  let lastWasUpper = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (/[A-Z]/.test(char)) {
      upperCount++;
      if (i > 0 && !lastWasUpper) transitions++;
      lastWasUpper = true;
    } else if (/[a-z]/.test(char)) {
      lowerCount++;
      if (i > 0 && lastWasUpper) transitions++;
      lastWasUpper = false;
    }
  }
  
  const totalLetters = upperCount + lowerCount;
  if (totalLetters < 8) return false;
  
  const hasMultipleTransitions = transitions >= 3;
  const hasReasonableCase = upperCount > 0 && lowerCount > 0;
  
  return hasMultipleTransitions && hasReasonableCase;
}

export function looksLikeSpam(text: string): boolean {
  if (!text || text.trim().length === 0) return false;
  
  const trimmed = text.trim();
  
  if (hasLongConsonantRun(trimmed)) {
    return true;
  }
  
  if (hasNoSpacesInLongText(trimmed)) {
    return true;
  }
  
  const words = trimmed.split(/\s+/);
  const longWords = words.filter(w => w.length >= 5);
  
  if (longWords.length > 0) {
    const lowVowelWords = longWords.filter(w => hasLowVowelRatio(w));
    const lowVowelRatio = lowVowelWords.length / longWords.length;
    
    if (lowVowelRatio > 0.5) {
      return true;
    }
  }
  
  if (trimmed.length >= 10 && hasMixedCaseRandomPattern(trimmed) && hasLowVowelRatio(trimmed.replace(/\s/g, ""))) {
    return true;
  }
  
  return false;
}

function countSingleLetterSegments(email: string): number {
  const localPart = email.split("@")[0];
  if (!localPart) return 0;
  
  const segments = localPart.split(".");
  return segments.filter(seg => seg.length === 1).length;
}

function countShortSegments(email: string): number {
  const localPart = email.split("@")[0];
  if (!localPart) return 0;
  
  const segments = localPart.split(".");
  return segments.filter(seg => seg.length <= 2).length;
}

function localPartLooksRandom(localPart: string): boolean {
  if (localPart.length < 8) return false;
  
  const withoutDots = localPart.replace(/\./g, "");
  
  if (hasLongConsonantRun(withoutDots)) {
    return true;
  }
  
  if (hasLowVowelRatio(withoutDots) && withoutDots.length >= 10) {
    return true;
  }
  
  return false;
}

export function emailLooksGenerated(email: string): boolean {
  if (!email || !email.includes("@")) return false;
  
  const singleLetterSegments = countSingleLetterSegments(email);
  if (singleLetterSegments >= 3) {
    return true;
  }
  
  const localPart = email.split("@")[0];
  const segments = localPart.split(".");
  
  if (segments.length >= 5) {
    const shortSegments = countShortSegments(email);
    if (shortSegments >= 4) {
      return true;
    }
  }
  
  if (localPartLooksRandom(localPart)) {
    return true;
  }
  
  return false;
}
