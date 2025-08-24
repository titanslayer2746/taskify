import mongoose, { Document, Schema } from "mongoose";

export interface ISleepEntry extends Document {
  checkIn: string; // ISO timestamp
  checkOut?: string; // ISO timestamp (optional for active sessions)
  duration?: number; // in minutes (calculated when checkOut is set)
  notes?: string;
  quality?: 1 | 2 | 3 | 4 | 5; // Sleep quality rating
  date: string; // YYYY-MM-DD format
  isActive?: boolean; // true if session is ongoing
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const sleepEntrySchema = new Schema<ISleepEntry>(
  {
    checkIn: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return !isNaN(Date.parse(v)); // Valid ISO timestamp
        },
        message: "Check-in must be a valid ISO timestamp",
      },
    },
    checkOut: {
      type: String,
      required: false,
      validate: {
        validator: function (v: string) {
          if (!v) return true; // Allow empty/undefined
          return !isNaN(Date.parse(v)); // Valid ISO timestamp
        },
        message: "Check-out must be a valid ISO timestamp",
      },
    },
    duration: {
      type: Number,
      required: false,
      min: 1, // Minimum 1 minute
      max: 1440, // Maximum 24 hours (24 * 60 minutes)
      validate: {
        validator: function (v: number) {
          if (!v) return true; // Allow empty/undefined
          if (!this.checkOut) return true; // Skip validation if no checkout

          // Ensure duration is calculated correctly
          const checkIn = new Date(this.checkIn);
          const checkOut = new Date(this.checkOut!); // We know it exists here due to the check above
          const calculatedDuration = Math.round(
            (checkOut.getTime() - checkIn.getTime()) / (1000 * 60)
          );
          return Math.abs(v - calculatedDuration) <= 1; // Allow 1 minute tolerance
        },
        message:
          "Duration must match the time difference between check-in and check-out",
      },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    quality: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      min: 1,
      max: 5,
      validate: {
        validator: function (v: number) {
          return [1, 2, 3, 4, 5].includes(v);
        },
        message: "Quality must be between 1 and 5",
      },
    },
    date: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return /^\d{4}-\d{2}-\d{2}$/.test(v);
        },
        message: "Date must be in YYYY-MM-DD format",
      },
    },
    isActive: {
      type: Boolean,
      default: true, // Default to active when creating
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
sleepEntrySchema.index({ userId: 1 });
sleepEntrySchema.index({ userId: 1, date: -1 }); // For chronological ordering
sleepEntrySchema.index({ userId: 1, checkIn: -1 }); // For check-in time queries
sleepEntrySchema.index({ userId: 1, quality: 1 }); // For quality-based queries
sleepEntrySchema.index({ userId: 1, createdAt: -1 }); // For recent entries

export const SleepEntry = mongoose.model<ISleepEntry>(
  "SleepEntry",
  sleepEntrySchema
);
