import { asyncHandler } from "../utils/asyncHandler.js";
import { TPC } from "../models/tpc.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerTpc=asyncHandler(
  async(req,res)=>{
    const { PRN, email, Name, Roll_Number, Year, Division, Department, password } = req.body;
    console.log(email);
    if(
      [Name,email,PRN,Roll_Number,Year,Division,Department,password].some((field)=>!field||field.trim()==="")
    ){
      throw new ApiError(400,"All fields are required")
    }
    const existedTPC=await TPC.findOne({
      $or:[{Roll_Number},{email},{PRN}]
    })
    console.log(existedTPC);
    if(existedTPC){
      throw new ApiError(409,"TPC already exist");
    }

    const Tpc=await TPC.create({
      Name,
      PRN,
      email,
      Roll_Number,
      Year,
      Division,
      Department,
      password
    })

    const createdTPC=await TPC.findById(Tpc._id).select("-password -refreshToken")

    if(!createdTPC){
      throw new ApiError(500,"Something went wrong while registering the TPC")
    }
    
    return res.status(201).json(
      new ApiResponse(200,createdTPC,"TPC Registered Successfully")
    )
  }
)

export {registerTpc};