# YourStudyBuddy — Backend

Node.js + Express backend for AI-powered learning management, document processing (PDF/Docx), quiz generation, and student progress tracking.

## 🧠 Core Intelligence

- **Google Gemini AI Integration**: Powering course content generation, automated quizes, and document summarization.
- **Intelligent Text Extraction**: Advanced parsing for PDF and Docx files using `pdf-parse` and `mammoth`.
- **Gamified Progress**: XP tracking and automated PDF certificate generation.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **AI Engine**: Google Generative AI (Gemini)
- **Auth**: JWT (`jsonwebtoken`) + Password hashing (`bcrypt`)
- **Storage**: Cloudinary (Image management)
- **File Handling**: Multer (Local/Tmp handling)

## 📁 Project Structure

```text
Server/
  public/            # Static assets
  src/
    DB/
      index.js       # MongoDB connection logic
    controllers/
      user.controller.js
      courses.controller.js
      progress.controller.js
      quiz.controller.js
      practice.controller.js
      schedule.controller.js
    middlewares/
      auth.middleware.js
      multer.middleware.js
    models/
      user.models.js
      course.models.js
      lesson.model.js
      modules.model.js
      progress.model.js
      quiz.model.js
      quizSession.model.js
      certificate.model.js
      xp.models.js
      studySchedule.model.js
    routes/
      user.route.js
      courses.route.js
      progress.router.js
      quiz.route.js
      schedule.route.js
      practice.route.js
    utils/
      gemini.js       # Gemini AI wrapper
      functions.js    # PDF/Docx text extractors
      cloudinary.js   # Image upload logic
      certificate.js  # PDF Generator
      ApiError.js
      ApiResponse.js
      asyncHandler.js
    app.js            # Express app config
    index.js          # Server entry point
    constants.js
  .env
  package.json
```

## ⚙️ Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environments (`.env`)**:
   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRY=10d
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Run Server**:
   ```bash
   npm run dev
   ```
   Backend runs at: `http://localhost:3000`

---

## 🚀 API Endpoints (v1)

All protected routes (✅) require the cookie `accessToken` or the header:
```
Authorization: Bearer <token>
```

### Auth & Users (`/api/v1/users`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST   | `/register` | ❌ | Create a new student account |
| POST   | `/login` | ❌ | Login and receive tokens |
| POST   | `/logout` | ✅ | Clear auth tokens |
| GET    | `/current-user` | ✅ | Get profile of logged-in user |
| PATCH  | `/update-account` | ✅ | Update profile details |
| PATCH  | `/avatar` | ✅ | Update profile picture (Cloudinary) |

---

### Courses & Learning (`/api/v1/courses`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET    | `/` | ✅ | Fetch all available courses |
| POST   | `/generate` | ✅ | Use Gemini to generate a course from a prompt |
| GET    | `/:courseId` | ✅ | Get full structure of a specific course |
| DELETE | `/:courseId` | ✅ | Remove a course from user library |

---

### Quiz & Assessment (`/api/v1/quiz`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST   | `/generate` | ✅ | Generate a quiz based on course material |
| POST   | `/submit` | ✅ | Submit quiz answers and get evaluation |
| GET    | `/history` | ✅ | View past quiz performance |

---

### Progress & Certificates (`/api/v1/progress`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET    | `/stats` | ✅ | Get XP, level, and completion stats |
| PATCH  | `/lesson-complete` | ✅ | Mark a lesson as finished and gain XP |
| GET    | `/certificate/:id` | ✅ | Generate/Download PDF certificate |

---

## 📄 Response Pattern

**Success:**
```json
{ "success": true, "message": "Operation successful", "data": { ... } }
```

**Error:**
```json
{ "success": false, "message": "Error details here", "errors": [] }
```

---

> Keep secrets private. Never commit real credentials to version control.