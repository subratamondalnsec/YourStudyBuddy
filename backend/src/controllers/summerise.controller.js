import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { uploadOnCloudinary, deleteFromCloudinary , extractPublicId ,downloadFromCloudinary,extractFilenameFromUrl} from "../utils/cloudinary.js";
import { Note } from "../models/noteUpload.models.js";
import { User } from "../models/user.models.js";
import { Summary } from "../models/summerisation.models.js";
import { countwords, extractTextFromFile } from "../utils/functions.js";
import fs from "fs";
import path from "path";import { dirname} from "path";
import { callGeminiTextGenAPI } from "../utils/gemini.js";
import { count } from "console";
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const handleDownloadFile =  async (fileUrl) => {
    const filePath = await downloadFromCloudinary(fileUrl, extractFilenameFromUrl(fileUrl));
    return filePath;
}

const calcPercentRangeString = (min,max,org,) =>{
    const minRange = Math.floor((min/100)*org);
    const maxRange = Math.floor((max/100)*org);
    return `${minRange} to ${maxRange}`;

}

const getSummerySubjects = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
    console.log(user.summerySubjects);
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const subjects = user.summerySubjects
    if (!subjects || subjects.length === 0) {
        throw new ApiError(404, "No subjects found");
    }
    res.status(200).json(new ApiResponce(200, subjects, "subjects fetched successfully"))
})

const summerizeNote = asyncHandler(async (req, res) => {
//take note id and level
// download note from cloudinary
//convert it to text
// call AI API to summerize the text
// save the content the database
//save the summery id in note and user db
console.log(req.body);

const {summaryName, subject, noteId, summeryLength} = req.body;

const note = await Note.findById(noteId);
if (!note) {
    throw new ApiError(404, "Note not found");
}
const filePath = await handleDownloadFile(note.fileUrl);
if (!filePath) {
    throw new ApiError(500, "Failed to download file");
}

const text =await extractTextFromFile(filePath);
if (!text) {
    throw new ApiError(500, "Failed to extract text from file");    
}
console.log(countwords(text));
const wordCount = countwords(text);

let summerylimit = "0"
fs.unlinkSync(filePath);
switch (summeryLength) {
    case "short":
        summerylimit = calcPercentRangeString(14,15,wordCount);
        break;
    case "medium":
        summerylimit = calcPercentRangeString(22,25,wordCount);
        break;
    case "long":
        summerylimit = calcPercentRangeString(30,32,wordCount);
        break;
    default:
        throw new ApiError(400, "Invalid summary length");

        
}
console.log(summerylimit);

const prompt = `You are an academic assistant. Summarize the following content in approximately ${summerylimit} words, focusing only on key concepts, facts, and definitions.\n\nCONTENT:\n${text}`;

console.log("generating");

const summery = await callGeminiTextGenAPI(prompt);
if (!summery) {
    throw new ApiError(500, "Failed to generate summary");
}
console.log("done generating");
console.log(countwords(summery));

console.log(summery);

const summerydb = await Summary.create({

    note: noteId,
    level: summeryLength,
    fileName: summaryName,
    subject: subject,
    content: summery,
    wordCount: countwords(summery),
}) 
if (!summerydb) {
    throw new ApiError(500, "Failed to save summary");
}
const user = await User.findById(req.user._id);
if (!user) {
    throw new ApiError(404, "User not found");
}
user.summaries.push(summerydb._id);
if (!user.summerySubjects.includes(subject)) {
    user.summerySubjects.push(subject);
}
note.summaryIds.push(summerydb._id);
await user.save();
await note.save();

res.status(200).json(new ApiResponce(200, summerydb, "Summery generated Successfully"));

})

const getSummaries = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const summaries = await Summary.find({ _id: { $in: user.summaries }, subject: req.body.subject}).populate("note")
    if (!summaries || summaries.length === 0) {
        throw new ApiError(404, "No summaries found");
    }
    
    res.status(200).json(new ApiResponce(200, summaries, "Summaries fetched successfully"));
})

const deleteSummary = asyncHandler(async (req, res) => {
    const { summaryId } = req.body;
    const summary = await Summary.findById(summaryId)
    if (!summary) {
        throw new ApiError(404, "Summary not found");
    }
    await Summary.findByIdAndDelete(summaryId)
    const user = await User.findById(req.user._id)
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    User.summaries = User.summaries.filter((id) => id.toString() !== summaryId.toString());
    const note = await Note.findById(summary.note);
    if (!note) {
        throw new ApiError(404, "Note not found");
    }
    note.summaryIds = note.summaryIds.filter((id) => id.toString() !== summaryId.toString());
    await note.save();
    await User.save();
    res.stauts(200).json(new ApiResponce(200,{},"summery Deleted Successfully"))
})

const deleteSummerySubject = asyncHandler(async (req , res)=>{
    const {subject} = req.body;
    if(!subject){
        throw new ApiError(400,"subject is required")
    }
    const user = await User.findById(req.user._id);
    if(!user){
        throw new ApiError(404,"User not found")
    }
    const summery = await Summary.deleteMany({subject: subject})

    user.summerySubjects = user.summerySubjects.filter((sub) => sub !== subject);
    await user.save();
    res.status(200).json(new ApiResponce(200,{},"Subject Deleted Successfully"))
})

const downloadSummaryFile = asyncHandler(async (req, res) => {
  const { summaryId } = req.body;

  // 1. Find the summary
  const summary = await Summary.findById(summaryId).populate("note");
  if (!summary) {
    throw new ApiError(404, "Summary not found");
  }

  // 2. Prepare the HTML with styling and dynamic content
  const htmlTemplate = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            background: #f9f9f9;
            color: #333;
          }
          h1 {
            color: #4f46e5;
          }
          .summary-box {
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 10px;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
        </style>
      </head>
      <body>
        <h1>📘 ${summary.subject}</h1>
        <h2>${summary.note.fileName}</h2>
        <div class="summary-box">
          <p>${summary.content.replace(/\n/g, "<br/>")}</p>
        </div>
      </body>
    </html>
  `;

  // 3. Generate PDF using Puppeteer
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.setContent(htmlTemplate, { waitUntil: "networkidle0" });

  const filePath = path.resolve(__dirname, `../../public/temp/${summary._id}.pdf`);
  await page.pdf({ path: filePath, format: "A4" });
  await browser.close();

  const fileName = `${summary.fileName || "summary"}.pdf`;

  // 4. Send PDF to client and delete it after
  res.download(filePath, fileName, (err) => {
    if (err) {
      if (err.code === 'ECONNABORTED') {
        console.warn("Download aborted by client.");
      } else {
        console.error("Error downloading file:", err);
      }
    }

    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        console.error("Error deleting file:", unlinkErr);
      } else {
        console.log("File deleted successfully.");
      }
    });
  });
})

export {    getSummerySubjects,  summerizeNote, getSummaries, deleteSummary,deleteSummerySubject, downloadSummaryFile };
