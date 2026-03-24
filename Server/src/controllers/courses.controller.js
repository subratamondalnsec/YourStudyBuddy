import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { uploadOnCloudinary, deleteFromCloudinary , extractPublicId ,downloadFromCloudinary,extractFilenameFromUrl} from "../utils/cloudinary.js";
import { countwords, extractTextFromFile, safeJsonParseFromGemini } from "../utils/functions.js";
import fs from "fs";
import { callGeminiTextGenAPI } from "../utils/gemini.js";
import { fileURLToPath } from 'url';
import JSON5 from "json5";
import Course from "../models/course.models.js";
import Lesson from "../models/lesson.model.js";
import Module from "../models/modules.model.js";
import Quiz from "../models/quiz.model.js";
import { log } from "console";
import mongoose from "mongoose";


const createCourse = asyncHandler(async (req, res) => {
  const { topic } = req.body;
  const userId = req.user._id;

  if (!topic) throw new ApiError(400, "All fields are required");

  const  prompt = `You are an expert course designer and AI tutor. Generate a complete micro-course based on the following user input:

Topic: "${topic}"

Instructions:
1. Create a course title and short description (2–3 lines).
2. Create a structured course outline with modules and lessons.
3. Break the course into exactly 3 modules.
4. Each module should have exactly 3 lessons.
5. For each lesson, include:
   - A title
   - A clear explanation (120 - 180 words)
   - 4 multiple-choice quiz questions at the end (each with 4 options and the correct answer index)

Critical output rules:
- Return STRICT valid JSON only.
- Do NOT wrap in markdown code fences.
- Do NOT include comments.
- Do NOT include ellipsis.
- answerIndex must be 0, 1, 2, or 3.

Output the course in structured JSON format like this:

{
  "title": "Course Title",
  "description": "Short course description.",
  "modules": [
    {
      "title": "Module 1 Title",
      "lessons": [
        {
          "title": "Lesson 1 Title",
          "content": "Lesson explanation here.",
          "quiz": [
            {
              "question": "Question 1 text?",
              "options": ["A", "B", "C", "D"],
              "answerIndex": 2
            },
            {
              "question": "Question 2 text?",
              "options": ["A", "B", "C", "D"],
              "answerIndex": 0
            }
          ]
        }
      ]
    }
  ]
}
`;

  const response = await callGeminiTextGenAPI(prompt);
  const data = safeJsonParseFromGemini(response);

  if (!data || !data.modules || !data.modules.length) {
    throw new ApiError(502, "AI service returned invalid course structure");
  }

  const course = new Course({
    title: data.title,
    topic,
    description: data.description,
    creator: userId,
    generatedByAI: true
  });
  await course.save();

  const allLessonIds = [];

  for (const moduleData of data.modules) {
    const lessonIds = [];

    for (const lesson of moduleData.lessons) {
      const newLesson = new Lesson({
        course: course._id,
        title: lesson.title,
        content: lesson.content
      });

      const quiz = new Quiz({
        lesson: newLesson._id,
        questions: lesson.quiz.map(q => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.answerIndex
        }))
      });
      await quiz.save();

      newLesson.quiz = quiz._id;
      await newLesson.save();

      lessonIds.push(newLesson._id);
      allLessonIds.push(newLesson._id);
    }

    const module = new Module({
      course: course._id,
      title: moduleData.title,
      lessons: lessonIds
    });
    await module.save();
  }

  course.lessons = allLessonIds;
  await course.save();

  res.status(201).json(new ApiResponce(201, course, "Course created successfully"));
});


const fetchallCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({}).populate("creator", "name email username").sort
({ createdAt: -1 });
  if (!courses || courses.length === 0) {
    throw new ApiError(404, "No courses found");
  }

  res.status(200).json(new ApiResponce(200, courses, "Courses fetched successfully"));
} );

const fetchCourseById = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).populate({
        path: 'lessons',
        populate: {
            path: 'quiz',
            model: 'Quiz'
        }
    });

    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    res.status(200).json(new ApiResponce(200, course, "Course fetched successfully"));
});

const fetchCourseStructure = asyncHandler(async (req, res) => {
    const { courseId } = req.body;

  if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
    throw new ApiError(400, "Invalid course ID");
  }

    const course = await Course.findById(courseId);
    const modules = await Module.find({ course: courseId }).populate('lessons', 'title');

    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    res.status(200).json(new ApiResponce(200, {course:course, modules:modules}, "Course structure fetched successfully"));
});

const fetchCourseTopics = asyncHandler(async (req, res) => {
  const { courseId } = req.query;

  if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
    throw new ApiError(400, "Invalid course ID");
  }

  const course = await Course.findById(courseId)
    .select("title topic")
    .populate({
      path: "lessons",
      select: "title",
    });

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  const topicsSet = new Set();

  if (course.topic) topicsSet.add(course.topic.trim());
  (course.lessons || []).forEach((lesson) => {
    if (lesson?.title) topicsSet.add(lesson.title.trim());
  });

  const topics = Array.from(topicsSet).filter(Boolean);

  return res.status(200).json({
    success: true,
    courseId,
    courseName: course.title,
    topics,
  });
});

export {
    createCourse,
    fetchallCourses,
    fetchCourseById,
    fetchCourseStructure,
    fetchCourseTopics
};
