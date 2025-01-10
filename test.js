const fs = require('fs');
const path = require('path');

// Đường dẫn tới file .env
const envPath = path.resolve(__dirname, '.env');

// Hàm thay đổi value của key
function updateEnvValue(key, newValue) {
    // Đọc nội dung file .env
    let envData = fs.readFileSync(envPath, 'utf-8');
    const regex = new RegExp(`^(${key}=).*`, 'm'); // Tìm dòng chứa key cần thay đổi

    // Kiểm tra nếu key tồn tại
    if (regex.test(envData)) {
        // Cập nhật value
        envData = envData.replace(regex, `$1${newValue}`);
    } else {
        console.log(`Key "${key}" không tồn tại trong file .env`);
        return;
    }

    // Ghi lại nội dung mới vào file .env
    fs.writeFileSync(envPath, envData, 'utf-8');
    console.log(`Cập nhật key "${key}" thành công!`);
}

// Ví dụ sử dụng
updateEnvValue('API_KEY', 'AIzaSyCz6Z51MjBXWrsuQDlrjKsk6Y9W30eQ6eg'); // Thay MY_KEY bằng key và new_value bằng giá trị mới
