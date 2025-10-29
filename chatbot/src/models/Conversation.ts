import mongoose, { Document, Schema } from "mongoose";

export interface IMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export interface IConversation extends Document {
  userId: mongoose.Types.ObjectId;
  messages: IMessage[];
  intent?: any;
  planId?: string;
  status: "active" | "completed" | "abandoned";
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const conversationSchema = new Schema<IConversation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    messages: [messageSchema],
    intent: {
      type: Schema.Types.Mixed,
    },
    planId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "completed", "abandoned"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ userId: 1, createdAt: -1 });
conversationSchema.index({ userId: 1, status: 1 });

export const Conversation = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema
);
