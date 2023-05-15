const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

// Initialize app
const app = express();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (prompt !== "" && prompt) {
      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        temperature: 0.7,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      res.json({
        message: "Get Success",
        data: response.data.choices[0].text,
        parsed: await extractQuiz(response.data.choices[0].text),
      });
    } else {
      res.json({
        message: "Invalid Prompt",
      });
    }
  } catch (err) {
    console.log(err);
  }
});

// Extract question and answer
function extractQuiz(string) {
  const regex =
    /(\d+)\. (.+)\nA\. (.+)\nB\. (.+)\nC\. (.+)\nD\. (.+)\nAnswer: ([A-D])\. (.+)/g;
  let result;
  const quiz = [];
  while ((result = regex.exec(string)) !== null) {
    const [
      _,
      id,
      question,
      option1,
      option2,
      option3,
      option4,
      correct,
      answer,
    ] = result;
    quiz.push({
      question: `${id}. ${question}`,
      options: [option1, option2, option3, option4],
      correctIndex: ["A", "B", "C", "D"].indexOf(correct), // convert the answer to an index
    });
  }
  return quiz;
}

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
