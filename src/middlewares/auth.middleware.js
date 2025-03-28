import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Student } from "../models/student.model.js";
import { Teacher } from "../models/teacher.model.js";
import {TPC} from "../models/tpc.model.js"
import {TPO} from "../models/tpo.model.js"



export const verifyJWT=asyncHandler(async(req,res,next)=>{
  try {
    const token=req.cookies?.accessToken;
    if(!token){
      throw new ApiError(401,"Unauthorized request")
    }
    const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
  
    const userType=decodedToken.userType;
    let user;
    console.log(userType);
    if(userType==="Student"){
      user=await Student.findById(decodedToken?._id).select("-password -refreshToken")
    }else if(userType==="Teacher"){
      user=await Teacher.findById(decodedToken?._id).select("-password -refreshToken")
    }else if(userType==="TPC"){
      user=await TPC.findById(decodedToken?._id).select("-password -refreshToken")
    }else if(userType==="TPO"){
      user=await TPO.findById(decodedToken?._id).select("-password -refreshToken")
    }
    console.log(user);
    if(!user){
      throw new ApiError(401,"Invalid Access Token")
    }
    req.user=user;
    next();
  } catch (error) {
    throw new ApiError(401,error)
  }
})