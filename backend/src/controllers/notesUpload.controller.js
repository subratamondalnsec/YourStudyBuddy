import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { uploadOnCloudinary, deleteFromCloudinary, extractPublicId } from "../utils/cloudinary.js";
import { Note } from "../models/noteUpload.models.js";
import { User } from "../models/user.models.js";
import e from "express";
// function extractPublicId(cloudinaryUrl) {
//   try {
//     const pathname = new URL(cloudinaryUrl).pathname; // e.g. /dwb1jtrym/image/upload/v1746897239/filename.pdf
//     const parts = pathname.split('/');

//     const uploadIndex = parts.indexOf('upload');
//     if (uploadIndex === -1) {
//       throw new Error("Invalid Cloudinary URL: 'upload' not found");
//     }

//     // All parts after "upload"
//     const afterUpload = parts.slice(uploadIndex + 1);

//     // Remove version if it starts with "v" and a number
//     if (/^v\d+$/.test(afterUpload[0])) {
//       afterUpload.shift(); // remove version
//     }

//     const filenameWithExt = afterUpload.join('/'); // now just the file path
//     const lastDot = filenameWithExt.lastIndexOf('.');
//     return lastDot !== -1
//       ? filenameWithExt.substring(0, lastDot)
//       : filenameWithExt;

//   } catch (err) {
//     console.error("Error extracting public ID:", err.message);
//     return null;
//   }
// }

const uploadNotes = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Please upload a file");
  }

  
console.log(req.user._id);
  const result = await uploadOnCloudinary(req.file.path, "notes");
  if (!result) {
    throw new ApiError(500, "File upload failed");
  }
  const { fileName, subject } = req.body;
  if (!fileName || !subject) {
    throw new ApiError(400, "Please provide file name and subject");
  }
  console.log(result);
  

  const note = await Note.create({
    user: req.user._id,
    fileName,
    fileType: req.file.mimetype,
    fileUrl: result.url,
    subject,
  });

  if (!note) {
    throw new ApiError(500, "File upload failed");
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  user.notes.push(note._id);
  if(!user.subjects.includes(subject)){
    user.subjects.push(subject);
  }
  await user.save()
  res.status(200).json(new ApiResponce(200, note, "File uploaded successfully"));
});

const getNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({ user: req.user._id , subject: req.body.subject }).populate("user", "name email");

  if (notes.length === 0) {
    throw new ApiError(404, "No notes found");
  }

  // console.log("Fetched Notes:", notes);
  
  res.status(200).json(new ApiResponce(200, notes, "Notes fetched successfully"));
});

const getsubjects = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const subjects = user.subjects;
  // console.log("Fetched Subjects:", subjects);
  
  res.status(200).json(new ApiResponce(200, subjects, "Subjects fetched successfully"));
});


const deleteNote = asyncHandler(async (req, res) => {
  console.log(req.body);
  
  const note = await Note.findById(req.body.noteId);  
  if (!note) {
    throw new ApiError(404, "Note not found");
  }
  const cloudinaryURL = note.fileUrl;
  const publicId = extractPublicId(cloudinaryURL);
  console.log(publicId);
  if (!publicId) {
    throw new ApiError(404, "Public ID not found");
  }
  await deleteFromCloudinary(publicId);
await Note.findByIdAndDelete(req.body.noteId);
 await User.updateMany({}, { $pull: { notes: req.body.noteId } });  
  res.status(200).json(new ApiResponce(200, null, "Note deleted successfully"));
}); 


const deleteSubject = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const subject = req.body.subject;
  user.subjects = user.subjects.filter((sub) => sub !== subject);
  await user.save();
  const notes = await Note.find({ user: req.user._id, subject });
  if(notes.length <= 0 ){
    throw new ApiError(404, "No notes found for this subject");
  }
  notes.forEach(async (note)=>{
    const cloudinaaryUrl = note.fileUrl;
    const publicId = extractPublicId(cloudinaaryUrl);
    console.log(publicId);
    if (!publicId) {
      throw new ApiError(404, "Public ID not found");
    }
    
    await deleteFromCloudinary(publicId);
    await Note.deleteOne({ _id: note._id });
  })
  
  
  res.status(200).json(new ApiResponce(200, null, "Subject deleted successfully"));
});

  


export { uploadNotes, getNotes, getsubjects, deleteNote, deleteSubject };
