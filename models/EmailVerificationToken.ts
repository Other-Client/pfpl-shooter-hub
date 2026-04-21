import mongoose, { Document, Model, Schema } from "mongoose";

export interface IEmailVerificationToken extends Document {
  shooterId: mongoose.Types.ObjectId;
  hashedToken: string;
  expiresAt: Date;
  usedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const EmailVerificationTokenSchema = new Schema<IEmailVerificationToken>(
  {
    shooterId: {
      type: Schema.Types.ObjectId,
      ref: "Shooter",
      required: true,
      index: true,
    },
    hashedToken: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

EmailVerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const EmailVerificationToken: Model<IEmailVerificationToken> =
  mongoose.models.EmailVerificationToken ||
  mongoose.model<IEmailVerificationToken>(
    "EmailVerificationToken",
    EmailVerificationTokenSchema
  );
