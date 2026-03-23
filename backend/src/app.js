import cookieParser from 'cookie-parser'
import express from 'express'   
import cors from 'cors';

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    // origin: "http://localhost:5173",
    credentials:true
}))

app.use(express.json())
app.use(express.urlencoded({
    limit:"16kb",    
    extended:true
}))
app.use(express.static("public"))
app.use(cookieParser())

// console.log(process.env.CLOUDINARY_API_KEY);
//router import 

import userRouter from "./routes/user.route.js"
import notesRouter from "./routes/notes.route.js"
import summeryRouter from "./routes/summery.route.js"
import flashcardRouter from "./routes/flashcard.route.js"
import quizRouter from "./routes/quiz.route.js"
//router decleration

app.use("/api/v1/users", userRouter)
app.use("/api/v1/notes", notesRouter)
app.use("/api/v1/summery", summeryRouter)
app.use("/api/v1/flashcard", flashcardRouter)
app.use("/api/v1/quiz", quizRouter)



export { app }