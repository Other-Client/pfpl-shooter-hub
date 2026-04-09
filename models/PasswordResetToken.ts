import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPasswordResetToken extends Document {
  shooterId: mongoose.Types.ObjectId;
  hashedToken: string;
  expiresAt: Date;
  usedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>(
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

PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetToken: Model<IPasswordResetToken> =
  mongoose.models.PasswordResetToken ||
  mongoose.model<IPasswordResetToken>(
    "PasswordResetToken",
    PasswordResetTokenSchema
  );
