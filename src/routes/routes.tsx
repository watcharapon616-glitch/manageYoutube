import React, { useRef } from "react";
import { Navigate, useRoutes } from "react-router-dom";
import SaveData from "../Component/Ecom/SaveData";
import ExpiryTodayReport from "../Component/Ecom/ExpiryTodayReport";
import RevenueReport from "../Component/Ecom/RevenueReport";
import Menu_index from "../Component/Menu/Menu_index";
import Login from "../Component/Ecom/Login";

// 1. สร้างด่านตรวจ (ProtectedRoute) ที่แก้ไขแล้ว
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"; // ต้องเช็คว่าเป็น String "true"
  const userId = localStorage.getItem("user_name_id");

  // ถ้าไม่มีข้อมูล หรือข้อมูลไม่ใช่ true ให้ดีดไปหน้า Login ทันที
  if (!isLoggedIn || !userId) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default function Router() {
  const menupayRef = useRef(null);

  return useRoutes([
    {
      path: "/login",
      element: <Login />, // หน้า Login ไม่ต้องมีด่านตรวจครอบ
    },
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Menu_index pageshow={<SaveData />} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/SaveData",
      element: (
        <ProtectedRoute>
          <Menu_index pageshow={<SaveData />} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/ExpiryTodayReport",
      element: (
        <ProtectedRoute>
          <Menu_index pageshow={<ExpiryTodayReport />} />
        </ProtectedRoute>
      ),
    },
    {
      path: "/RevenueReport",
      element: (
        <ProtectedRoute>
          <Menu_index pageshow={<RevenueReport />} />
        </ProtectedRoute>
      ),
    },
    // ถ้าพิมพ์ URL ผิด (เช่น /abc) ให้เด้งกลับไปหน้าแรก (ซึ่งจะถูกเช็ค Login อีกที)
    {
      path: "*",
      element: <Navigate to="/" replace />,
    },
  ]);
}