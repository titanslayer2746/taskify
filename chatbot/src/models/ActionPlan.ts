import mongoose, { Document, Schema } from "mongoose";

export interface IActionPlan extends Document {
  conversationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  intent: any;
  summary: string;
  category: string;
  actions: Array<{
    type: string;
    count: number;
    preview: any;
    data: any;
    status: "pending" | "executing" | "completed" | "failed";
    error?: string;
  }>;
  executed: boolean;
  executedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const actionPlanSchema = new Schema<IActionPlan>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    intent: {
      type: Schema.Types.Mixed,
    },
    summary: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    actions: [
      {
        type: {
          type: String,
          required: true,
        },
        count: {
          type: Number,
          required: true,
        },
        preview: {
          type: Schema.Types.Mixed,
        },
        data: {
          type: Schema.Types.Mixed,
        },
        status: {
          type: String,
          enum: ["pending", "executing", "completed", "failed"],
          default: "pending",
        },
        error: String,
      },
    ],
    executed: {
      type: Boolean,
      default: false,
    },
    executedAt: Date,
  },
  {
    timestamps: true,
  }
);

actionPlanSchema.index({ userId: 1, createdAt: -1 });
actionPlanSchema.index({ conversationId: 1 });

export const ActionPlan = mongoose.model<IActionPlan>(
  "ActionPlan",
  actionPlanSchema
);
