import mongoose, { Document, Schema } from "mongoose";

export interface IJournal extends Document {
  title: string;
  content?: string;
  tags: string[];
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const journalSchema = new Schema<IJournal>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      default: "",
    },
    content: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    tags: [
      {
        type: String,
        trim: true,
        validate: {
          validator: function (v: string) {
            return v.length > 0 && v.length <= 50; // Tag length validation
          },
          message: "Tags must be between 1 and 50 characters",
        },
      },
    ],
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
journalSchema.index({ userId: 1 });
journalSchema.index({ userId: 1, createdAt: -1 }); // For chronological ordering
journalSchema.index({ userId: 1, updatedAt: -1 }); // For recent updates
journalSchema.index({ userId: 1, tags: 1 }); // For tag-based queries
journalSchema.index({
  userId: 1,
  title: "text",
  content: "text",
}); // For text search

// Text search index for title and content
journalSchema.index(
  {
    title: "text",
    content: "text",
  },
  {
    weights: {
      title: 10,
      content: 5,
    },
  }
);

export const Journal = mongoose.model<IJournal>("Journal", journalSchema);
