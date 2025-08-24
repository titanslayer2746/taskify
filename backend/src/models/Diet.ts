import mongoose, { Document, Schema } from "mongoose";

export interface IFood extends Document {
  id: string;
  name: string;
  quantity: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface IMeal extends Document {
  id: string;
  name: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  foods: IFood[];
  calories: number;
  notes?: string;
}

export interface IDietPlan extends Document {
  name: string;
  description: string;
  meals: IMeal[];
  duration: number; // in weeks
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Food subdocument schema
const foodSchema = new Schema<IFood>(
  {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    quantity: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    calories: {
      type: Number,
      required: true,
      min: 0,
      max: 10000,
    },
    protein: {
      type: Number,
      min: 0,
      max: 1000,
    },
    carbs: {
      type: Number,
      min: 0,
      max: 1000,
    },
    fat: {
      type: Number,
      min: 0,
      max: 1000,
    },
  },
  { _id: false }
);

// Meal subdocument schema
const mealSchema = new Schema<IMeal>(
  {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    type: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },
    foods: [foodSchema],
    calories: {
      type: Number,
      required: true,
      min: 0,
      max: 10000,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { _id: false }
);

// Main diet plan schema
const dietPlanSchema = new Schema<IDietPlan>(
  {
    name: {
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
    meals: [mealSchema],
    duration: {
      type: Number,
      required: true,
      min: 1,
      max: 52, // 1 year max
      default: 4,
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
dietPlanSchema.index({ userId: 1 });
dietPlanSchema.index({ userId: 1, createdAt: -1 }); // For chronological ordering
dietPlanSchema.index({ userId: 1, name: 1 }); // For name-based queries

export const DietPlan = mongoose.model<IDietPlan>("DietPlan", dietPlanSchema);
