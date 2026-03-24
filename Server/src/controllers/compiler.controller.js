import axios from "axios";

const SUPPORTED_LANGUAGES = {
  assembly: { id: 45, name: "Assembly (NASM)" },
  c: { id: 50, name: "C (Clang)" },
  cpp: { id: 54, name: "C++ (GCC)" },
  "c++": { id: 54, name: "C++ (GCC)" },
  rust: { id: 73, name: "Rust" },
  javascript: { id: 63, name: "JavaScript (Node.js)" },
  typescript: { id: 74, name: "TypeScript" },
  php: { id: 68, name: "PHP" },
  java: { id: 62, name: "Java (JDK 17)" },
  csharp: { id: 51, name: "C# (Mono)" },
  ruby: { id: 72, name: "Ruby" },
  go: { id: 60, name: "Go" },
  kotlin: { id: 78, name: "Kotlin" },
  swift: { id: 83, name: "Swift" },
  haskell: { id: 61, name: "Haskell (GHC)" },
  python: { id: 71, name: "Python 3" },
  perl: { id: 85, name: "Perl" },
  lua: { id: 64, name: "Lua" },
  bash: { id: 46, name: "Bash Script" },
  r: { id: 80, name: "R" },
  scala: { id: 81, name: "Scala" },
  sql: { id: 82, name: "SQL (SQLite)" }
};

const submitCode = async (sourceCode, languageId, stdin = "") => {
  const options = {
    method: "POST",
    url: "https://judge0-ce.p.rapidapi.com/submissions",
    params: {
      base64_encoded: "false",
      wait: "false"
    },
    headers: {
      "x-rapidapi-key": process.env.JUDGE0_API_KEY,
      "x-rapidapi-host": process.env.JUDGE0_API_HOST,
      "Content-Type": "application/json"
    },
    data: {
      source_code: sourceCode,
      language_id: languageId,
      stdin
    }
  };

  const response = await axios.request(options);
  return response.data;
};

const getSubmissionResult = async (token) => {
  const options = {
    method: "GET",
    url: `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
    params: {
      base64_encoded: "false",
      fields: "*"
    },
    headers: {
      "x-rapidapi-key": process.env.JUDGE0_API_KEY,
      "x-rapidapi-host": process.env.JUDGE0_API_HOST
    }
  };

  const response = await axios.request(options);
  return response.data;
};

const waitForSubmissionResult = async (token, maxRetries = 30) => {
  let retries = 0;

  while (retries < maxRetries) {
    const result = await getSubmissionResult(token);
    if (result.status.id > 2) {
      return result;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    retries += 1;
  }

  throw new Error("Submission timed out");
};

const compileAndRun = async (req, res) => {
  try {
    const { languageId, sourceCode, input } = req.body;

    if (!sourceCode || !languageId) {
      return res.status(400).json({
        success: false,
        error: "Source code and language ID are required fields"
      });
    }

    const langId = parseInt(languageId, 10);
    if (Number.isNaN(langId)) {
      return res.status(400).json({
        success: false,
        error: "Language ID must be a valid number"
      });
    }

    const submission = await submitCode(sourceCode, langId, input || "");

    if (!submission.token) {
      return res.status(500).json({
        success: false,
        error: "Failed to get submission token from Judge0"
      });
    }

    const result = await waitForSubmissionResult(submission.token);

    return res.status(200).json({
      success: true,
      status: result.status,
      stdout: result.stdout || null,
      stderr: result.stderr || null,
      compile_output: result.compile_output || null,
      time: result.time ? parseFloat(result.time) : null,
      memory: result.memory || null,
      token: result.token
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message
    });
  }
};

const getSubmissionStatus = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "Token is required"
      });
    }

    const result = await getSubmissionResult(token);

    return res.status(200).json({
      success: true,
      status: result.status.description,
      statusId: result.status.id,
      output: result.stdout || null,
      error: result.stderr || null,
      compilationError: result.compile_output || null,
      time: result.time ? parseFloat(result.time) : null,
      memory: result.memory || null,
      token: result.token,
      isComplete: result.status.id > 2
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error"
    });
  }
};

const getSupportedLanguages = async (_, res) => {
  try {
    return res.status(200).json({
      success: true,
      languages: SUPPORTED_LANGUAGES,
      totalLanguages: Object.keys(SUPPORTED_LANGUAGES).length
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error"
    });
  }
};

export { compileAndRun, getSubmissionStatus, getSupportedLanguages };
