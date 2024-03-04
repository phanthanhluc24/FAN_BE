const dotenv = require("dotenv");
dotenv.config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.OPENAI_KEY);

let questionsAndAnswers=[]
class AskAndAnswerRepository{
  async aiResponse(req , res) {
    try {
      const {question}=req.body
      const model = genAI.getGenerativeModel({ model: "gemini-pro"});
      const options = {
        maxLen: 3, // Giới hạn độ dài câu trả lời tối đa 3 dòng
        temperature: 0.7, // Giảm nhiệt độ để câu trả lời ngắn gọn hơn
        topP: 0.9, // Giảm tỷ lệ topP để đa dạng hóa câu trả lời
      };
      const result = await model.generateContent(question+".Bạn vui lòng chỉ trả lời duy nhất bằng tiếng việt và trả lời chỉ trong vòng 3 dòng thôi không quá dài.Nếu câu hỏi không liên quan đến sửa chửa thì hãy trả lời câu hỏi không liên quan.",options);
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