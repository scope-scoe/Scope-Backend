import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {Student} from "../models/student.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { Query } from "../models/query.model.js";
import { EventRegistration } from "../models/registration.model.js";
import { Event } from "../models/event.model.js";
import getCategory from "../ML models/bert.js";
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
    console.log(PRN, email, Name, Roll_Number, Year, Division, Department, password );
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
    console.log(student);
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
  console.log(email, password);
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
        userRole:"student",
        user:loggedInStudent,
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

const createQuery=asyncHandler(async(req,res)=>{
  const {queryText}=req.body;
  if(
      [queryText].some((field)=>!field||field.trim()==="")
    ){
      throw new ApiError(400,"All fields are required")
    }
    console.log(queryText);
    const category=await getCategory(queryText);
    console.log(category);
  const query=await Query.create({
      queryText,
      category,
      student:req.user._id
    })

    const createdQuery=await Query.findById(query._id)
    
      if(!createQuery){
        throw new ApiError(500,"Something went wrong while creating event")
      }

    return res.status(201).json(
      new ApiResponse(200,createdQuery,"Query created Successfully")
    )
})

const registerForEvent=asyncHandler(async(req,res)=>{
  const {eventId}=req.body;
  if(!eventId){
    throw new ApiError(400,"Event ID is required")
  }
  EventRegistration.create({
    student:req.user._id,
    event:eventId
  })
  return res.status(200).json(
    new ApiResponse(200,{},`Registered for event successfully`)
  )
})

const getCreatedQueries=asyncHandler(async(req,res)=>{
  const queries = await Query.find({student:req.user._id})
    .populate("student", "Name email");
  return res
    .status(200)
    .json(new ApiResponse(200, queries, "Your queries fetched successfully"));
})

const getAllRegisteredEvents=asyncHandler(async(req,res)=>{
  const registrations=await EventRegistration.find({student:req.user._id}).populate("event").sort({createdAt:-1});

  const events = registrations.map((reg) => reg.event);

  return res.status(200).json(
    new ApiResponse(200,events,"Events fetched successfully")
  )
})

const getAllEvents=asyncHandler(async(req,res)=>{
  const events=await Event.find().populate("createdBy","Name email").sort({createdAt:-1});
    return res.status(200).json(
      new ApiResponse(200,events,"Events fetched successfully")
    )
})

export {registerStudent,loginStudent,logoutStudent,createQuery,registerForEvent,getCreatedQueries,getAllRegisteredEvents,getAllEvents};