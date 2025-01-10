var notification = document.getElementById("notification");

window.onload = async () => {
  try {
    notification.innerHTML = "Checking network connection...";

    // Kiểm tra kết nối
    const connectionResponse = await fetch("http://localhost:3000/check_connection");
    const connectionData = await connectionResponse.json();

    if (connectionData.status === "valid") {
      notification.innerHTML = "Connection OK. Checking API KEY...";

      // Kiểm tra API Key
      const apiResponse = await fetch("http://localhost:3000/check_api");
      const apiData = await apiResponse.json();

      if (apiData.status === "valid") {
        notification.innerHTML = "API OK.";

        //thực hiện chuyển tab ở đây
        window.location.href = './AI_pages/gemini.html'; 
      } else {
        notification.innerHTML = "API not valid.";
        setTimeout(()=>{
          window.location.href = "./enterAPI.html";
        }, 500)
      }
    } else {
      notification.innerHTML = "Connection failed.";
    }
  } catch (err) {
    notification.innerHTML = "Connection failed.";
  }
};
