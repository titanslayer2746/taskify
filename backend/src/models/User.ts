import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  // Basic fields
  email: string;
  password: string;
  name: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Email verification
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;

  // OTP verification
  otp?: string;
  otpExpires?: Date;
  otpAttempts: number;
  otpLastSent?: Date;

  // Password reset
  passwordResetToken?: string;
  passwordResetExpires?: Date;

  // Security
  failedLoginAttempts: number;
  accountLockedUntil?: Date;
  twoFactorEnabled: boolean;

  // Profile
  profilePicture?: string;
  bio?: string;
  phoneNumber?: string;

  // Audit
  lastPasswordChange?: Date;
  loginHistory: Array<{
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
  }>;

  // Methods
  isAccountLocked(): boolean;
  isOtpValid(otp: string): boolean;
  isPasswordResetTokenValid(token: string): boolean;
  addLoginHistory(ipAddress?: string, userAgent?: string): void;
}

const userSchema = new Schema<IUser>(
  {
    // Basic fields
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },

    // Email verification
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
    },

    // OTP verification
    otp: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
    otpLastSent: {
      type: Date,
      default: null,
    },

    // Password reset
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },

    // Security
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    accountLockedUntil: {
      type: Date,
      default: null,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    // Profile
    profilePicture: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: null,
      maxlength: 500,
    },
    phoneNumber: {
      type: String,
      default: null,
    },

    // Audit
    lastPasswordChange: {
      type: Date,
      default: null,
    },
    loginHistory: [{
      timestamp: {
        type: Date,
        required: true,
      },
      ipAddress: {
        type: String,
        default: null,
      },
      userAgent: {
        type: String,
        default: null,
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });
userSchema.index({ otp: 1 });
userSchema.index({ accountLockedUntil: 1 });

// Pre-save middleware to update lastPasswordChange when password changes
userSchema.pre('save', function(next) {
  if (this.isModified('password')) {
    this.lastPasswordChange = new Date();
  }
  next();
});

// Method to check if account is locked
userSchema.methods.isAccountLocked = function() {
  return this.accountLockedUntil && this.accountLockedUntil > new Date();
};

// Method to check if OTP is valid
userSchema.methods.isOtpValid = function(otp: string) {
  return this.otp === otp && this.otpExpires && this.otpExpires > new Date();
};

// Method to check if password reset token is valid
userSchema.methods.isPasswordResetTokenValid = function(token: string) {
  return this.passwordResetToken === token && 
         this.passwordResetExpires && 
         this.passwordResetExpires > new Date();
};

// Method to add login history entry
userSchema.methods.addLoginHistory = function(ipAddress?: string, userAgent?: string) {
  this.loginHistory.push({
    timestamp: new Date(),
    ipAddress,
    userAgent,
  });
  
  // Keep only last 10 login entries
  if (this.loginHistory.length > 10) {
    this.loginHistory = this.loginHistory.slice(-10);
  }
};

export const User = mongoose.model<IUser>("User", userSchema);
