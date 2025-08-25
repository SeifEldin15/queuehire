// Password validation utility
export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export const validatePassword = (password: string): PasswordValidation => {
  const errors: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score++;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score++;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score++;
  }

  // Number check
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score++;
  }

  // Special character check
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    score++;
  }

  // Common password check
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a stronger password');
    score = 0;
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 4 && errors.length === 0) {
    strength = 'strong';
  } else if (score >= 3) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
};

// Input sanitization utility
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .slice(0, 1000); // Limit length
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Website/URL validation
export const validateWebsite = (url: string): { isValid: boolean; error?: string } => {
  if (!url.trim()) {
    return { isValid: true }; // Empty is allowed
  }

  try {
    // Add protocol if missing
    let processedUrl = url.trim();
    if (!processedUrl.match(/^https?:\/\//)) {
      processedUrl = 'https://' + processedUrl;
    }

    const urlObj = new URL(processedUrl);
    
    // Check for valid protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'Website must use http or https protocol' };
    }

    // Check for valid domain
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.([a-zA-Z]{2,}|[a-zA-Z]{2,}\.[a-zA-Z]{2,})$/;
    if (!domainRegex.test(urlObj.hostname)) {
      return { isValid: false, error: 'Please enter a valid website URL' };
    }

    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Please enter a valid website URL' };
  }
};

// Phone number validation
export const validatePhone = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone.trim()) {
    return { isValid: true }; // Empty is allowed
  }

  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Check if it has reasonable length (7-15 digits is typical for international numbers)
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return { isValid: false, error: 'Phone number must be 7-15 digits long' };
  }

  // Check for valid characters (digits, spaces, hyphens, parentheses, plus sign)
  const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/;
  if (!phoneRegex.test(phone.trim())) {
    return { isValid: false, error: 'Phone number contains invalid characters' };
  }

  return { isValid: true };
};

// LinkedIn profile validation
export const validateLinkedIn = (linkedin: string): { isValid: boolean; error?: string } => {
  if (!linkedin.trim()) {
    return { isValid: true }; // Empty is allowed
  }

  const linkedinUrl = linkedin.trim();
  
  // Check if it's a full URL or just username
  if (linkedinUrl.includes('linkedin.com')) {
    // Full URL validation
    try {
      const url = new URL(linkedinUrl.startsWith('http') ? linkedinUrl : 'https://' + linkedinUrl);
      if (!url.hostname.includes('linkedin.com')) {
        return { isValid: false, error: 'Please enter a valid LinkedIn URL' };
      }
      // Check for profile path
      if (!url.pathname.includes('/in/')) {
        return { isValid: false, error: 'Please enter a valid LinkedIn profile URL' };
      }
    } catch {
      return { isValid: false, error: 'Please enter a valid LinkedIn URL' };
    }
  } else {
    // Username validation
    const usernameRegex = /^[a-zA-Z0-9-]+$/;
    if (!usernameRegex.test(linkedinUrl)) {
      return { isValid: false, error: 'LinkedIn username can only contain letters, numbers, and hyphens' };
    }
  }

  return { isValid: true };
};

// Instagram profile validation
export const validateInstagram = (instagram: string): { isValid: boolean; error?: string } => {
  if (!instagram.trim()) {
    return { isValid: true }; // Empty is allowed
  }

  const instagramValue = instagram.trim();
  
  // Check if it's a full URL or just username
  if (instagramValue.includes('instagram.com')) {
    // Full URL validation
    try {
      const url = new URL(instagramValue.startsWith('http') ? instagramValue : 'https://' + instagramValue);
      if (!url.hostname.includes('instagram.com')) {
        return { isValid: false, error: 'Please enter a valid Instagram URL' };
      }
    } catch {
      return { isValid: false, error: 'Please enter a valid Instagram URL' };
    }
  } else {
    // Username validation - remove @ if present
    const username = instagramValue.replace(/^@/, '');
    const usernameRegex = /^[a-zA-Z0-9_.]+$/;
    if (!usernameRegex.test(username)) {
      return { isValid: false, error: 'Instagram username can only contain letters, numbers, underscores, and periods' };
    }
    if (username.length < 1 || username.length > 30) {
      return { isValid: false, error: 'Instagram username must be 1-30 characters long' };
    }
  }

  return { isValid: true };
};
