import mongoose, { Document, Schema } from "mongoose";

export const PROJECT_STATUSES = [
  "not-started",
  "in-progress",
  "done",
  "archive",
] as const;
export const PROJECT_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type ProjectPriority = (typeof PROJECT_PRIORITIES)[number];

export interface IProject extends Document {
  title: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
  dueDate?: string;
  tags: string[];
  estimatedHours?: number;
  actualHours?: number;
  color?: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    status: {
      type: String,
      enum: PROJECT_STATUSES,
      default: "not-started",
      required: true,
    },
    priority: {
      type: String,
      enum: PROJECT_PRIORITIES,
      default: "medium",
      required: true,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    dueDate: {
      type: String, // YYYY-MM-DD
      validate: {
        validator: (v: string) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v),
        message: "Due date must be in YYYY-MM-DD format",
      },
    },
    tags: {
      type: [{ type: String, trim: true, maxlength: 30 }],
      default: [],
      validate: {
        validator: (v: string[]) => v.length <= 10,
        message: "A project can have at most 10 tags",
      },
    },
    estimatedHours: { type: Number, min: 0 },
    actualHours: { type: Number, min: 0 },
    color: {
      type: String,
      validate: {
        validator: (v: string) => !v || /^#[0-9a-fA-F]{6}$/.test(v),
        message: "Colour must be a hex value like #1F3326",
      },
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

projectSchema.index({ userId: 1, createdAt: -1 });
projectSchema.index({ userId: 1, status: 1 });

export const Project = mongoose.model<IProject>("Project", projectSchema);
