import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ReactComponent as Icon_grey } from "../../image/SVG_Memorybox/Navbar Top/Nav icon_grey.svg";

export default function Menu_index(props) {
  const { pageshow } = props;
  const navigate = useNavigate();
  const [opened, setopened] = useState<boolean>(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState<boolean>(false);

  const userName = localStorage.getItem("user_name") || "Member";

  const navigation = [
    { id: 1, text: "เพิ่ม/แก้ไขข้อมูลลูกค้า" },
    { id: 2, text: "หมดอายุในวันนี้" },
    { id: 3, text: "รายได้" },
    { id: 99, text: "ออกจากระบบ", isLogout: true },
  ];

  const menucilck = (item) => {
    setopened(false);
    if (item.id === 1) navigate("../SaveData");
    else if (item.id === 2) navigate("../ExpiryTodayReport");
    else if (item.id === 3) navigate("../RevenueReport");
    else if (item.id === 99) setShowLogoutPopup(true);
  };

const confirmLogout = () => {
  // ลบข้อมูลชัวร์ๆ
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("user_name_id");
  localStorage.clear(); // แถมให้อีกบรรทัดเพื่อความเกลี้ยง

  // ใช้ navigate แทนการพิมพ์ URL เอง
  navigate("/login", { replace: true });
};

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#F6F9FF] relative font-sans italic">
      {/* 1. Navbar */}
      <nav className="fixed top-0 inset-x-0 h-[60px] bg-white shadow-sm z-[3000] flex items-center px-4">
        <div className="flex-1 flex justify-center pl-8">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/YouTube_Premium_logo.svg/1024px-YouTube_Premium_logo.svg.png"
            className="w-28 h-auto"
            alt="logo"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase text-slate-400">{userName}</span>
          <button onClick={() => setopened(!opened)} className="p-2 active:bg-gray-100 rounded-full">
            <Icon_grey className="w-[25px] h-auto" />
          </button>
        </div>
      </nav>

      {/* 2. Dropdown Menu */}
      <div className={`fixed inset-x-0 top-[60px] bg-white shadow-xl z-[2500] transition-all duration-300 transform origin-top ${opened ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 pointer-events-none"}`}>
        <ul className="py-2">
          {navigation.map((item) => (
            <li
              key={item.id}
              className={`px-6 py-4 border-b border-gray-50 active:bg-gray-100 text-sm font-bold uppercase ${item.isLogout ? "text-red-500 bg-red-50/30" : "text-gray-700"}`}
              onClick={() => menucilck(item)}
            >
              {item.text}
            </li>
          ))}
        </ul>
      </div>

      {/* 3. Custom Logout Popup (Tailwind CSS) */}
      {showLogoutPopup && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4">
          {/* Backdrop (Click outside to close) */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLogoutPopup(false)}
          ></div>

          {/* Popup Content */}
          <div className="relative bg-white w-full max-w-[320px] rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-500 text-2xl font-black">!</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Sign Out</h3>
              <p className="text-[11px] text-slate-400 mt-2 mb-8 font-bold uppercase italic">คุณแน่ใจใช่ไหมที่จะออกจากระบบ?</p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={confirmLogout}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200 active:scale-95 transition-all"
                >
                  Yes, Sign Out
                </button>
                <button
                  onClick={() => setShowLogoutPopup(false)}
                  className="w-full py-4 bg-gray-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest active:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop for Dropdown Menu */}
      {opened && <div className="fixed inset-0 bg-black/10 z-[2000]" onClick={() => setopened(false)}></div>}

      {/* 4. Main Content */}
      <main className="flex-1 pt-[60px] w-full flex flex-col items-center">
        <div className="w-full max-w-[1400px] bg-white min-h-[calc(100vh-60px)] shadow-sm">
          {pageshow}
        </div>
      </main>
    </div>
  );
}