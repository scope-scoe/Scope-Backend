import { asyncHandler } from "../utils/asyncHandler.js";
import { TPC } from "../models/tpc.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Query } from "../models/query.model.js";
export const options={
    httpOnly:true,
    secure:true
}

export const generateAccessAndRefreshTokens=async(TPCId)=>{
  try {
    const tpc=await TPC.findById(TPCId);
    const accessToken=tpc.generateAccessToken();
    const refreshToken=tpc.generateRefreshToken();

    tpc.refreshToken=refreshToken
    await tpc.save({validateBeforeSave:false})

    return {accessToken,refreshToken}
  } catch (error) {
    throw new ApiError(500,"Something went wrong while generating refresh and access tokens")
  }
}

const registerTPC=asyncHandler(
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

const loginTPC=asyncHandler(async(req,res)=>{
  const{email,password}=req.body;
  if(!email){
    throw new ApiError(400,"email is required")
  }

  const tpc=await TPC.findOne({email})
  if(!tpc){
    throw new ApiError(404,"TPC does not exist")
  }

  const isPasswordValid=await tpc.isPasswordCorrect(password)

  if(!isPasswordValid){
    throw new ApiError(401,"Password incorrect")
  }

  const{accessToken,refreshToken}=await  generateAccessAndRefreshTokens(tpc._id);

  const loggedInTPC=await TPC.findById(tpc._id).select("-password -refreshToken");
  console.log(loggedInTPC);
  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options).json(
    new ApiResponse(200,
      {
        userRole:'tpc',
        user:loggedInTPC,
        accessToken,
        refreshToken
      },
      "TPC logged in successfully"
    )
  )

})

const getAllQueries=asyncHandler(async(req,res)=>
{
  const queries = await Query.find()
    .populate("student", "Name email");
  return res
    .status(200)
    .json(new ApiResponse(200, queries, "All queries fetched successfully"));
})

const escalateQuery=asyncHandler(async(req,res)=>{
  const {queryId}=req.body;
  if(!queryId){
    throw new ApiError(400,"Query ID is required")
  }
  const query=await Query.findById(queryId);
  if(!query){
    throw new ApiError(404,"Query not found")
  }
  if(query.status==="Escalated"){
    throw new ApiError(400,"Query is already escalated")
  }
  if(query.status==="Resolved"){
    throw new ApiError(400,"Query is already resolved")
  }
  query.status="Escalated";
  query.escalatedToTPO = true;
  await query.save();
  return res
    .status(200)
    .json(new ApiResponse(200, query, "Query escalated successfully"));
})

const resolveQuery=asyncHandler(async(req,res)=>{
  const {queryId}=req.body;
  if(!queryId){
    throw new ApiError(400,"Query ID is required")
  }
  const query=await Query.findById(queryId);
  if(!query){
    throw new ApiError(404,"Query not found")
  } 
  if(query.status==="Resolved"){
    throw new ApiError(400,"Query is already resolved")
  }
  query.status="Resolved";
  await query.save(); 
  return res
    .status(200)
    .json(new ApiResponse(200, query, "Query resolved successfully"));
})

const logoutTPC=asyncHandler(async(req,res)=>{
  await TPC.findByIdAndUpdate(req.user._id,
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
  .json(new ApiResponse(200,{},"TPC logged Out Successfully"))
})

export {registerTPC,loginTPC,logoutTPC,getAllQueries,escalateQuery,resolveQuery};