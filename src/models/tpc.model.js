import mongoose from "mongoose";

const tpcSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      unique: true
    },
    email : {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true,
      unique : true
    },
    Division: {
      type: String,
      required: true
    },
  },
  { timestamps: true }
);

export const TPC = mongoose.model("TPC", tpcSchema);
