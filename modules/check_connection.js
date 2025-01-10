// checkConnection.js
async function check_connection() {
    const timeout = 10000; // 10 giây (10,000ms)
  
    // Tạo promise timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), timeout)
    );
  
    try {
      const response = await Promise.race([
        fetch('https://example.com'),
        timeoutPromise
      ]);
  
      if (!response.ok) {
        return "invalid";
      }
  
      const data = await response.text(); // hoặc response.json() nếu nhận JSON
      return "valid";
    } catch (error) {
      return "invalid";
    }
  }
  

module.exports = check_connection;
