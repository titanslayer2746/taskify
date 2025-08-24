import mongoose, { Document, Schema } from "mongoose";

export interface IFinance extends Document {
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  tags: string[];
  date: string;
  description?: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const financeSchema = new Schema<IFinance>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01, // Minimum amount validation
      validate: {
        validator: function (v: number) {
          return v > 0; // Amount must be positive
        },
        message: "Amount must be greater than 0",
      },
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: [
        // Income categories
        "Salary",
        "Freelance",
        "Investment",
        "Business",
        // Expense categories
        "Food & Dining",
        "Transportation",
        "Shopping",
        "Entertainment",
        "Healthcare",
        "Education",
        "Bills & Utilities",
        "Housing",
        "Other",
      ],
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 50,
        validate: {
          validator: function (v: string) {
            return v.length > 0 && v.length <= 50; // Tag length validation
          },
          message: "Tags must be between 1 and 50 characters",
        },
      },
    ],
    date: {
      type: String, // ISO date string format (YYYY-MM-DD)
      required: true,
      validate: {
        validator: function (v: string) {
          return /^\d{4}-\d{2}-\d{2}$/.test(v);
        },
        message: "Date must be in YYYY-MM-DD format",
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
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
financeSchema.index({ userId: 1 });
financeSchema.index({ userId: 1, type: 1 }); // For filtering by income/expense
financeSchema.index({ userId: 1, category: 1 }); // For category-based queries
financeSchema.index({ userId: 1, date: -1 }); // For chronological ordering
financeSchema.index({ userId: 1, amount: -1 }); // For amount-based sorting
financeSchema.index({ userId: 1, tags: 1 }); // For tag-based queries
financeSchema.index({ userId: 1, createdAt: -1 }); // For recent entries

export const Finance = mongoose.model<IFinance>("Finance", financeSchema);
