
async function call_api(prompt, genAI) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);

        // Kiểm tra và gọi hàm text để lấy văn bản
        if (typeof result.response.text === 'function') {
            const text = await result.response.text(); 
            return text;
        } else {
            return "Đang lỗi...";
        }
    } catch (error) {
        return "Đang lỗi...";
    }
}

module.exports = call_api;

