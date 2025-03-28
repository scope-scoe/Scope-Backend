import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {Student} from "../models/student.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerStudent=asyncHandler(
  async(req,res)=>{
    const { PRN, email, Name, Roll_Number, Year, Division, Department, password } = req.body;
    console.log(email);
    if(
      [Name,email,PRN,Roll_Number,Year,Division,Department,password].some((field)=>!field||field.trim()==="")
    ){
      throw new ApiError(400,"All fields are required")
    }
    const existedStudent=await Student.findOne({
      $or:[{Roll_Number},{email},{PRN}]
    })
    console.log(existedStudent);
    if(existedStudent){
      throw new ApiError(409,"Student already exist");
    }

    const student=await Student.create({
      Name,
      PRN,
      email,
      Roll_Number,
      Year,
      Division,
      Department,
      password
    })

    const createdStudent=await Student.findById(student._id).select("-password -refreshToken")

    if(!createdStudent){
      throw new ApiError(500,"Something went wrong while registering the student")
    }
    
    return res.status(201).json(
      new ApiResponse(200,createdStudent,"Student Registered Successfully")
    )

  }
)

export {registerStudent};