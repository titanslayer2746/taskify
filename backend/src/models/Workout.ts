import mongoose, { Document, Schema } from "mongoose";

export interface IExercise extends Document {
  id: string;
  name: string;
  sets: number;
  reps: number;
  duration?: number; // in minutes
  notes?: string;
}

export interface IWeeklySchedule {
  sunday: string[];
  monday: string[];
  tuesday: string[];
  wednesday: string[];
  thursday: string[];
  friday: string[];
  saturday: string[];
}

export interface IWorkoutPlan extends Document {
  name: string;
  description: string;
  exercises: IExercise[];
  weeklySchedule: IWeeklySchedule;
  duration: number; // in weeks
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// New WorkoutEntry interface for individual workout sessions
export interface IWorkoutEntry extends Document {
  date: string;
  type: string;
  category: "cardio" | "strength" | "flexibility" | "sports" | "other";
  duration: number; // in minutes
  intensity: "low" | "medium" | "high";
  calories?: number;
  distance?: number; // in meters
  sets?: Array<{
    exercise: string;
    reps?: number;
    weight?: number;
    duration?: number;
  }>;
  notes?: string;
  location?: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Exercise subdocument schema
const exerciseSchema = new Schema<IExercise>(
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
    sets: {
      type: Number,
      required: true,
      min: 1,
      max: 50,
    },
    reps: {
      type: Number,
      required: true,
      min: 1,
      max: 1000,
    },
    duration: {
      type: Number,
      min: 1,
      max: 300, // 5 hours max
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { _id: false }
);

// Weekly schedule subdocument schema
const weeklyScheduleSchema = new Schema<IWeeklySchedule>(
  {
    sunday: [
      {
        type: String,
        required: true,
      },
    ],
    monday: [
      {
        type: String,
        required: true,
      },
    ],
    tuesday: [
      {
        type: String,
        required: true,
      },
    ],
    wednesday: [
      {
        type: String,
        required: true,
      },
    ],
    thursday: [
      {
        type: String,
        required: true,
      },
    ],
    friday: [
      {
        type: String,
        required: true,
      },
    ],
    saturday: [
      {
        type: String,
        required: true,
      },
    ],
  },
  { _id: false }
);

// Main workout plan schema
const workoutPlanSchema = new Schema<IWorkoutPlan>(
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
    exercises: [exerciseSchema],
    weeklySchedule: {
      type: weeklyScheduleSchema,
      required: true,
      default: {
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
      },
    },
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

// Workout entry schema for individual workout sessions
const workoutEntrySchema = new Schema<IWorkoutEntry>(
  {
    date: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    category: {
      type: String,
      required: true,
      enum: ["cardio", "strength", "flexibility", "sports", "other"],
      default: "other",
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
      max: 1440, // 24 hours max
    },
    intensity: {
      type: String,
      required: true,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    calories: {
      type: Number,
      min: 0,
      max: 10000,
    },
    distance: {
      type: Number,
      min: 0,
      max: 1000000, // 1000km max
    },
    sets: [
      {
        exercise: {
          type: String,
          required: true,
          trim: true,
          maxlength: 100,
        },
        reps: {
          type: Number,
          min: 1,
          max: 10000,
        },
        weight: {
          type: Number,
          min: 0,
          max: 10000, // 10 tons max
        },
        duration: {
          type: Number,
          min: 1,
          max: 300,
        },
      },
    ],
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 200,
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
workoutPlanSchema.index({ userId: 1 });
workoutPlanSchema.index({ userId: 1, createdAt: -1 }); // For chronological ordering
workoutPlanSchema.index({ userId: 1, name: 1 }); // For name-based queries

// Indexes for workout entries
workoutEntrySchema.index({ userId: 1 });
workoutEntrySchema.index({ userId: 1, date: -1 }); // For chronological ordering
workoutEntrySchema.index({ userId: 1, category: 1 }); // For category-based queries
workoutEntrySchema.index({ userId: 1, type: 1 }); // For type-based queries

export const WorkoutPlan = mongoose.model<IWorkoutPlan>(
  "WorkoutPlan",
  workoutPlanSchema
);

export const WorkoutEntry = mongoose.model<IWorkoutEntry>(
  "WorkoutEntry",
  workoutEntrySchema
);
