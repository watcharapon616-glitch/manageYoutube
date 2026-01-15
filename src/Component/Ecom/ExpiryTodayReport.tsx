import React, { useEffect, useState } from "react";
// --- Import สิ่งที่สร้างไว้จาก config ---
import { fetchSheetData, postSheetData } from "./apiConfig";

// --- Helper Functions (ตัดส่วนที่ซ้ำออกเพื่อความคล่องตัว) ---

const formatDateToYYYYMMDD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const parseDateString = (dateStr: string) => {
    if (!dateStr) return new Date();
    let s = String(dateStr).trim();
    if (s.includes("T")) s = s.split("T")[0];
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
};

const displayThaiDate = (dateStr: string) => {
    if (!dateStr) return "-";
    let s = String(dateStr).trim();
    if (s.includes("T")) s = s.split("T")[0];
    const parts = s.split("-");
    if (parts.length !== 3) return s;
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
};

export default function ExpiryTodayReport() {
    const [sheets, setSheets] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [renewMonths, setRenewMonths] = useState<{ [key: string]: number }>({});

    const [statusPopup, setStatusPopup] = useState<{
        show: boolean,
        type: 'success' | 'loading' | 'confirm',
        message: string,
        onConfirm?: () => void
    } | null>(null);

    useEffect(() => {
        getData();
    }, []);

    // ใช้ฟังก์ชันจาก apiConfig แทนการ fetch เอง
    async function getData() {
        setLoading(true);
        try {
            const todayStr = formatDateToYYYYMMDD(new Date());
            const data = await fetchSheetData(); // เรียกผ่าน Config กลาง

            const expiredToday = data.filter((item: any) => {
                let d2 = String(item.date2 || "").trim();
                if (d2.includes("T")) d2 = d2.split("T")[0];
                return d2 === todayStr;
            });

            setSheets(expiredToday);

            const initialMonths: { [key: string]: number } = {};
            expiredToday.forEach((item: any) => { initialMonths[item.id] = 1; });
            setRenewMonths(initialMonths);
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    }

    const renewMember = async (item: any) => {
        const months = renewMonths[item.id] || 1;

        setStatusPopup({
            show: true,
            type: 'confirm',
            message: `ยืนยันต่ออายุ ${item.name} +${months} เดือน?`,
            onConfirm: async () => {
                setStatusPopup({ show: true, type: 'loading', message: 'กำลังบันทึกข้อมูล...' });

                try {
                    const oldExpiry = parseDateString(item.date2);
                    const startDate = new Date(oldExpiry);
                    // หมายเหตุ: date1 ใหม่ คือวันที่หมดอายุเดิม (เริ่มต่อเนื่องทันที)

                    const nextExpiry = new Date(startDate);
                    nextExpiry.setMonth(nextExpiry.getMonth() + months);
                    nextExpiry.setDate(nextExpiry.getDate() - 1);

                    const payload = {
                        // ระบุค่าที่ต้องการอัปเดตให้ชัดเจน
                        action: "update",
                        id: String(item.id), // ต้องส่ง ID ไปเสมอเพื่อให้อ้างอิงแถวถูก
                        idname: item.idname,  // ล็อกค่า idname เดิมไว้
                        pass: item.pass,      // ล็อกค่า pass เดิมไว้
                        name: item.name,      // ล็อกค่าชื่อเดิมไว้
                        detials: item.detials, // ล็อกค่ารายละเอียดเดิมไว้ (เช็คตัวสะกด detials ให้ตรงกับ Sheet)
                        date1: formatDateToYYYYMMDD(startDate),
                        date2: formatDateToYYYYMMDD(nextExpiry)
                    };

                    // ตรวจสอบค่าก่อนส่งใน Console
                    console.log("กำลังส่งข้อมูลอัปเดต:", payload);

                    // เรียกผ่าน Config กลาง
                    await postSheetData(payload);

                    setStatusPopup({ show: true, type: 'success', message: 'ต่ออายุสำเร็จเรียบร้อยแล้ว' });

                    setTimeout(() => {
                        setStatusPopup(null);
                        getData();
                    }, 1500);

                } catch (e) {
                    console.error("Save Error:", e);
                    setStatusPopup(null);
                }
            }
        });
    };

    const deleteMember = async (id: string) => {
        setStatusPopup({
            show: true,
            type: 'confirm',
            message: 'ยืนยันไม่ต่ออายุและลบรายชื่อนี้?',
            onConfirm: async () => {
                setStatusPopup({ show: true, type: 'loading', message: 'กำลังลบข้อมูล...' });
                try {
                    // เรียกผ่าน Config กลาง
                    await postSheetData({ action: "delete", id });

                    setStatusPopup({ show: true, type: 'success', message: 'ลบข้อมูลสำเร็จ' });
                    setTimeout(() => { setStatusPopup(null); getData(); }, 1500);
                } catch (e) {
                    setStatusPopup(null);
                }
            }
        });
    };

    return (
        <div className="w-full min-h-screen bg-[#F0F4F9] text-[#1f1f1f] font-sans pb-10 italic font-bold">

            {/* Header */}
            <div className="bg-white px-5 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
                <div className="flex flex-col">
                    <h1 className="text-base font-black tracking-tight uppercase leading-none">Expired Today</h1>
                    <p className="text-[10px] text-slate-400 mt-1">{displayThaiDate(formatDateToYYYYMMDD(new Date()))}</p>
                </div>
                <div className="bg-[#FFF1F1] px-3 py-1 rounded-full border border-[#FFDADA]">
                    <span className="text-[#FF5A5F] font-black text-xs">{sheets.length} รายชื่อ</span>
                </div>
            </div>

            <div className="max-w-[450px] mx-auto px-4 mt-6">
                <input
                    type="text"
                    placeholder="ค้นหาชื่อ..."
                    className="w-full py-3 px-6 rounded-2xl bg-white shadow-sm border-none outline-none text-sm mb-5 font-bold italic"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div className="space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="w-8 h-8 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin"></div>
                            <p className="text-[10px] text-slate-400 uppercase">Loading Data...</p>
                        </div>
                    ) : sheets.length === 0 ? (
                        <div className="text-center py-20 bg-white/50 rounded-[2rem] border-2 border-dashed border-slate-200">
                            <p className="text-slate-400 text-sm italic">ไม่มีรายชื่อหมดอายุในวันนี้</p>
                        </div>
                    ) : (
                        sheets
                            .filter((item: any) => String(item.name || "").toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((item: any, index: number) => (
                                <div key={index} className="bg-white rounded-[1.8rem] p-5 shadow-sm border border-slate-50 animate-in fade-in zoom-in-95 duration-300">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-black text-lg text-slate-800 uppercase leading-tight">{item.name}</h3>
                                            <div className="flex gap-3 text-[9px] text-slate-400 mt-2 uppercase">
                                                <span>U: {item.idname}</span>
                                                <span>P: {item.pass}</span>
                                            </div>
                                        </div>
                                        <div className="bg-red-500 text-white px-2 py-0.5 rounded text-[8px] font-black italic">EXPIRED</div>
                                    </div>

                                    <div className="flex gap-2 h-11">
                                        <div className="flex-[1.5] bg-slate-50 rounded-xl flex items-center px-3 border border-slate-100">
                                            <input
                                                type="number"
                                                value={renewMonths[item.id] || 1}
                                                onChange={(e) => setRenewMonths({ ...renewMonths, [item.id]: parseInt(e.target.value) || 1 })}
                                                className="w-8 bg-transparent text-center font-black text-slate-700 outline-none text-sm"
                                            />
                                            <span className="text-[9px] text-slate-400 mr-2 uppercase">เดือน</span>
                                            <button
                                                onClick={() => renewMember(item)}
                                                className="ml-auto bg-green-500 text-white px-4 h-[75%] rounded-lg text-[10px] font-black uppercase active:scale-95 transition-all"
                                            >
                                                ต่ออายุ
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => deleteMember(item.id)}
                                            className="flex-1 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase active:scale-95 transition-all shadow-sm shadow-red-100"
                                        >
                                            ลบชื่อ
                                        </button>
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            </div>

            {/* Popup System */}
            {statusPopup?.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-8">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"></div>
                    <div className="relative bg-white w-full max-w-[320px] rounded-[2.5rem] p-8 shadow-2xl text-center animate-in zoom-in-95 duration-200">
                        {statusPopup.type === 'loading' && (
                            <div className="flex flex-col items-center">
                                <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                                <p className="text-slate-500 text-sm italic">{statusPopup.message}</p>
                            </div>
                        )}
                        {statusPopup.type === 'success' && (
                            <div className="flex flex-col items-center">
                                <div className="w-14 h-14 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-2xl mb-4 animate-bounce">✓</div>
                                <p className="font-black text-slate-800 text-lg leading-tight uppercase">{statusPopup.message}</p>
                            </div>
                        )}
                        {statusPopup.type === 'confirm' && (
                            <div className="flex flex-col items-center">
                                <div className="w-14 h-14 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center text-2xl mb-4">?</div>
                                <p className="text-slate-700 text-sm mb-6 leading-relaxed">{statusPopup.message}</p>
                                <div className="flex gap-3 w-full">
                                    <button onClick={() => setStatusPopup(null)} className="flex-1 py-3 text-xs font-bold text-slate-300 uppercase">ยกเลิก</button>
                                    <button onClick={statusPopup.onConfirm} className="flex-1 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase shadow-lg shadow-slate-200">ยืนยัน</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}