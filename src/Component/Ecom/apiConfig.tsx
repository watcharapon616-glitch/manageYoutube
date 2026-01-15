export const API_URL = "https://script.google.com/macros/s/AKfycbxOiZKvsOZHEyXJ9xUn6M9XclCmxySEFPYKexrFMyz1qnyok3tzL6KSlI36PaRlXUsL-A/exec";

export const fetchSheetData = async () => {
  const user = localStorage.getItem("user_name_id");
  
  // ตรวจสอบใน Console (F12) ว่าบรรทัดนี้พิมพ์ชื่ออะไรออกมา
  console.log("กำลังดึงข้อมูลของชีทชื่อ:", user);

  if (!user || user === "undefined" || user === "null") {
    return [];
  }

  try {
    const response = await fetch(`${API_URL}?username=${user.trim()}&t=${Date.now()}`, {
      method: "GET",
      redirect: "follow"
    });
    const data = await response.json();
    
    // ตรวจสอบว่า Google ส่งอะไรกลับมา
    console.log("ข้อมูลที่ได้รับจาก Google:", data);
    return data;
  } catch (error) {
    console.error("Fetch Error:", error);
    return [];
  }
};

export const postSheetData = async (payload: any) => {
  const user = localStorage.getItem("user_name_id");
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      mode: "cors", 
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ ...payload, username: user?.trim() }),
    });
    return await response.json();
  } catch (error) {
    return { status: "error", message: "Network Error" };
  }
};

export const loginUser = async (username, password) => {
  const cleanUser = username.trim(); 
  const params = new URLSearchParams({ action: "login", username: cleanUser, password });

  try {
    const response = await fetch(`${API_URL}?${params.toString()}`, {
      method: "GET",
      redirect: "follow"
    });
    const result = await response.json();
    
    if (result.status === "success") {
      // ล้างค่าเก่าทิ้งก่อนเพื่อความชัวร์
      localStorage.removeItem("user_name_id");
      // บันทึกชื่อ User ใหม่ลงไปทันที (เช่น user2)
      localStorage.setItem("user_name_id", cleanUser);
      console.log("เปลี่ยน User ในเครื่องเป็น:", cleanUser);
    }
    return result;
  } catch (error) {
    return { status: "error", message: "Network Error" };
  }
};