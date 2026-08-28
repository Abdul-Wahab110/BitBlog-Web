import dns from 'dns';

// Common typo domains
const TYPO_DOMAINS: { [key: string]: string } = {
  'gmial.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gmaik.com': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmail.cm': 'gmail.com',
  'gmeil.com': 'gmail.com',
  'hotmial.com': 'hotmail.com',
  'yaho.com': 'yahoo.com',
  'outlok.com': 'outlook.com',
};

// Known temporary / disposable fake email domains
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  '10minutemail.com',
  'tempmail.com',
  'guerrillamail.com',
  'sharklasers.com',
  'throwawaymail.com',
  'dispostable.com',
  'getairmail.com',
  'yopmail.com',
  'fake.com',
  'test.com',
  'wrong.com',
  'invalid.com',
  'example.com',
  'sample.com',
  'asdf.com',
]);

export class AuthValidator {
  public static isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    const cleanEmail = email.trim().toLowerCase();

    // Standard RFC-compliant regex check
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(cleanEmail)) return false;

    const parts = cleanEmail.split('@');
    if (parts.length !== 2) return false;

    const [userPart, domainPart] = parts;

    // Reject disposable domains
    if (DISPOSABLE_DOMAINS.has(domainPart)) {
      return false;
    }

    // Reject known typos
    if (TYPO_DOMAINS[domainPart]) {
      return false;
    }

    // Strict Gmail Rules
    if (domainPart === 'gmail.com' || domainPart === 'googlemail.com') {
      // 1. Google Gmail username length must be 6-30 characters
      if (userPart.length < 6 || userPart.length > 30) {
        return false;
      }

      // 2. Gmail username can only contain letters, numbers, and dots
      if (!/^[a-z0-9.]+$/.test(userPart)) {
        return false;
      }

      // 3. Cannot start or end with a dot
      if (userPart.startsWith('.') || userPart.endsWith('.')) {
        return false;
      }

      // 4. Cannot contain consecutive dots (..)
      if (userPart.includes('..')) {
        return false;
      }
    }

    return true;
  }

  // Validate Email syntax and check for helpful typo feedback
  public static validateEmailDetailed(email: string): { valid: boolean; error?: string } {
    if (!email || typeof email !== 'string' || !email.trim()) {
      return { valid: false, error: 'Email address is required.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const parts = cleanEmail.split('@');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      return { valid: false, error: 'Please enter a complete and valid email address (e.g. yourname@gmail.com).' };
    }

    const [userPart, domainPart] = parts;

    // Check for common typos
    if (TYPO_DOMAINS[domainPart]) {
      return {
        valid: false,
        error: `Did you mean @${TYPO_DOMAINS[domainPart]}? Please correct the typo in '@${domainPart}'.`,
      };
    }

    // Check disposable
    if (DISPOSABLE_DOMAINS.has(domainPart)) {
      return {
        valid: false,
        error: 'Disposable or temporary email addresses are not permitted. Please use your real Gmail address.',
      };
    }

    // Strict Gmail validation
    if (domainPart === 'gmail.com' || domainPart === 'googlemail.com') {
      if (userPart.length < 6) {
        return {
          valid: false,
          error: 'Gmail username is too short. Google requires at least 6 characters before the @gmail.com.',
        };
      }
      if (userPart.length > 30) {
        return {
          valid: false,
          error: 'Gmail username cannot exceed 30 characters.',
        };
      }
      if (!/^[a-z0-9.]+$/.test(userPart)) {
        return {
          valid: false,
          error: 'Gmail usernames can only contain letters (a-z), numbers (0-9), and periods (.).',
        };
      }
      if (userPart.startsWith('.') || userPart.endsWith('.')) {
        return {
          valid: false,
          error: 'Gmail usernames cannot start or end with a period.',
        };
      }
      if (userPart.includes('..')) {
        return {
          valid: false,
          error: 'Gmail usernames cannot have consecutive periods (..).',
        };
      }
    }

    if (!this.isValidEmail(cleanEmail)) {
      return { valid: false, error: 'Please enter a valid and active Gmail address.' };
    }

    return { valid: true };
  }

  // Live DNS MX Record Verification: Verifies domain actually exists and accepts emails
  public static async verifyEmailDomainLive(email: string): Promise<boolean> {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const domain = cleanEmail.split('@')[1];
      if (!domain) return false;

      // Common trusted domains pass fast without DNS overhead
      if (domain === 'gmail.com' || domain === 'googlemail.com' || domain === 'yahoo.com' || domain === 'outlook.com' || domain === 'hotmail.com' || domain === 'icloud.com') {
        return true;
      }

      const mxRecords = await dns.promises.resolveMx(domain);
      return Array.isArray(mxRecords) && mxRecords.length > 0;
    } catch (dnsErr) {
      console.warn(`[AuthValidator] DNS MX lookup failed for ${email}:`, dnsErr);
      return false;
    }
  }

  public static isValidUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    return usernameRegex.test(username);
  }

  public static isStrongPassword(password: string): boolean {
    return password.length >= 6;
  }

  public static validateRegistrationPayload(data: any): string[] {
    const errors: string[] = [];

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Full name is required');
    }

    if (!data.username || !this.isValidUsername(data.username)) {
      errors.push('Username must be 3-30 characters long and contain only letters, numbers, underscores, or hyphens');
    }

    const emailCheck = this.validateEmailDetailed(data.email);
    if (!emailCheck.valid) {
      errors.push(emailCheck.error || 'A valid email address is required');
    }

    if (!data.password || data.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    return errors;
  }
}
