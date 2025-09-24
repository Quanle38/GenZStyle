import { useEffect, useState } from "react";
import useLanguage from "../hooks/useLanguage";

interface ILanguageSwitch {
  className?: string;
}

export default function LanguageSwitch({ className }: ILanguageSwitch) {
  const { language, changeLanguage } = useLanguage();
  const [isOn, setIsOn] = useState(language === "vi");

  // Sync isOn với language
  useEffect(() => {
    setIsOn(language === "vi");
  }, [language]);

  const handleChangeToggle = () => {
    changeLanguage(isOn ? "en" : "vi");
  };

  return (
    <label
      htmlFor="ToggleLang"
      className={`btn_language inline-flex items-center space-x-4 cursor-pointer select-none ${className} dark:text-gray-800`}
    >
      <span>EN</span>
      <span className="relative">
        <input
          id="ToggleLang"
          type="checkbox"
          className="hidden peer"
          checked={isOn}
          onChange={handleChangeToggle}
        />
        {/* Thanh nền */}
        <div className="w-12 h-6 rounded-full shadow-inner dark:bg-gray-400 peer-checked:bg-[var(--black)] transition-colors duration-300"></div>
        {/* Nút tròn */}
        <div className="absolute inset-y-0 top-[-2px] left-0 w-6 h-6 m-0.5 rounded-full shadow peer-checked:right-0 peer-checked:left-auto dark:bg-gray-100 transition-all duration-300"></div>
      </span>
      <span>VI</span>
    </label>
  );
}
