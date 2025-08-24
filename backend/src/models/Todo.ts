import mongoose, { Document, Schema } from "mongoose";

export interface ITodo extends Document {
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  category?: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const todoSchema = new Schema<ITodo>(
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
      maxlength: 500,
      default: "",
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      required: true,
    },
    dueDate: {
      type: String, // ISO date string format (YYYY-MM-DD)
      validate: {
        validator: function (v: string) {
          if (!v) return true; // Allow empty due dates
          return /^\d{4}-\d{2}-\d{2}$/.test(v);
        },
        message: "Due date must be in YYYY-MM-DD format",
      },
    },
    category: {
      type: String,
      trim: true,
      default: "",
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
todoSchema.index({ userId: 1 });
todoSchema.index({ userId: 1, completed: 1 });
todoSchema.index({ userId: 1, priority: 1 });
todoSchema.index({ userId: 1, dueDate: 1 });
todoSchema.index({ userId: 1, createdAt: 1 });

export const Todo = mongoose.model<ITodo>("Todo", todoSchema);
