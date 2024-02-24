const dotenv = require("dotenv");
dotenv.config();
// const GeminiClient = require("gemini-client");
// const client = new GeminiClient({
//   apiKey: process.env.OPENAI_KEY,
// });
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.OPENAI_KEY);
let questionsAndAnswers=[]
class AskAndAnswerRepository{
  async aiResponse(req , res) {
    try {
      const {question}=req.body
      const model = genAI.getGenerativeModel({ model: "gemini-pro"});
      const result = await model.generateContent(question);
      const response = await result.response;
      const text = response.text();
      questionsAndAnswers.push({question,answer:text})
      return res.status(201).json({message:"success",data:questionsAndAnswers})
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports=new AskAndAnswerRepository()