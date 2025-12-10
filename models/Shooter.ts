import mongoose, { Schema, Document, Model } from "mongoose";

export interface IShooter extends Document {
  name: string;
  email?: string;
  dominantEye?: "left" | "right";
  passwordHash: string;
  role: "shooter" | "coach" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

const ShooterSchema = new Schema<IShooter>(
  {
    name: { type: String, required: true },
    email: { type: String, index: true, unique: true, sparse: true },
    dominantEye: { type: String, enum: ["left", "right"] },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["shooter", "coach", "admin"],
      default: "shooter",
    },
  },
  { timestamps: true }
);

export const Shooter: Model<IShooter> =
  mongoose.models.Shooter || mongoose.model<IShooter>("Shooter", ShooterSchema);
