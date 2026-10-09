import { describe, it, expect } from 'vitest';
import { generateServiceSlug } from '@/lib/service-slug';

describe('generateServiceSlug', () => {
  it('should convert title to lowercase kebab-case', () => {
    expect(generateServiceSlug('Web Development')).toBe('web-development');
    expect(generateServiceSlug('AI System Integration')).toBe('ai-system-integration');
  });

  it('should remove special characters', () => {
    expect(generateServiceSlug('Business Process Improvement & Automation')).toBe(
      'business-process-improvement-automation'
    );
    expect(generateServiceSlug('AI Consulting!')).toBe('ai-consulting');
  });

  it('should replace multiple spaces with single dash', () => {
    expect(generateServiceSlug('Web   Development')).toBe('web-development');
  });

  it('should trim leading and trailing dashes', () => {
    expect(generateServiceSlug('  Web Development  ')).toBe('web-development');
  });

  it('should handle empty string', () => {
    expect(generateServiceSlug('')).toBe('');
  });

  it('should collapse multiple dashes', () => {
    expect(generateServiceSlug('Web -- Development')).toBe('web-development');
  });

  it('should handle strings with only special characters', () => {
    expect(generateServiceSlug('!@#$%')).toBe('');
  });
});
