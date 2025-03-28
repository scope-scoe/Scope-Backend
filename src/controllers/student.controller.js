import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {Student} from "../models/student.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"

export const options={
    httpOnly:true,
    secure:true
  }

export const generateAccessAndRefreshTokens=async(StudentId)=>{
  try {
    const student=await Student.findById(StudentId);
    const accessToken=student.generateAccessToken();
    const refreshToken=student.generateRefreshToken();

    student.refreshToken=refreshToken
    await student.save({validateBeforeSave:false})

    return {accessToken,refreshToken}
  } catch (error) {
    throw new ApiError(500,"Something went wrong while generating refresh and access tokens")
  }
}

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

const loginStudent=asyncHandler(async(req,res)=>{
  const{email,password}=req.body;
  if(!email){
    throw new ApiError(400,"email is required")
  }

  const student=await Student.findOne({email})
  if(!student){
    throw new ApiError(404,"Student does not exist")
  }

  const isPasswordValid=await student.isPasswordCorrect(password)

  if(!isPasswordValid){
    throw new ApiError(401,"Password incorrect")
  }

  const{accessToken,refreshToken}=await  generateAccessAndRefreshTokens(student._id);

  const loggedInStudent=await Student.findById(student._id).select("-password -refreshToken");
  console.log(student);
  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options).json(
    new ApiResponse(200,
      {
        Student:loggedInStudent,
        accessToken,
        refreshToken
      },
      "Student logged in successfully"
    )
  )

})

const logoutStudent=asyncHandler(async(req,res)=>{
  await Student.findByIdAndUpdate(req.user._id,
    {
      $set:{
        refreshToken:undefined
      }
    },
    {
      new:true
    }
  )
  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"Student logged Out Successfully"))
})
export {registerStudent,loginStudent,logoutStudent};