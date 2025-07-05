import { asyncHandler } from "../utils/asyncHandler.js";
import {TPO} from "../models/tpo.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Query } from "../models/query.model.js";

export const options={
    httpOnly:true,
    secure:true
}

export const generateAccessAndRefreshTokens=async(TPOId)=>{
  try {
    const tpo=await TPO.findById(TPOId);
    const accessToken=tpo.generateAccessToken();
    const refreshToken=tpo.generateRefreshToken();

    tpo.refreshToken=refreshToken
    await tpo.save({validateBeforeSave:false})

    return {accessToken,refreshToken}
  } catch (error) {
    throw new ApiError(500,"Something went wrong while generating refresh and access tokens")
  }
}

const registerTPO=asyncHandler(
  async(req,res)=>{
    const { Name,email, password } = req.body;
    console.log(email);
    if(
      [Name,email,password].some((field)=>!field||field.trim()==="")
    ){
      throw new ApiError(400,"All fields are required")
    }
    const existedTPO=await TPO.findOne({
      $or:[{email}]
    })
    console.log(existedTPO);
    if(existedTPO){
      throw new ApiError(409,"TPO already exist");
    }

    const Tpo=await TPO.create({
      Name,
      email,
      password
    })

    const createdTPO=await TPO.findById(Tpo._id).select("-password -refreshToken")

    if(!createdTPO){
      throw new ApiError(500,"Something went wrong while registering the TPO")
    }
    
    return res.status(201).json(
      new ApiResponse(200,createdTPO,"TPO Registered Successfully")
    )
  }
)

const loginTPO=asyncHandler(async(req,res)=>{
  const{email,password}=req.body;
  if(!email){
    throw new ApiError(400,"email is required")
  }

  const tpo=await TPO.findOne({email})
  if(!tpo){
    throw new ApiError(404,"TPO does not exist")
  }

  const isPasswordValid=await tpo.isPasswordCorrect(password)

  if(!isPasswordValid){
    throw new ApiError(401,"Password incorrect")
  }

  const{accessToken,refreshToken}=await  generateAccessAndRefreshTokens(tpo._id);

  const loggedInTPO=await TPO.findById(tpo._id).select("-password -refreshToken");
  console.log(loggedInTPO);
  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options).json(
    new ApiResponse(200,
      {
        userRole:'tpo',
        user:loggedInTPO,
        accessToken,
        refreshToken
      },
      "TPO logged in successfully"
    )
  )

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

const logoutTPO=asyncHandler(async(req,res)=>{
  await TPO.findByIdAndUpdate(req.user._id,
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
  .json(new ApiResponse(200,{},"TPO logged Out Successfully"))
})

export {registerTPO,loginTPO,logoutTPO,resolveQuery};