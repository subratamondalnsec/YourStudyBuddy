import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { uploadOnCloudinary, deleteFromCloudinary , extractPublicId ,downloadFromCloudinary,extractFilenameFromUrl} from "../utils/cloudinary.js";
import { Note } from "../models/noteUpload.models.js";
import { User } from "../models/user.models.js";
import { Quiz } from "../models/quizGen.modles.js";
import { Question } from "../models/quizGen.modles.js";
import { Attempt } from "../models/quizGen.modles.js";
import { countwords, extractTextFromFile, safeJsonParseFromGemini } from "../utils/functions.js";
import fs from "fs";
import { callGeminiTextGenAPI } from "../utils/gemini.js";
import { fileURLToPath } from 'url';
import JSON5 from "json5";

const handleDownloadFile =  async (fileUrl) => {
    const filePath = await downloadFromCloudinary(fileUrl, extractFilenameFromUrl(fileUrl));
    return filePath;
}

function distributeQuestions(total, difficulty) {
  const ratios = {
    easy: difficulty === "easy" ? 0.5 : difficulty === "medium" ? 0.4 : 0.3,
    medium: difficulty === "easy" ? 0.3 : difficulty === "medium" ? 0.4 : 0.3,
    hard: difficulty === "easy" ? 0.2 : difficulty === "medium" ? 0.2 : 0.4,
  };

  const counts = {
    easy: Math.floor(total * ratios.easy),
    medium: Math.floor(total * ratios.medium),
    hard: Math.floor(total * ratios.hard),
  };

  let sum = counts.easy + counts.medium + counts.hard;

  // Fix rounding errors: add remaining questions starting from highest priority
  while (sum < total) {
    const maxKey = Object.keys(counts).reduce((a, b) => ratios[a] > ratios[b] ? a : b);
    counts[maxKey]++;
    sum++;
  }

  return counts;
}


const createQuiz = asyncHandler(async (req, res) => {
  const { subject, note, difficulty, numberOfQuestions } = req.body;

  if (!subject || !note || !difficulty || !numberOfQuestions) {
    throw new ApiError(400, "Please provide all required fields");
  }

  const user = req.user._id;

  const existingNote = await Note.findOne({ _id: note, user });
  if (!existingNote) {
    throw new ApiError(404, "Note not found or does not belong to the user");
  }

  const filePath = await handleDownloadFile(existingNote.fileUrl);
  if (!filePath) {
    throw new ApiError(500, "Failed to download file");
  }

  const text = await extractTextFromFile(filePath);
  if (!text) {
    throw new ApiError(500, "Failed to extract text from file");
  }

  fs.unlinkSync(filePath); // Clean up

  const difficultyquestions = distributeQuestions(numberOfQuestions, difficulty);

  const prompt = `
You are an expert educational content generator.

I will provide you with a long academic note. Based on that note, your task is to generate quiz questions using the following schema and rules.

--- SCHEMA FORMAT ---
Each question should be an object with the following keys:
{
  type: 'mcq' | 'truefalse',
  difficulty: 'easy' | 'medium' | 'hard',
  topic: 'String (choose a sub-topic or logical group from the text)',
  questionText: 'The actual question to be asked',
  options: ['option1', 'option2', 'option3', 'option4'],
  correctAnswer: 'one of the options or true/false',
  explanation: 'A clear and concise explanation of the correct answer in short'
}

--- QUESTION RULES ---
1. Use both types: MCQ and True/False.
2. Difficulty distribution:
   - Easy: ${difficultyquestions.easy}
   - Medium: ${difficultyquestions.medium}
   - Hard: ${difficultyquestions.hard}
3. Cover different parts of the note, avoid repetition.
4. Ensure all questions are relevant to the provided academic note.

--- INPUT NOTE CONTENT ---
"""
${text}
"""

--- OUTPUT FORMAT ---
Return a JSON array of ${numberOfQuestions} questions.
`;

  const geminiResponse = await callGeminiTextGenAPI(prompt);
  if (!geminiResponse) {
    throw new ApiError(500, "Failed to generate questions from Gemini API");
  }

  const questionsData = safeJsonParseFromGemini(geminiResponse);
  if (!Array.isArray(questionsData) || questionsData.length === 0) {
    throw new ApiError(500, "No questions generated from Gemini API");
  }

  // Save questions to DB
  const quizQuestions = await Question.create(questionsData);

  // Create quiz
  const quiz = await Quiz.create({
    user,
    note,
    difficulty,
    questions: quizQuestions.map(q => q._id),
    subject
  });

  // Update note and user if needed
  await Note.findByIdAndUpdate(note, { $push: { quiz: quiz._id } });
  await User.findByIdAndUpdate(user, { $push: { Quizes: quiz._id } });

 res.status(201).json(new ApiResponce(200, "Quiz created successfully", quiz));
});

const FetchQuiz = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const quizzes = await Quiz.find({ user: userId }).populate("note", "fileName subject")

  if (!quizzes || quizzes.length === 0) {
    return res.status(404).json(new ApiResponce(404, "No quizzes found"));
  }

  res.status(200).json(new ApiResponce(200, quizzes,"Quizzes fetched successfully"));
});

const FtechQuestions = asyncHandler(async (req, res) => {
  const { quizId } = req.body;
  // console.log(req.body);
  
  if (!quizId) {
    throw new ApiError(400, "Quiz ID is required");
  }

  const quiz = await Quiz.findById(quizId).populate("questions");

  if (!quiz) {
    throw new ApiError(404, "Quiz not found");
  }

  res.status(200).json(new ApiResponce(200, quiz.questions, "Questions fetched successfully"));
});

const submitQuiz = asyncHandler(async (req, res) => {
 console.log(req.body);
 
 res.status(200).json(new ApiResponce(200, {}, "Quiz submission endpoint is under development"));
});

export { createQuiz, FetchQuiz, FtechQuestions, submitQuiz };