import jwt from "jsonwebtoken";
import mongoose from "mongoose"
new tpoSchema = new mongoose.Schema({
  email : {
    type : String,
    required : true,
    unique : true
  },
  password : {
    type : String,
    required : true,
    unique : true
  },
  refreshToken:{
      type: String
  }
},{timestamps:true})

tpoSchema.pre("save",async function(next){
  if(!this.isModified("password"))return next();
  this.password=await bcrypt.hash(this.password,10);
  next();
})

tpoSchema.methods.isPasswordCorrect=async function(password){
  return await bcrypt.compare(password,this.password);
}

tpoSchema.methods.generateAccessToken=function(){
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

tpoSchema.methods.generateRefreshToken=function(){
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

export const TPO = mongoose.model('TPO',tpoSchema)