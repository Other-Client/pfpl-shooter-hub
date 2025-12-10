// src/models/Shot.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IShot extends Document {
  sessionId: mongoose.Types.ObjectId;
  index: number;
  tsMs: number;
  xMm: number;
  yMm: number;
  score: number;
  ring: number;
  isInnerTen: boolean;
}

const ShotSchema = new Schema<IShot>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: "Session", required: true },
    index: { type: Number, required: true },
    tsMs: { type: Number, required: true },
    xMm: { type: Number, required: true },
    yMm: { type: Number, required: true },
    score: { type: Number, required: true },
    ring: { type: Number, required: true },
    isInnerTen: { type: Boolean, required: true },
  },
  { timestamps: true }
);

export const Shot: Model<IShot> =
  mongoose.models.Shot || mongoose.model<IShot>("Shot", ShotSchema);
