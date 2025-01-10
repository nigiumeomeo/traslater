async function call_api(words) {
    try {
        if (!words || typeof words !== "string") {
            throw new Error("Invalid input: 'words' must be a non-empty string");
        }

        const response = await fetch("http://localhost:3000/call_api", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ word: words }),
        });

        if (!response.ok) {
            return "Error occured";
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error in call_api:", error);
        return { message: error.message || "Unknown error occurred" };
    }
}



document.querySelector("#input-form button").addEventListener("click", async (event) => {
    event.preventDefault(); // Ngăn không reload trang khi submit form

    // Lấy giá trị từ ô nhập liệu 
    const wordInput = document.querySelector("#input-form input");
    const word = wordInput.value.trim();
    if (word != "") {
        //chuyển nút thành xoay xoay
        document.querySelector("#input-form button i").innerHTML = `&#8634;`;
        document.querySelector("#input-form button").disabled = true;
        // Gọi API và nhận kết quả
        const result = await call_api(word);
        //xuất ra kết quả
        if (result.data.literal !== undefined) {
            document.querySelector("#literal input").value = result.data.literal;
            document.querySelector("#specialized textarea").innerHTML = result.data.specialized;
            document.querySelector("#input-form button i").innerHTML = '&#xf0a9;';
            document.querySelector("#input-form button").disabled = false;
            // Gọi API và nhận kết quả
        } else {
            document.querySelector("#literal input").value = "Can't translate.";
            document.querySelector("#specialized textarea").innerHTML = result.data;
            document.querySelector("#input-form button i").innerHTML = '&#xf0a9;';
            document.querySelector("#input-form button").disabled = false;
        }
    }

});



//code nút setting
document.querySelector("#function #setting").addEventListener("click", () => {
    if (document.querySelector("#setting-pane").style.display == 'none' || document.querySelector("#setting-pane").style.display == '') {
        document.querySelector("#setting-pane").style.display = 'block';
    } else {
        document.querySelector("#setting-pane").style.display = 'none';
    }

})
//chuyển mode và api key
document.querySelector("#word-mode button").addEventListener("click", () => {
    window.location.href = "./general.html";
})

//chuyển key api
document.querySelector("#change-api").addEventListener("click", () => {
    window.location.href = "../enterAPI.html";
})

//on top
const alwaysOnTopBtn = document.querySelector('#on-top button');
alwaysOnTopBtn.style.backgroundColor = "green";
alwaysOnTopBtn.addEventListener('click', async () => {
    try {
        const response = await fetch('http://localhost:3000/on_top', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ toggle: true }) // Dữ liệu gửi lên server
        });

        const data = await response.json();
        if(!data.isAlwaysOnTop){
            alwaysOnTopBtn.style.backgroundColor = "green";
            alwaysOnTopBtn.innerHTML = "On top";
        }else{
            alwaysOnTopBtn.style.backgroundColor = "red";
            alwaysOnTopBtn.innerHTML = "Off top";
        }
    } catch (error) {
        console.error('Error toggling Always on Top:', error);
    }
});