// Import các module cần thiết từ Electron
const { app, BrowserWindow } = require('electron');
const express = require('express');
const check_connection = require('./modules/check_connection');
const check_api = require('./modules/check_api');
const call_api = require('./modules/call_api');
const change_api = require('./modules/change_api');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
const os = require('os');
const fs = require('fs');
const appDir = path.join(os.homedir(), 'translater');
const envFilePath = path.join(appDir, '.env');
let isAlwaysOnTop = false;



let genAI;
let apikey;
const dotenv = require('dotenv');

// Kiểm tra thư mục tồn tại, nếu không thì tạo mới
const checkAndCreateDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Đọc hoặc tạo file `.env`
const readOrCreateEnvFile = () => {
  checkAndCreateDirectory(path.dirname(envFilePath));

  if (!fs.existsSync(envFilePath)) {
      // Nếu file không tồn tại, tạo mới với nội dung mặc định
      const defaultContent = `API_KEY=VALUE`;
      fs.writeFileSync(envFilePath, defaultContent, { encoding: 'utf-8' });
      console.log('.env file created at:', envFilePath);
  } else {
      console.log('.env file already exists. Reading content...');
      const envContent = fs.readFileSync(envFilePath, { encoding: 'utf-8' });
      console.log(envContent);
  }
};

// Load biến môi trường sau khi đảm bảo file tồn tại
readOrCreateEnvFile();
dotenv.config({ path: envFilePath });


let isOkInFirstTimeAPI = true; //đặt để ktra xem cái api khai báo chung có dùng đc ko, dùng đc thì ok


apikey = process.env.API_KEY;
genAI = new GoogleGenerativeAI(apikey);
//pre check
async function checkAPIStatus() {
  try {
    const status = await check_api(); // Sử dụng await trong async function
    if (status !== "valid") {
      isOkInFirstTimeAPI = false;
    }
  } catch (error) {
    console.error("Lỗi khi kiểm tra API:", error);
  }
}

checkAPIStatus(); // Gọi hàm


/*phần server*/
//------------------------------------------------------------------------------
const appexpress = express();
const port = 3000;
appexpress.use(express.json());


// Route kiểm tra kết nối
appexpress.get('/check_connection', async (req, res) => {
  try {
    const status = await check_connection();
    res.json({ status });
  } catch (error) {
    res.status(500).json({ status: 'invalid', error: error.message });
  }
});

appexpress.get('/check_api', async (req, res) => {
  try {
    const status = await check_api();
    res.json({ status });
  } catch (error) {
    res.status(500).json({ status: 'invalid', error: error.message });
  }
});

appexpress.post('/call_api', async (req, res) => {
  try {
    if (!isOkInFirstTimeAPI) {
      apikey = process.env.API_KEY;
      genAI = new GoogleGenerativeAI(apikey); //???
    }
    // Gọi API Gemini
    const word = req.body.word;
    const prompt = `
    giải nghĩa từ sau bằng tiếng Việt:"${word}". Giải nghĩa theo 2 hướng: nghĩa đen (Literally meanings) và nghĩa chuyên ngành kèm ví dụ (Specialized meaning). Hãy viết nó theo format json:
      {
      "literal": "... (khoảng từ 3 đến 7 từ)",
      "specialized": "..."
      }
      trong dấu 3 chấm là một đoạn văn, không phải json.
    `
    const results = await call_api(prompt, genAI);
    //nếu là chuỗi JSON thì trả về kết quả
    if (isJsonString(results.replace(/^```json\n/, '').replace(/```\n$/, ''))) {
      // Trả về dữ liệu kết quả
      res.status(200).json({ data: JSON.parse(results.replace(/^```json\n/, '').replace(/```\n$/, '')) });
    } else {
      res.status(200).json({ data: results });
    }

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

function isJsonString(str) {
  try {
    JSON.parse(str); // Thử phân tích cú pháp chuỗi
    return true;     // Nếu không có lỗi, chuỗi là JSON hợp lệ
  } catch (e) {
    return false;    // Nếu có lỗi, chuỗi không phải JSON
  }
}


appexpress.post('/call_api_general', async (req, res) => {
  try {
    if (!isOkInFirstTimeAPI) {
      apikey = process.env.API_KEY;
      genAI = new GoogleGenerativeAI(apikey); //???
    }
    // Gọi API Gemini
    const prompt = req.body.word;
    const results = await call_api(prompt, genAI);
    // Trả về dữ liệu kết quả
    res.status(200).json({ data: results });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

//đổi api của gemini
appexpress.post('/change_api', async (req, res) => {
  try {
    // Gọi API Gemini
    const api = req.body.api;
    const results = await change_api("API_KEY", api);
    // Trả về dữ liệu kết quả
    res.status(200).json({ data: results });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

//op top mode
appexpress.post('/on_top', (req, res) => {
  isAlwaysOnTop = !isAlwaysOnTop;

  if (mainWindow) {
      mainWindow.setAlwaysOnTop(isAlwaysOnTop);
  }

  res.json({ success: true, isAlwaysOnTop });
});


// Bắt đầu server trên cổng 3000
appexpress.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});



/*phần app*/
//------------------------------------------------------------------------------

// Khai báo biến toàn cục để giữ tham chiếu tới cửa sổ chính (mainWindow)
let mainWindow;



// Sự kiện 'ready': Kích hoạt khi ứng dụng đã sẵn sàng để khởi chạy
app.on('ready', () => {
  // Tạo một cửa sổ trình duyệt mới
  mainWindow = new BrowserWindow({
    width: 500, // Chiều rộng cửa sổ (800px)
    height: 300, // Chiều cao cửa sổ (600px)
    resizable: false,
    icon: __dirname + '/assets/icon.png',
    webPreferences: {
      nodeIntegration: true // Cho phép sử dụng Node.js trong renderer process
    },
  });
  //mainWindow.webContents.openDevTools();
  // Tải tệp HTML chính làm giao diện của ứng dụng
  mainWindow.loadFile('./renderer/index.html');
  //ẩn thanh menu
  mainWindow.setMenu(null);
  // Sự kiện 'closed': Kích hoạt khi cửa sổ chính bị đóng
  mainWindow.on('closed', () => {
    mainWindow = null; // Xóa tham chiếu tới cửa sổ chính để giải phóng bộ nhớ
  });
});
// Sự kiện 'window-all-closed': Kích hoạt khi tất cả cửa sổ của ứng dụng bị đóng
app.on('window-all-closed', () => {
  // Nếu không phải macOS, thoát ứng dụng khi tất cả cửa sổ bị đóng
  if (process.platform !== 'darwin') {
    app.quit(); // Thoát ứng dụng
  }
});
// Sự kiện 'activate': Kích hoạt khi ứng dụng được mở lại trên macOS
app.on('activate', () => {
  // Nếu chưa có cửa sổ nào, tạo lại cửa sổ chính
  if (mainWindow === null) {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true
      }
    });
    mainWindow.loadFile('./renderer/index.html');
  }
});



