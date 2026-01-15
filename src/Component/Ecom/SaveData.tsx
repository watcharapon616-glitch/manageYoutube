import React, { useRef, useEffect, useState } from "react";
import { fetchSheetData, postSheetData } from "./apiConfig";

interface MemberData {
    [key: string]: any;
    date1: string;
    date2: string;
    name: string;
    idname: string;
    pass: string;
    detials: string;
}

export default function SaveData() {
    const nameRef = useRef<HTMLInputElement>(null);
    const idnameRef = useRef<HTMLInputElement>(null);
    const passRef = useRef<HTMLInputElement>(null);
    const detailsRef = useRef<HTMLTextAreaElement>(null);

    const [swipe, setswipe] = useState(true);
    const [isPopupVisible, setPopupVisibility] = useState(false);
    const [sheets, setsheets] = useState<MemberData[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [editData, setEditData] = useState<MemberData | null>(null);
    
    // เพิ่มสถานะ warning สำหรับกรณีลืมกรอกข้อมูล
    const [popupType, setPopupType] = useState<"edit" | "delete" | "success" | "warning">("edit");

    const forceFixDate = (dateStr: any) => {
        if (!dateStr || dateStr === "undefined") return "";
        let s = String(dateStr).trim();
        if (s.includes("T")) s = s.split("T")[0];
        return s;
    };

    const formatToThai = (dateStr: any) => {
        const clean = forceFixDate(dateStr);
        if (!clean) return "";
        const parts = clean.split("-");
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return clean;
    };

    const formatDateToYYYYMMDD = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const [startDate, setStartDate] = useState(formatDateToYYYYMMDD(new Date()));
    const [expiryDate, setExpiryDate] = useState("");
    const [monthsToAdd, setMonthsToAdd] = useState<number>(1);

    const calculateExpiry = (start: string, months: number) => {
        if (!start) return;
        const [y, m, d] = start.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        dateObj.setMonth(dateObj.getMonth() + (Number(months) || 0));
        dateObj.setDate(dateObj.getDate() - 1);
        setExpiryDate(formatDateToYYYYMMDD(dateObj));
    };

    const getData = async () => {
        setLoading(true);
        try {
            const data = await fetchSheetData();
            setsheets(Array.isArray(data) ? data : []);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    useEffect(() => {
        getData();
        calculateExpiry(startDate, monthsToAdd);
    }, []);

    const openEdit = (item: MemberData) => {
        setEditData({ ...item, date1: forceFixDate(item.date1), date2: forceFixDate(item.date2) });
        setPopupType("edit");
        setPopupVisibility(true);
    };

    const openDelete = (item: MemberData) => {
        setEditData(item);
        setPopupType("delete");
        setPopupVisibility(true);
    };

    // ฟังก์ชันตรวจสอบข้อมูลห้ามว่าง (ยกเว้น Details)
    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();

        const name = nameRef.current?.value.trim();
        const idname = idnameRef.current?.value.trim();
        const pass = passRef.current?.value.trim();

        // ดักจับข้อมูลว่าง
        if (!name || !idname || !pass) {
            setPopupType("warning");
            setPopupVisibility(true);
            return;
        }

        setLoading(true);
        try {
            await postSheetData({
                action: "add",
                username: "admin1",
                date1: startDate,
                date2: expiryDate,
                name: name,
                idname: idname,
                pass: pass,
                detials: detailsRef.current?.value || "",
            });
            setPopupType("success");
            setPopupVisibility(true);
            getData();
            // Clear fields หลังบันทึกสำเร็จ
            if (nameRef.current) nameRef.current.value = "";
            if (idnameRef.current) idnameRef.current.value = "";
            if (passRef.current) passRef.current.value = "";
            if (detailsRef.current) detailsRef.current.value = "";
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const handleAction = async () => {
        if (!editData) return;

        // ดักจับข้อมูลว่างกรณี "แก้ไข" (ยกเว้น Details)
        if (popupType === "edit") {
            if (!editData.name?.trim() || !editData.idname?.trim() || !editData.pass?.trim()) {
                setPopupType("warning");
                return; // ไม่ต้องปิด Popup แต่เปลี่ยนเป็นหน้า Warning แทน
            }
        }

        setLoading(true);
        try {
            const payload = popupType === "edit" 
                ? { action: "update", username: "admin1", id: String(editData.id || editData.ID), ...editData }
                : { action: "delete", id: String(editData.id || editData.ID), username: "admin1" };
            
            await postSheetData(payload);
            setPopupType("success");
            getData();
        } catch (e) {
            setPopupVisibility(false);
            getData();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#FDFDFD] text-slate-800 font-sans pb-10">
            {/* Header Nav */}
            <div className="sticky top-0 z-[50] bg-white/90 backdrop-blur-md border-b border-slate-100 py-3 shadow-sm">
                <div className="max-w-[1200px] mx-auto px-4 flex justify-center">
                    <div className="bg-slate-100 p-1 rounded-xl flex w-full max-w-[300px] border border-slate-200">
                        <button onClick={() => setswipe(true)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${swipe ? "bg-white text-red-600 shadow-sm" : "text-slate-500"}`}>ลงทะเบียน</button>
                        <button onClick={() => setswipe(false)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${!swipe ? "bg-white text-red-600 shadow-sm" : "text-slate-500"}`}>รายชื่อสมาชิก</button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-4 mt-6">
                {swipe ? (
                    <div className="max-w-md mx-auto bg-white rounded-3xl p-6 shadow-lg border border-slate-50">
                        <h2 className="text-xl font-black italic uppercase mb-6 text-center text-slate-900">เพิ่มสมาชิก</h2>
                        <form onSubmit={handleAddMember} className="space-y-4">
                            <input type="text" ref={nameRef} className="w-full bg-slate-50 rounded-xl p-3.5 border border-slate-100 outline-none font-bold" placeholder="LINE" />
                            <div className="grid grid-cols-2 gap-3">
                                <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); calculateExpiry(e.target.value, monthsToAdd); }} className="w-full bg-slate-50 rounded-xl p-3 text-sm border border-slate-100 font-bold" />
                                <input type="number" value={monthsToAdd} onChange={(e) => { setMonthsToAdd(Number(e.target.value)); calculateExpiry(startDate, Number(e.target.value)); }} className="w-full bg-slate-50 rounded-xl p-3 text-sm border border-slate-100 text-center font-bold" />
                            </div>
                            <div className="p-3 bg-red-50 rounded-xl flex justify-between items-center border border-red-100">
                                <span className="text-[11px] font-bold text-red-500 uppercase">วันหมดอายุ:</span>
                                <span className="text-sm font-black text-red-600">{formatToThai(expiryDate)}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input type="text" ref={idnameRef} placeholder="Email" className="w-full bg-slate-50 rounded-xl p-3 text-sm border border-slate-100 font-bold" />
                                <input type="text" ref={passRef} placeholder="Group" className="w-full bg-slate-50 rounded-xl p-3 text-sm border border-slate-100 font-bold" />
                            </div>
                            <textarea ref={detailsRef} placeholder="Details" className="w-full bg-slate-50 rounded-xl p-3 text-sm border border-slate-100 h-20 outline-none font-bold" />
                            <button type="submit" className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl shadow-lg uppercase text-xs active:scale-95 transition-transform">บันทึกข้อมูล</button>
                        </form>
                    </div>
                ) : (
                    <div className="space-y-4 italic">
                        <div className="max-w-md mx-auto flex gap-2">
                            <input type="text" placeholder="ค้นหาชื่อ..." className="flex-1 py-3 px-6 rounded-full border border-slate-200 shadow-sm outline-none text-sm font-bold" onChange={(e) => setSearchTerm(e.target.value)} />
                            <button onClick={getData} className="bg-slate-100 p-3 rounded-full hover:bg-slate-200 transition-colors">🔄</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-bold">
                            {sheets.filter(item => String(item.name || "").toLowerCase().includes(searchTerm.toLowerCase())).map((item, index) => (
                                <div key={index} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
                                    <div className="flex-1 min-w-0 pr-2 text-left">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-slate-800 text-[15px] truncate">{item.name}</h3>
                                            <span className="text-[9px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">{formatToThai(item.date2)}</span>
                                        </div>
                                        <div className="text-[11px] text-slate-400 font-bold uppercase">U: {item.idname} | P: {item.pass}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEdit(item)} className="bg-yellow-500 text-white px-3 py-2 rounded-lg text-[10px] font-bold shadow-sm active:scale-95 transition-transform">แก้</button>
                                        <button onClick={() => openDelete(item)} className="bg-red-600 text-white px-3 py-2 rounded-lg text-[10px] font-bold shadow-sm active:scale-95 transition-transform">ลบ</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* --- POPUP (เพิ่มเงื่อนไข Warning) --- */}
            {isPopupVisible && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center px-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setPopupVisibility(false)}></div>
                    <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-7 shadow-2xl italic border border-slate-100 animate-in zoom-in duration-200">
                        
                        {popupType === "success" ? (
                            <div className="text-center py-4 space-y-4">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">✓</div>
                                <h3 className="font-black text-xl italic uppercase text-slate-900">ทำรายการสำเร็จ</h3>
                                <p className="text-slate-500 font-bold uppercase text-xs">ข้อมูลถูกบันทึกเรียบร้อยแล้ว</p>
                                <button onClick={() => { setPopupVisibility(false); if(swipe) setswipe(false); }} className="w-full bg-green-600 text-white font-black py-4 rounded-2xl text-xs uppercase shadow-lg active:scale-95">ตกลง</button>
                            </div>
                        ) : popupType === "warning" ? (
                            <div className="text-center py-4 space-y-4">
                                <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto text-3xl">!</div>
                                <h3 className="font-black text-xl italic uppercase text-slate-900">ข้อมูลไม่ครบ</h3>
                                <p className="text-slate-500 font-bold uppercase text-xs leading-relaxed">กรุณากรอกข้อมูลช่อง<br/>LINE, Email และ Group ให้ครบถ้วน</p>
                                <button onClick={() => setPopupVisibility(false)} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl text-xs uppercase shadow-lg active:scale-95">กลับไปแก้ไข</button>
                            </div>
                        ) : (
                            <>
                                <h3 className="font-black text-lg italic uppercase mb-6 text-slate-900">
                                    {popupType === "edit" ? "แก้ไขสมาชิก" : "ยืนยันการลบ"}
                                </h3>
                                <div className="space-y-4 font-bold italic">
                                    {popupType === "edit" ? (
                                        <>
                                            {editData && (
                                                <>
                                                    <input type="text" value={editData.name || ""} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="w-full bg-slate-50 rounded-xl p-3 border border-slate-100 outline-none font-bold" />
                                                    <input type="date" value={forceFixDate(editData.date2)} onChange={(e) => setEditData({ ...editData, date2: e.target.value })} className="w-full bg-yellow-50 rounded-xl p-3 border border-yellow-200 text-red-600 font-black" />
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <input type="text" value={editData.idname || ""} onChange={(e) => setEditData({ ...editData, idname: e.target.value })} className="w-full bg-slate-50 rounded-xl p-3 text-sm border outline-none font-bold" placeholder="User" />
                                                        <input type="text" value={editData.pass || ""} onChange={(e) => setEditData({ ...editData, pass: e.target.value })} className="w-full bg-slate-50 rounded-xl p-3 text-sm border outline-none font-bold" placeholder="Pass" />
                                                    </div>
                                                    <textarea value={editData.detials || ""} onChange={(e) => setEditData({ ...editData, detials: e.target.value })} className="w-full bg-slate-50 rounded-xl p-3 text-sm border border-slate-100 h-20 outline-none font-bold" placeholder="Details" />
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-6">
                                            <p className="text-slate-500 text-sm mb-2 uppercase font-bold">ต้องการลบรายชื่อ</p>
                                            <p className="text-red-600 text-2xl font-black uppercase underline">{editData?.name}</p>
                                        </div>
                                    )}
                                    <button onClick={handleAction} className={`w-full ${popupType === "edit" ? "bg-slate-900" : "bg-red-600"} text-white font-black py-4 rounded-2xl text-xs uppercase shadow-lg active:scale-95 transition-transform`}>
                                        {popupType === "edit" ? "บันทึกการแก้ไข" : "ยืนยันลบข้อมูล"}
                                    </button>
                                    <button onClick={() => setPopupVisibility(false)} className="w-full text-slate-400 text-[10px] uppercase mt-2 text-center block font-bold font-sans hover:text-slate-600">ยกเลิก</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Loading */}
            <div className={`fixed inset-0 z-[2000] flex items-center justify-center bg-white/60 backdrop-blur-sm transition-opacity ${loading ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                <div className="w-10 h-10 border-4 border-slate-100 border-t-red-600 rounded-full animate-spin"></div>
            </div>
        </div>
    );
}