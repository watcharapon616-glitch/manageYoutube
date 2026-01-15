import React from 'react';
// ใช้ HashRouter เพื่อแก้ปัญหา Path บน GitHub Pages โดยตรง
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'; 
import SaveData from './Component/Ecom/SaveData';
import Menu_index from './Component/Menu/Menu_index';
import Login from './Component/Ecom/Login';
import ExpiryTodayReport from './Component/Ecom/ExpiryTodayReport';
import RevenueReport from './Component/Ecom/RevenueReport';

// ส่วนตรวจเช็คการ Login
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userId = localStorage.getItem("user_name_id");

  // หากไม่ได้ Login ให้ส่งกลับไปหน้า Login ผ่าน Hash Path
  if (!isLoggedIn || !userId) return <Navigate to="/login" replace />; 
  return <>{children}</>;
};

export default function App() {
  return (
    /* ใช้ HashRouter โดย "ไม่ต้องใส่ basename" 
       เพื่อให้ URL เป็น zynksite.com/manageYoutube/#/ 
       ซึ่งจะช่วยให้ไฟล์ static โหลดขึ้นมาถูกต้องครับ
    */
    <HashRouter> 
      <Routes>
        {/* หน้า Login */}
        <Route path="/login" element={<Login />} />
        
        {/* หน้าหลักและเมนูต่างๆ ภายใต้ด่านตรวจ */}
        <Route path="/" element={<ProtectedRoute><Menu_index pageshow={<SaveData />} /></ProtectedRoute>} />
        <Route path="/SaveData" element={<ProtectedRoute><Menu_index pageshow={<SaveData />} /></ProtectedRoute>} />
        
        <Route path="/ExpiryTodayReport" element={<ProtectedRoute><Menu_index pageshow={<ExpiryTodayReport />} /></ProtectedRoute>} />
        <Route path="/RevenueReport" element={<ProtectedRoute><Menu_index pageshow={<RevenueReport />} /></ProtectedRoute>} />

        {/* กรณีพิมพ์ Path มั่ว ให้กลับไปที่หน้าแรกของแอป */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}