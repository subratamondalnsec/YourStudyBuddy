import cookieParser from 'cookie-parser'
import express from 'express'   
import cors from 'cors';

const app = express()

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
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
import courseRouter from "./routes/courses.route.js"
import progressRouter from "./routes/progress.router.js"
import quizRouter from "./routes/quiz.route.js"
import practiceRouter from "./routes/practice.route.js"
import scheduleRouter from "./routes/schedule.route.js"
import topicRouter from "./routes/topic.route.js"
import chatRouter from "./routes/chat.route.js"
import compilerRouter from "./routes/compiler.route.js"
//router decleration

app.use("/api/v1/users", userRouter)
app.use("/api/v1/courses", courseRouter)
app.use("/api/v1/course", courseRouter)
app.use("/api/v1/progress", progressRouter)
app.use("/api/v1/quiz", quizRouter)
app.use("/api/v1/practice", practiceRouter)
app.use("/api/v1/schedule", scheduleRouter)
app.use("/api/v1/topic", topicRouter)
app.use("/api/v1/chat", chatRouter)
app.use("/api/v1/compiler", compilerRouter)
app.use("/chat", chatRouter)




export { app }
