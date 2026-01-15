import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "./apiConfig";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await loginUser(username, password);

            // ดูที่บรรทัดนี้ครับ: ต้องเป็น .status (ตัวพิมพ์เล็กทั้งหมด)
            // ตามที่ปรากฏในรูป image_ab2e04.jpg ของคุณ
            if (result && result.status === "success") {
                // 1. ล้างค่าเก่าออกก่อนเพื่อป้องกันการจำ User เดิม (admin1)
                localStorage.clear();

                // 2. บันทึกด้วยค่า 'username' ที่เราพิมพ์เข้ามา (ตัวแปรที่รับค่าจาก Input)
                // ไม่ควรใช้ result.username เพราะถ้า API ไม่ส่งมา มันจะพัง
                localStorage.setItem("user_name_id", username.trim());

                // 3. บันทึกค่าอื่นๆ ตามปกติ
                localStorage.setItem("user_name", result.name || username);
                localStorage.setItem("isLoggedIn", "true");

                console.log("Login Success! Current User:", username.trim());

                // 4. สั่งเปลี่ยนหน้า
                navigate("/");

                // 5. แถม: สั่งรีโหลดหน้าหนึ่งครั้งเพื่อให้ React ทุกส่วนอ่านค่าใหม่พร้อมกัน
                window.location.reload();
            } else {
                // ถ้า status ไม่ใช่ "success" ให้แสดงข้อความผิดพลาด
                setError(result.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
            }
        } catch (err) {
            setError("การเชื่อมต่อล้มเหลว โปรดตรวจสอบอินเทอร์เน็ต");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 italic font-bold">
            <div className="w-full max-w-[400px] bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 text-center">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-1">Admin Login</h2>
                <p className="text-[10px] text-red-600 tracking-[0.2em] uppercase mb-8">Management System</p>

                <form onSubmit={handleLogin} className="space-y-4 text-left">
                    <input
                        type="text" placeholder="Username"
                        className="w-full bg-slate-50 border-2 border-transparent rounded-xl px-5 py-4 text-sm focus:border-red-600 outline-none"
                        value={username} onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password" placeholder="Password"
                        className="w-full bg-slate-50 border-2 border-transparent rounded-xl px-5 py-4 text-sm focus:border-red-600 outline-none"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && <div className="text-red-600 text-center text-[11px] font-black">{error}</div>}
                    <button
                        type="submit" disabled={loading}
                        className="w-full bg-red-600 text-white rounded-xl py-4 font-black uppercase tracking-widest shadow-lg hover:bg-red-700 transition-all"
                    >
                        {loading ? "Checking..." : "เข้าสู่ระบบ"}
                    </button>
                </form>
            </div>
        </div>
    );
}