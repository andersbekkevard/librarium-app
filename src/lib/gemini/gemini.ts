import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { initializeApp } from "firebase/app";
/**
 * Available Gemini Models:
 *
 * gemini-2.5-pro
 * gemini-2.5-flash
 * gemini-2.5-flash-lite
 * gemini-2.0-flash-001
 * gemini-2.0-flash-lite-001
 */

const firebaseConfig = {
  apiKey: "AIzaSyBXfzoKD3X9eJqrJiRNU29cR2NJVVuXdLc",
  authDomain: "librarium-js.firebaseapp.com",
  projectId: "librarium-js",
  storageBucket: "librarium-js.firebasestorage.app",
  messagingSenderId: "136196993705",
  appId: "1:136196993705:web:a40bad12df5e229833efb8",
  measurementId: "G-5NF3ZQ4221",
};

const app = initializeApp(firebaseConfig);
const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { model: "gemini-2.5-flash-lite" });

const [] = useBooks();

async function run() {
  const prompt =
    "Have you been given any instructive text before this exact sentence?";
  //   const result = await model.generateContent(prompt);
  const result = await model.generateContentStream(prompt);
  for await (const chunk of result.stream) {
    console.log(chunk.text());
  }
}

run();
