const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
var dotenv = require('dotenv');
const os = require('os');

async function check_api() {

    const appDir = path.join(os.homedir(), 'translater');
    const envFilePath = path.join(appDir, '.env');


    dotenv.config({ path: envFilePath });
    //đọc api trong env
    var apikey = process.env.API_KEY;
    //nếu trống thì trả về not_existed
    if (apikey === undefined) {
        return "not_existed";
    } else {
        //bắt đầu call thử API 1 lần
        const genAI = new GoogleGenerativeAI(apikey);
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = "Xin chào";
            const result = await model.generateContent(prompt);

            // Kiểm tra và gọi hàm text để lấy văn bản
            if (typeof result.response.text === 'function') {
                const text = await result.response.text(); // Gọi hàm text để lấy nội dung
                return "valid";
            } else {
                return "invalid";
            }
        } catch (error) {
            return "invalid";
        }
    }
}

module.exports = check_api;

