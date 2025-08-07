import { useState } from "react";
import Sidebar from "./sidebar";
import EmpresasPanel from "./EmpresasPanel";
import { FiMenu } from "react-icons/fi";

export default function EmpresasAgricultoresPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bgNight = "bg-[#161616]";
  const darkMode = true; // Usa tu lógica si quieres cambiar

  return (
    <div className={`min-h-screen flex ${darkMode ? bgNight : "bg-[#f6f4f2]"}`}>
      {!sidebarOpen && (
        <button
          className="fixed z-50 top-5 left-3 bg-orange-500 text-white rounded-full p-2 shadow-xl"
          onClick={() => setSidebarOpen(true)}
        >
          <FiMenu className="text-2xl" />
        </button>
      )}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className={`flex-1 p-6 md:p-10 transition-all duration-300 ${sidebarOpen ? 'md:ml-[260px]' : ''}`}>
        <div className="max-w-6xl mx-auto">
          <EmpresasPanel />
        </div>
      </main>
    </div>
  );
}
