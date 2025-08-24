import mongoose, { Document, Schema } from "mongoose";

export interface IHabit extends Document {
  name: string;
  description?: string;
  category?: string;
  frequency: "daily" | "weekly" | "monthly" | "custom";
  targetDays?: number;
  completions: Map<string, boolean>;
  isActive: boolean;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const habitSchema = new Schema<IHabit>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    category: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "custom"],
      default: "daily",
    },
    targetDays: {
      type: Number,
      min: 1,
      max: 365,
      default: 1,
    },
    completions: {
      type: Map,
      of: Boolean,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
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
habitSchema.index({ userId: 1 });
habitSchema.index({ userId: 1, name: 1 });
habitSchema.index({ userId: 1, isActive: 1 });

export const Habit = mongoose.model<IHabit>("Habit", habitSchema);
