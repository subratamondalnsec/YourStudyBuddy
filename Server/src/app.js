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
//router decleration

app.use("/api/v1/users", userRouter)
app.use("/api/v1/courses", courseRouter)
app.use("/api/v1/progress", progressRouter)




export { app }
