require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

let chatHistory = [];

app.post("/ask", async (req, res) => {

  const question = req.body.question;

  if (!question) {
    return res.json({ answer: "Please ask a question." });
  }

  try {

    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest"
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: question }]
        }
      ]
    });

    const response = result.response;
    const answer = response.text();

    chatHistory.push({ question, answer });

    res.json({ answer });

  } catch (error) {

    console.log("Gemini Error:", error);

    res.json({
      answer: "Sorry, AI could not answer right now."
    });

  }

});

app.get("/history", (req, res) => {
  res.json(chatHistory);
});

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});