async function change_api(apitrim) {
    try {
        if (!apitrim || typeof apitrim !== "string") {
            throw new Error("Invalid input: API must be a non-empty string");
        }

        const response = await fetch("http://localhost:3000/change_api", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ api: apitrim }),
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




document.querySelector("#api-key button").addEventListener("click", async (event) => {
    event.preventDefault(); // Ngăn không reload trang khi submit form

    // Lấy giá trị từ ô nhập liệu 
    const api = document.querySelector("#api-key input");
    const apitrim = api.value.trim();
    // Gọi API và nhận kết quả
    const result = await change_api(apitrim);
    
    //check sau khi nhập api mới
    if(result){
       window.location.href = "./index.html";
    }
});
