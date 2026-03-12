// src/services/contentFilter.ts

// Basic profanity and spam detection
const BLOCKED_WORDS = [
  // Add your blocked words here
  'viagra', 'cialis', 'casino', 'porn', 'xxx',
  // Spam indicators
  'click here', 'buy now', 'limited time', 'act now',
  // Common spam domains
  'bit.ly', 't.co', 'tinyurl'
];

const SPAM_PATTERNS = [
  /https?:\/\/.{5,}/gi, // Multiple URLs
  /(.)\1{10,}/g, // Character repetition (aaaaaaaaaa)
  /[A-Z]{20,}/, // All caps spam
  /\$\d+/g, // Money amounts (spam indicator)
];

export interface ModerationResult {
  clean: boolean;
  reason?: string;
  severity?: 'low' | 'medium' | 'high';
}

export function moderateContent(text: string): ModerationResult {
  if (!text || text.trim().length === 0) {
    return { clean: false, reason: 'Empty content' };
  }

  // Check length (too short or too long)
  if (text.length < 2) {
    return { clean: false, reason: 'Content too short' };
  }

  if (text.length > 5000) {
    return { clean: false, reason: 'Content too long (max 5000 characters)' };
  }

  const lowerText = text.toLowerCase();

  // Check for blocked words
  for (const word of BLOCKED_WORDS) {
    if (lowerText.includes(word.toLowerCase())) {
      return { 
        clean: false, 
        reason: `Contains prohibited content`, 
        severity: 'high' 
      };
    }
  }

  // Check for spam patterns
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) {
      return { 
        clean: false, 
        reason: 'Potential spam detected', 
        severity: 'medium' 
      };
    }
  }

  // Check for excessive URLs (>3 URLs = spam)
  const urlCount = (text.match(/https?:\/\//g) || []).length;
  if (urlCount > 3) {
    return { 
      clean: false, 
      reason: 'Too many links (max 3)', 
      severity: 'medium' 
    };
  }

  return { clean: true };
}

// Rate limiting helper
export function checkPostRateLimit(
  userId: string,
  recentPosts: any[],
  maxPosts: number = 10,
  timeWindowMinutes: number = 60
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const windowStart = now - (timeWindowMinutes * 60 * 1000);

  const recentCount = recentPosts.filter(post => 
    post.user_id === userId && 
    new Date(post.created_at).getTime() > windowStart
  ).length;

  const allowed = recentCount < maxPosts;
  const remaining = Math.max(0, maxPosts - recentCount);
  
  // Calculate reset time
  const oldestPost = recentPosts
    .filter(p => p.user_id === userId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];
  
  const resetIn = oldestPost 
    ? Math.max(0, (new Date(oldestPost.created_at).getTime() + (timeWindowMinutes * 60 * 1000)) - now)
    : 0;

  return { allowed, remaining, resetIn };
}