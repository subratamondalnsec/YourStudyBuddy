# YourStudyBuddy — Frontend

React + Vite + Tailwind CSS frontend for an AI-powered personal tutor and learning management platform.

## 🚀 Key Features

- **AI-Driven Course Generation**: Interactive UIs for prompting and viewing Gemini-generated courses.
- **Progress Tracking Dashboards**: Visualizing learning milestones, XP, and subject levels.
- **Modern Learning Experience**: Responsive lesson viewer, quiz interface, and certificate portal.
- **Secure Authentication**: Cookie-based and Header-based JWT auth handling.

## 🧪 Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7
- **Animations**: Framer Motion
- **Icons**: React Icons
- **API Handling**: Axios (with interceptors)

## 📁 Project Structure

```text
Client/
  public/            # Static assets
  src/
    assets/          # SVG, images, globally used icons
    Components/      # Shared components (Navbar, Sidebar, Progress, etc.)
    pages/           # Application views
      AllCourses.jsx
      Certificate.jsx
      Course.jsx
      CourseContain.jsx
      CourseStructure.jsx
      Dashboard.jsx
      Landing.jsx    # Home / Intro
      Login.jsx
      Profile.jsx
      Settings.jsx
      SignUp.jsx
    utils/           # API config, global helpers
    App.jsx          # Route management & layout
    main.jsx         # Entry point
    App.css
    index.css        # Tailwind directives
  .env
  package.json
  vite.config.js
```

## ⚙️ Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment (`.env`)**:
   Add the following variables to correctly point to your backend:
   ```env
   VITE_BACKEND_URL=http://localhost:3000
   ```

3. **Run Application**:
   ```bash
   npm run dev
   ```
   Frontend runs at: `http://localhost:5173`

---

## 🛠️ Components Overview

- **`Navbar`**: Global site navigation and user profile toggle.
- **`Sidebar`**: Contextual navigation for dashboard features and course modules.
- **`CourseCard`**: Reusable card component for course listings.
- **`ProgressBar`**: Visual indicator for lesson and course progress.

---

## 📄 License

This project is licensed under the ISC License.
