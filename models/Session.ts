// src/models/Session.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISessionSummary {
  totalScore: number;
  averageScore: number;
  shotCount: number;
  groupSizeMm?: number;
  offsetXMm?: number;
  offsetYMm?: number;
}

export interface ISession extends Document {
  shooterId: mongoose.Types.ObjectId;
  startedAt: Date;
  finishedAt?: Date;
  gunPreset: string;
  targetType: string;
  settings: any; // keep loose, or define interface
  summary?: ISessionSummary;
  heatmapUrl?: string;
  targetSnapshotUrl?: string;
}

const SessionSummarySchema = new Schema<ISessionSummary>(
  {
    totalScore: Number,
    averageScore: Number,
    shotCount: Number,
    groupSizeMm: Number,
    offsetXMm: Number,
    offsetYMm: Number,
  },
  { _id: false }
);

const SessionSchema = new Schema<ISession>(
  {
    shooterId: { type: Schema.Types.ObjectId, ref: "Shooter", required: true },
    startedAt: { type: Date, required: true },
    finishedAt: { type: Date },
    gunPreset: { type: String, required: true },
    targetType: { type: String, required: true },
    settings: { type: Schema.Types.Mixed },
    summary: SessionSummarySchema,
    heatmapUrl: { type: String },
    targetSnapshotUrl: { type: String },
  },
  { timestamps: true }
);

export const Session: Model<ISession> =
  mongoose.models.Session ||
  mongoose.model<ISession>("Session", SessionSchema);
