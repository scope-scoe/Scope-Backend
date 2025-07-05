import { asyncHandler } from "../utils/asyncHandler.js";
import {Teacher} from "../models/teacher.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Event } from "../models/event.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {EventRegistration} from "../models/registration.model.js"
import getKeywords from "../ML models/keybert.js";

const options={
    httpOnly:true,
    secure:true,
    sameSite:'None'
}

const generateAccessAndRefreshTokens=async(TeacherId)=>{
  try {
    const teacher=await Teacher.findById(TeacherId);
    const accessToken=teacher.generateAccessToken();
    const refreshToken=teacher.generateRefreshToken();

    teacher.refreshToken=refreshToken
    await teacher.save({validateBeforeSave:false})

    return {accessToken,refreshToken}
  } catch (error) {
    throw new ApiError(500,"Something went wrong while generating refresh and access tokens")
  }
}

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

const loginTeacher=asyncHandler(async(req,res)=>{
  const{email,password}=req.body;
  if(!email){
    throw new ApiError(400,"email is required")
  }

  const teacher=await Teacher.findOne({email})
  if(!teacher){
    throw new ApiError(404,"Teacher does not exist")
  }

  const isPasswordValid=await teacher.isPasswordCorrect(password)

  if(!isPasswordValid){
    throw new ApiError(401,"Password incorrect")
  }

  const{accessToken,refreshToken}=await  generateAccessAndRefreshTokens(teacher._id);

  const loggedInTeacher=await Teacher.findById(teacher._id).select("-password -refreshToken");
  console.log(teacher);
  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options).json(
    new ApiResponse(200,
      {
        userRole:'teacher',
        user:loggedInTeacher,
        accessToken,
        refreshToken
      },
      "Teacher logged in successfully"
    )
  )

})

const logoutTeacher=asyncHandler(async(req,res)=>{
  await Teacher.findByIdAndUpdate(req.user._id,
    {
      $set:{
        refreshToken:undefined
      }
    },
    {
      new:true
    }
  )
  console.log("zatu logout");
  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"Teacher logged Out Successfully"))
})

const createEvent=asyncHandler(async(req,res)=>{
  const {title,description,date,time,venue}=req.body;
  console.log(title, description, date, time, venue);
  if(
      [title,description,date,time,venue].some((field)=>!field||field.trim()==="")
    ){
      throw new ApiError(400,"All fields are required")
    }
  const keywords=await getKeywords(title+" "+description);
  console.log(keywords);
  const posterLocalPath=req.files?.poster[0]?.path;
  console.log(posterLocalPath);
  const poster=await uploadOnCloudinary(posterLocalPath);
  

  const event=await Event.create({
    title,
    description,
    date,
    time,
    keywords,
    venue,
    poster:poster?.url||"",
    createdBy:req.user._id
  })

  const createdEvent=await Event.findById(event._id)

  if(!createEvent){
    throw new ApiError(500,"Something went wrong while creating event")
  }

  return res.status(201).json(
      new ApiResponse(200,createdEvent,"Event Created Successfully")
    )
})

const getAllCreatedEvents=asyncHandler(async(req,res)=>{
  const events=await Event.find({createdBy:req.user._id}).sort({createdAt:-1});
  return res.status(200).json(
    new ApiResponse(200,events,"Events fetched successfully")
  )
})
const getAllRegistrations=asyncHandler(async(req,res)=>{
  const eventId=req.body.eventId;
  const registrations = await EventRegistration.find({
    event: eventId,
  }).populate("student", "Name email");
  return res.status(200,registrations,"Registrations fetched")
})


export {registerTeacher,createEvent,loginTeacher,logoutTeacher,getAllCreatedEvents,getAllRegistrations};