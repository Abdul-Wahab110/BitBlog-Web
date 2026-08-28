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

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  '10minutemail.com',
  'tempmail.com',
  'guerrillamail.com',
  'fake.com',
  'test.com',
  'wrong.com',
  'invalid.com',
  'example.com',
  'sample.com',
  'asdf.com',
]);

export function validateGmailAddress(email: string): { valid: boolean; error?: string } {
  if (!email || !email.trim()) {
    return { valid: false, error: 'Gmail address is required.' };
  }

  const clean = email.trim().toLowerCase();
  const parts = clean.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { valid: false, error: 'Please enter a complete email address (e.g. name@gmail.com).' };
  }

  const [userPart, domainPart] = parts;

  // Typo check
  if (TYPO_DOMAINS[domainPart]) {
    return {
      valid: false,
      error: `Typo detected in '@${domainPart}'. Did you mean '@${TYPO_DOMAINS[domainPart]}'?`,
    };
  }

  // Disposable domain check
  if (DISPOSABLE_DOMAINS.has(domainPart)) {
    return {
      valid: false,
      error: 'Temporary or disposable email domains are not allowed. Please enter your real Gmail.',
    };
  }

  // Gmail strict rules
  if (domainPart === 'gmail.com' || domainPart === 'googlemail.com') {
    if (userPart.length < 6) {
      return {
        valid: false,
        error: 'Gmail username is too short. Google requires at least 6 characters before @gmail.com.',
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
        error: 'Gmail addresses can only contain letters (a-z), numbers (0-9), and periods (.).',
      };
    }
    if (userPart.startsWith('.') || userPart.endsWith('.')) {
      return {
        valid: false,
        error: 'Gmail address cannot begin or end with a period.',
      };
    }
    if (userPart.includes('..')) {
      return {
        valid: false,
        error: 'Gmail address cannot contain consecutive periods (..).',
      };
    }
  }

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(clean)) {
    return { valid: false, error: 'Please enter a valid email format.' };
  }

  return { valid: true };
}
