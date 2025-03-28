import { asyncHandler } from "../utils/asyncHandler.js";
import {Teacher} from "../models/teacher.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerTeacher=asyncHandler(
  async(req,res)=>{
    const { TeacherID, email, Name, Department, password } = req.body;
    console.log(email);
    if(
      [TeacherID,Department,Name,email,password].some((field)=>!field||field.trim()==="")
    ){
      throw new ApiError(400,"All fields are required")
    }
    const existedTeacher=await Teacher.findOne({
      $or:[{email},{TeacherID}]
    })
    console.log(existedTeacher);
    if(existedTeacher){
      throw new ApiError(409,"Teacher already exist");
    }

    const teacher=await Teacher.create({
      TeacherID, 
      email, 
      Name, 
      Department, 
      password
    })

    const createdTeacher=await Teacher.findById(teacher._id).select("-password -refreshToken")

    if(!createdTeacher){
      throw new ApiError(500,"Something went wrong while registering the Teacher")
    }
    
    return res.status(201).json(
      new ApiResponse(200,createdTeacher,"Teacher Registered Successfully")
    )
  }
)

const createEvent=asyncHandler(
  async(req,res)=>{
    
  }
)

export {registerTeacher,createEvent};