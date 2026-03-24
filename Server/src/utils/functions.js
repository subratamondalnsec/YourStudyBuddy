import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import pdf from 'pdf-parse';
import JSON5 from "json5";

const extractTextFromTxt = (filePath) => {
    return fs.readFileSync(filePath, 'utf-8');
};

const extractTextFromDocx = async (filePath) => {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value; // This is the raw text
};

const extractTextFromPdf = async (filePath) => {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
};

const extractTextFromFile = async (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.txt':
            return extractTextFromTxt(filePath);
        case '.docx':
            return extractTextFromDocx(filePath);
        case '.pdf':
            return extractTextFromPdf(filePath);
        default:
            throw new Error(`Unsupported file type: ${ext}`);
    }
}

const countwords = (text) => {
    return text.split(/\s+/).filter(word => word.length > 0).length;
}

function safeJsonParseFromGemini(response) {
    const tryParse = (text) => {
        if (!text || typeof text !== "string") return null;
        const trimmed = text.trim();
        if (!trimmed) return null;

        try {
            return JSON.parse(trimmed);
        } catch {}

        try {
            return JSON5.parse(trimmed);
        } catch {
            return null;
        }
    };

  try {
        if (!response || typeof response !== "string") {
            return null;
        }

        const fencedJsonMatch = response.match(/```json\s*([\s\S]*?)```/i);
        const fencedMatch = response.match(/```\s*([\s\S]*?)```/i);

        const candidates = [
            fencedJsonMatch?.[1],
            fencedMatch?.[1],
            response,
        ].filter(Boolean);

        for (const candidate of candidates) {
            const parsed = tryParse(candidate);
            if (parsed) return parsed;
        }

        const firstBrace = response.indexOf("{");
        const lastBrace = response.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const objectSlice = response.slice(firstBrace, lastBrace + 1);
            const parsed = tryParse(objectSlice);
            if (parsed) return parsed;
        }

        const firstBracket = response.indexOf("[");
        const lastBracket = response.lastIndexOf("]");
        if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
            const arraySlice = response.slice(firstBracket, lastBracket + 1);
            const parsed = tryParse(arraySlice);
            if (parsed) return parsed;
        }

        return null;
  } catch (err) {
    console.error("JSON parse failed:", err.message);
    return null;
  }
}

export {extractTextFromTxt,extractTextFromDocx, extractTextFromPdf, extractTextFromFile, countwords, safeJsonParseFromGemini};