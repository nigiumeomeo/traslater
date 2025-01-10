const fs = require('fs');
const path = require('path');
var dotenv = require('dotenv');
const os = require('os');

// Đường dẫn tới file .env


// Hàm thay đổi value của key
function change_api(key, newValue) {
    // Đọc nội dung file .env
    const appDir = path.join(os.homedir(), 'translater');
    const envPath = path.join(appDir, '.env');
    let envData = fs.readFileSync(envPath, 'utf-8');
    const regex = new RegExp(`^(${key}=).*`, 'm'); // Tìm dòng chứa key cần thay đổi

    // Kiểm tra nếu key tồn tại
    if (regex.test(envData)) {
        // Cập nhật value  
        envData = envData.replace(regex, `$1${newValue}`);
        
    } else {
        return false;
    }

    process.env[key] = newValue;
    // Ghi lại nội dung mới vào file .env
    fs.writeFileSync(envPath, envData, 'utf-8');
    return true;
}

module.exports = change_api;
