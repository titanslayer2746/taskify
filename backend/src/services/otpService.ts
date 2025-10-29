import crypto from 'crypto';

// OTP configuration
const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 10,
  MAX_ATTEMPTS: 5,
  RESEND_COOLDOWN_MINUTES: 1,
};

// OTP service class
export class OtpService {
  // Generate a random OTP
  generateOtp(): string {
    const digits = '0123456789';
    let otp = '';
    
    for (let i = 0; i < OTP_CONFIG.LENGTH; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    
    return otp;
  }

  // Generate OTP expiry time
  generateOtpExpiry(): Date {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + OTP_CONFIG.EXPIRY_MINUTES);
    return expiry;
  }

  // Check if OTP is expired
  isOtpExpired(expiryDate: Date): boolean {
    return new Date() > expiryDate;
  }

  // Check if user can request new OTP (rate limiting)
  canRequestOtp(lastSent?: Date): { canRequest: boolean; remainingTime?: number } {
    if (!lastSent) {
      return { canRequest: true };
    }

    const now = new Date();
    const timeDiff = now.getTime() - lastSent.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    if (minutesDiff >= OTP_CONFIG.RESEND_COOLDOWN_MINUTES) {
      return { canRequest: true };
    }

    const remainingTime = Math.ceil(OTP_CONFIG.RESEND_COOLDOWN_MINUTES - minutesDiff);
    return { canRequest: false, remainingTime };
  }

  // Check if user has exceeded max OTP attempts
  hasExceededMaxAttempts(attempts: number): boolean {
    return attempts >= OTP_CONFIG.MAX_ATTEMPTS;
  }

  // Reset OTP attempts (call this when OTP is verified successfully)
  resetOtpAttempts(): number {
    return 0;
  }

  // Increment OTP attempts
  incrementOtpAttempts(currentAttempts: number): number {
    return currentAttempts + 1;
  }

  // Generate email verification token
  generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate password reset token
  generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate token expiry (1 hour for password reset)
  generateTokenExpiry(hours: number = 1): Date {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + hours);
    return expiry;
  }

  // Validate OTP format
  isValidOtpFormat(otp: string): boolean {
    const otpRegex = /^\d{6}$/;
    return otpRegex.test(otp);
  }

  // Get OTP configuration
  getConfig() {
    return OTP_CONFIG;
  }
}

// Export singleton instance
export const otpService = new OtpService();
