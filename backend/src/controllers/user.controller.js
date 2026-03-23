import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { User } from "../models/user.models.js";
import mongoose from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { decode } from "jsonwebtoken";

const getRefreshAndAccessToken = async (userid) => {
  try {
    const user = await  User.findById(userid);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });
    // console.log("refreshToken", refreshToken);
    // console.log("accessToken", accessToken);
    
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      error?.messege || "Error while generating access or refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const {  email, name, password } = req.body;
  const username = email.split("@")[0];
  if (
    [username, email, name, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existuser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existuser) {
    throw new ApiError(409, "Username or email already exists");
  }


  const user = await User.create({
    name,
    email,
    password,
    username: username.toLowerCase(),
  });

  const createduser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createduser) {
    throw new ApiError(500, "Something Went Wrong in server");
  }

  return res
    .status(201)
    .json(new ApiResponce(200, createduser, "Successfully registered"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!(email)) {
    throw new ApiError(401, "Username Or Email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordvalid = await user.isPasswordCorrect(password);

  if (!isPasswordvalid) {
    throw new ApiError(401, "Password is incorrect");
  }

  const { accessToken, refreshToken } = await  getRefreshAndAccessToken(user._id);
  if (!accessToken || !refreshToken) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }

  const loggedinUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponce(
        200,
        { user: loggedinUser, accessToken, refreshToken },
        "User Logged in Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponce(200, {}, "Successfully Logged Out"));
});

const refreshAuthToken = asyncHandler(async (req, res) => {
  //get the refresh token from cookies
  //decode the refreshtoken and get the _id
  //compare the user refresh token with the saved one
  // generate new access and refresh token
  //send the responce

  const incomingrefreshtoken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingrefreshtoken) {
    throw new ApiError(401, "No refresh token found");
  }
  try {
    const decoded = jwt.verify(
      incomingrefreshtoken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = User.findById(decoded._id);

    if (!user) {
      throw new ApiError(401, "invalid refresh token");
    }

    if (incomingrefreshtoken !== user.refreshToken) {
      throw new ApiError(401, "invalid refresh token");
    }

    const { accessToken, newrefreshToken } = getRefreshAndAccessToken(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", accessToken, options)
      .clearCookie("refreshToken", newrefreshToken, options)
      .json(
        new ApiResponce(
          200,
          {
            accessToken,
            refreshToken: newrefreshToken,
          },
          "new RefreshToken and AccessToken Generated"
        )
      );
  } catch (error) {
    throw new ApiError(
      400,
      error?.messege || "Something Went wrong while generating new tokens"
    );
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(200, res.user, "User fetched Successfully");
});


export {
  registerUser,
  logoutUser,
  loginUser,
  refreshAuthToken,
  getCurrentUser,
};
