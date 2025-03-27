import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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
    refreshToken:{
      type: String
    }
  },
  { timestamps: true }
);

tpcSchema.pre("save",async function(next){
  if(!this.isModified("password"))return next();
  this.password=await bcrypt.hash(this.password,10);
  next();
})

tpcSchema.methods.isPasswordCorrect=async function(password){
  return await bcrypt.compare(password,this.password);
}

tpcSchema.methods.generateAccessToken=function(){
  return jwt.sign(
    {
      _id:this._id,
      email:this.email
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

tpcSchema.methods.generateRefreshToken=function(){
  return jwt.sign(
    {
      _id:this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

export const TPC = mongoose.model("TPC", tpcSchema);
