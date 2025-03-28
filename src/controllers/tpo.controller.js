import { asyncHandler } from "../utils/asyncHandler.js";
import {TPO} from "../models/tpo.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerTpo=asyncHandler(
  async(req,res)=>{
    const { email, password } = req.body;
    console.log(email);
    if(
      [email,password].some((field)=>!field||field.trim()==="")
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

export {registerTpo};