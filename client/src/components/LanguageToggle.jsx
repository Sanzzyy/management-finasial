import { useLanguage } from "../context/LanguageContext";
import { Globe } from "lucide-react";

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button onClick={toggleLanguage} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1e293b] border border-gray-700 hover:border-blue-500 transition-all group">
      <Globe size={16} className="text-gray-400 group-hover:text-blue-400 transition" />
      <div className="flex items-center text-xs font-bold">
        <span className={`${language === "id" ? "text-white" : "text-gray-600"}`}>ID</span>
        <span className="mx-1 text-gray-600">/</span>
        <span className={`${language === "en" ? "text-white" : "text-gray-600"}`}>EN</span>
      </div>
    </button>
  );
};

export default LanguageToggle;
