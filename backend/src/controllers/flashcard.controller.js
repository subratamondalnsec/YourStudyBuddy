import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { uploadOnCloudinary, deleteFromCloudinary , extractPublicId ,downloadFromCloudinary,extractFilenameFromUrl} from "../utils/cloudinary.js";
import { Note } from "../models/noteUpload.models.js";
import { User } from "../models/user.models.js";
import { countwords, extractTextFromFile, safeJsonParseFromGemini } from "../utils/functions.js";
import fs from "fs";
import { callGeminiTextGenAPI } from "../utils/gemini.js";
import { fileURLToPath } from 'url';
import { log } from "console";
import JSON5 from "json5";
import { FlashcardGroup, Flashcard } from "../models/flashcardGen.models.js";

const handleDownloadFile =  async (fileUrl) => {
    const filePath = await downloadFromCloudinary(fileUrl, extractFilenameFromUrl(fileUrl));
    return filePath;
}


const createFlashcard = asyncHandler(async (req, res) => {
    //take data
    //call gemini
    // save flashcardgroup
    // save flashcards
    //save user
    //save note


    const { selectedSubject, selectedNote, flashcardNumber } = req.body;
    if (!selectedSubject || !selectedNote || flashcardNumber <= 0) {
        throw new ApiError(400, "All fields are required");
    }
    console.log("Creating flashcard with data:", req.body);
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const note = await Note.findById(selectedNote);
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
fs.unlinkSync(filePath);
if (wordCount < 100) {
    throw new ApiError(400, "Text is too short to generate flashcards");
}
const propmt = `Generate ${flashcardNumber} flashcards from the following text. Each flashcard should have a front and back side. The front side should contain a question or prompt, and the back side should contain the answer or explanation. The text is: ${text} and the response should be in JSON format with the following structure: { "flashcard_1": { "front": "question", "back": "answer" } }`;
    const geminiResponse = await callGeminiTextGenAPI(propmt);

    console.log("Gemini response:", geminiResponse);

    if (!geminiResponse) {
        throw new ApiError(500, "Failed to generate flashcards from AI");
    }
    
    const flashcardsData = safeJsonParseFromGemini(geminiResponse);
    if (!flashcardsData || Object.keys(flashcardsData).length === 0) {
        throw new ApiError(500, "No flashcards generated from AI");
    }
    console.log("Flashcards data:", flashcardsData);
    const flashcardGroup = await FlashcardGroup.create({
        title: `Flashcards for ${note.fileName}`,
        user: user._id,
        note: note._id
    }).then(async (flashcardGroup) => {
        const flashcards = Object.entries(flashcardsData).map(([key, value]) => ({
            group: flashcardGroup._id,
            front: value.front,
            back: value.back,
            tags: [],
            learned: false,
            bookmarked: false
        }));
        
         const flashcardsret =await   Flashcard.create(flashcards);
        
        flashcardGroup.flashcards = flashcardsret.map(f => f._id);
        console.log("Flashcards created:", flashcardsret);
        await flashcardGroup.save(); 
        user.flashcardGroups.push(flashcardGroup._id);
        await user.save();
        
        // Ensure note.flashcardGroup is an array before pushing
        
        note.flashcardGroup.push(flashcardGroup._id);
        await note.save();
    }).catch(err => {
        console.error("Error creating flashcards:", err);
        throw new ApiError(500, "Failed to create flashcards");
    });
       
    
    res.status(200).json( new ApiResponce(200,{},"flashcard created successfully", ))
})

const getFlashcardGroups = asyncHandler(async (req, res) => {
    console.log("incoming");
    
    const falshCardGroups = await FlashcardGroup.find({user:req.user._id}).populate("note")


    res.status(200).json(new ApiResponce(200, falshCardGroups, "Flashcard groups fetched successfully"));

})

const getFlashcardbyGroupId = asyncHandler(async (req, res) => {
    const { groupId } = req.body;
    if (!groupId) {
        throw new ApiError(400, "Group ID is required");
    }
    
    
    const flashcards = await Flashcard.find({ group: groupId });
    if (!flashcards) {
        throw new ApiError(404, "Flashcards not found for this group");
    }
    
    res.status(200).json(new ApiResponce(200, flashcards, "Flashcards fetched successfully"));
})

const deleteGroupbyId = asyncHandler(async (req, res) => {
    const { groupId } = req.body;
    if (!groupId) {
        throw new ApiError(400, "Group ID is required");
    }
    
    await FlashcardGroup.findByIdAndDelete(groupId);
    await Flashcard.deleteMany({ group: groupId });
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    user.flashcardGroups = user.flashcardGroups.filter(id => id.toString() !== groupId);
    await user.save();
    const note = await Note.findOne({ flashcardGroup: groupId });
    if (note) {
        note.flashcardGroup = note.flashcardGroup.filter(id => id.toString() !== groupId);
        await note.save();
    }
    res.status(200).json(new ApiResponce(200, {}, "Group deleted successfully"));
})

const deleteFlashcard = asyncHandler(async (req, res) => {

    const falshcard = await Flashcard.findByIdAndDelete(req.body.flashcardId);
    const flashcardGroup = await FlashcardGroup.findById(falshcard.group);
    flashcardGroup.flashcards = flashcardGroup.flashcards.filter(id => id.toString() !== req.body.flashcardId);
    await flashcardGroup.save();
    res.status(200).json(new ApiResponce(200, falshcard, "flashcard deleted successfully"))
})

export { createFlashcard , getFlashcardGroups, getFlashcardbyGroupId , deleteGroupbyId , deleteFlashcard};