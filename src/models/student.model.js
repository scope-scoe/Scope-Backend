import mongoose from 'mongoose';
const studentSchema = new mongoose.Schema(
  {
    PRN: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    Name: {
      type: String,
      required: true,
    },
    Roll_Number: {
      type: String,
      required: true,
      unique: true,
    },
    Year: {
      type: String,
      required: true,
      enum: [1, 2, 3, 4],
    },
    Division: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Student = mongoose.model('Student', studentSchema);
