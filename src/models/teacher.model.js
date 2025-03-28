import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose"
const teacherSchema = new mongoose.Schema({
  TeacherID : {
    type : String,
    required : true,
    unique : true
  },
  Name : {
    type : String,
    required : true,
    trim : true
  },
  email : {
    type : String,
    required : true,
    unique : true,
    lowercase : true
  },
  password : {
    type : String,
    required : true,
  },
  Department : {
    type : String,
    required : true
  },
  refreshToken:{
      type: String
    }
},{timestamps : true})

teacherSchema.pre("save",async function(next){
  if(!this.isModified("password"))return next();
  this.password=await bcrypt.hash(this.password,10);
  next();
})

teacherSchema.methods.isPasswordCorrect=async function(password){
  return await bcrypt.compare(password,this.password);
}

teacherSchema.methods.generateAccessToken=function(){
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

teacherSchema.methods.generateRefreshToken=function(){
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
export const Teacher = mongoose.model('Teacher',teacherSchema)