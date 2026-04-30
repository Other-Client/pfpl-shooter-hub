import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICoachRequest extends Document {
  shooterId: mongoose.Types.ObjectId;
  coachId: mongoose.Types.ObjectId;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const CoachRequestSchema = new Schema<ICoachRequest>(
  {
    shooterId: { type: Schema.Types.ObjectId, ref: "Shooter", required: true },
    coachId: { type: Schema.Types.ObjectId, ref: "Shooter", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

CoachRequestSchema.index({ shooterId: 1, coachId: 1 }, { unique: true });

if (process.env.NODE_ENV !== "production" && mongoose.models.CoachRequest) {
  delete (mongoose.models as Record<string, unknown>).CoachRequest;
}

export const CoachRequest: Model<ICoachRequest> =
  mongoose.models.CoachRequest ||
  mongoose.model<ICoachRequest>("CoachRequest", CoachRequestSchema);
