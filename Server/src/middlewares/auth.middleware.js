import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

const verifyToken = asyncHandler(async (req,_,next)=>{

  try {
      const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
  
      if(!token){
          throw new ApiError(401,"No accessToken found")
      }
  
      const decoded =  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
  
      const user = await  User.findById(decoded?._id).select("-password -refreshToken")
  
      if (!user) {
            
        throw new ApiError(401, "Invalid Access Token")
    }
      req.user = user
      next()    
  } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Access Token")
  }
})

export {verifyToken}
