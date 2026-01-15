import React, { useEffect, useState } from "react";
// --- Import ฟังก์ชันดึงข้อมูลจาก config กลาง ---
import { fetchSheetData } from "./apiConfig";

interface MemberData {
    date1: string; // วันที่เริ่มสมัคร/ต่ออายุ
}

export default function RevenueReport() {
    const [sheets, setSheets] = useState<MemberData[]>([]);
    const [loading, setLoading] = useState(false);
    
    // ตั้งค่ารายได้ต่อคน (แก้ไขที่นี่ที่เดียว)
    const PRICE_PER_MEMBER = 79;

    useEffect(() => { 
        loadData(); 
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // เรียกข้อมูลผ่าน Config กลาง
            const data = await fetchSheetData();
            setSheets(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Revenue Load Error:", error);
            setSheets([]);
        } finally {
            setLoading(false);
        }
    };

    // ฟังก์ชันคำนวณรายได้เฉพาะเดือนปัจจุบัน
    const calculateCurrentMonthRevenue = () => {
        const now = new Date();
        const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
        const currentYear = String(now.getFullYear());

        let total = 0;
        let count = 0;

        sheets.forEach(item => {
            if (!item.date1) return;
            
            // ปรับ logic การเช็คให้ครอบคลุม format YYYY-MM-DD หรือ DD/MM/YYYY
            const dateStr = String(item.date1);
            const isMatch = (dateStr.includes(`${currentMonth}/${currentYear}`)) || 
                            (dateStr.startsWith(`${currentYear}-${currentMonth}`));

            if (isMatch) {
                total += PRICE_PER_MEMBER;
                count += 1;
            }
        });

        return { total, count };
    };

    const { total, count } = calculateCurrentMonthRevenue();

    return (
        <div className="w-full min-h-screen bg-[#FDFDFD] text-slate-900 font-sans p-6">
            <div className="max-w-md mx-auto">
                
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-black italic uppercase">รายได้ของเดือนนี้</h1>
                    <div className="h-1.5 w-10 bg-red-600 rounded-full mt-1"></div>
                </div>

                {/* Dashboard Card */}
                <div className="bg-[#1e293b] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-200 relative overflow-hidden mb-6">
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold opacity-50 uppercase tracking-[0.2em] mb-1">
                            ยอดเงินโอนเข้าเดือนนี้
                        </p>
                        <h2 className="text-5xl font-black tracking-tighter mb-6">
                            ฿{total.toLocaleString()}
                        </h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 rounded-2xl p-4 border border-white/5">
                                <p className="text-[9px] font-bold opacity-50 uppercase mb-1">จำนวนลูกค้า</p>
                                <p className="text-xl font-black">{count} <span className="text-xs font-normal opacity-70">คน</span></p>
                            </div>
                            <div className="bg-white/10 rounded-2xl p-4 border border-white/5">
                                <p className="text-[9px] font-bold opacity-50 uppercase mb-1">เรทราคา</p>
                                <p className="text-xl font-black">{PRICE_PER_MEMBER} <span className="text-xs font-normal opacity-70">บาท</span></p>
                            </div>
                        </div>
                    </div>
                    {/* Decor Background Effect */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-600/30 rounded-full blur-[50px]"></div>
                </div>

                {/* Info Section */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-800">สรุปยอดตามรายชื่อจริง</h4>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                ระบบจะคำนวณรายได้จากรายชื่อสมาชิกที่มี "วันที่เริ่ม" (date1) อยู่ภายในเดือนปัจจุบันเท่านั้น
                            </p>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={loadData}
                    disabled={loading}
                    className="w-full mt-6 py-4 bg-slate-100 rounded-2xl text-slate-500 font-bold text-xs uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                            กำลังอัปเดต...
                        </span>
                    ) : "อัปเดตข้อมูลล่าสุด"}
                </button>

            </div>
        </div>
    );
}