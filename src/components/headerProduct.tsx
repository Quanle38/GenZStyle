import { Typography } from "antd";
import { BiSearch } from "react-icons/bi";
import { BsCart3 } from "react-icons/bs";
import { AiOutlineMenu } from "react-icons/ai";
import { IoCloseOutline } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitch from "./languageSwitch";
import { useAuth } from "../hooks/useAuth";


export default function HeaderProduct() {
  const [searchShow, setSearchShow] = useState(false);
  const [menuShow, setMenuShow] = useState(false);
  const [openAvt, setOpenAvt] = useState(false);

  const navigate = useNavigate();
  const { t } = useTranslation("header");
  const { isAuthenticated, logout } = useAuth();

  const logoutFun = async () => {
    await logout();
    setOpenAvt(false);
  };

  return (
    <>
      {/* HEADER BAR */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 lg:px-16">
          <div className="h-20 flex items-center justify-between">

            {/* LOGO */}
            <Typography.Title
              level={4}
              className="!mb-0 cursor-pointer tracking-wide font-extrabold scale-y-95"
              onClick={() => navigate("/")}
            >
              GenZStyle
            </Typography.Title>

            {/* ICONS */}
            <div className="flex items-center gap-8 text-[22px] text-black">

              <LanguageSwitch className="hover:scale-100" />

              <BiSearch
                className="cursor-pointer transition hover:scale-110"
                onClick={() => setSearchShow(true)}
              />

              <BsCart3
                className="cursor-pointer transition hover:scale-110"
                onClick={() => navigate("/cart")}
              />

              {isAuthenticated ? (
                <FaUserCircle
                  size={24}
                  className="cursor-pointer transition hover:scale-110"
                  onClick={() => setOpenAvt(!openAvt)}
                />
              ) : (
                <AiOutlineMenu
                  className="cursor-pointer transition hover:scale-110"
                  onClick={() => setMenuShow(true)}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* SEARCH OVERLAY */}
      {searchShow && (
        <div className="fixed top-0 left-0 w-full h-[200px] z-[60] bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-center animate-slideDown">
          <input
            type="text"
            placeholder={t("search")}
            className="w-[70%] h-[50px] rounded-full border border-gray-300 px-5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
          />
          <button
            onClick={() => setSearchShow(false)}
            className="absolute top-6 right-6"
          >
            <IoCloseOutline className="w-8 h-8 text-black hover:scale-110 transition" />
          </button>
        </div>
      )}

      {/* AUTH MENU */}
      {menuShow && (
        <div className="fixed top-0 left-0 w-full h-[220px] z-[60] bg-white/80 backdrop-blur-md border-b border-gray-100 flex flex-col items-center justify-center gap-4 animate-slideDown">
          <button
            onClick={() => navigate("/login")}
            className="w-[35%] h-[55px] bg-black text-white rounded-xl text-sm font-medium hover:scale-105 transition"
          >
            {t("login")}
          </button>

          <button
            onClick={() => navigate("/register")}
            className="w-[35%] h-[55px] border border-black rounded-xl text-sm font-medium hover:scale-105 transition"
          >
            {t("register")}
          </button>

          <button
            onClick={() => setMenuShow(false)}
            className="absolute top-6 right-6"
          >
            <IoCloseOutline className="w-8 h-8 text-black hover:scale-110 transition" />
          </button>
        </div>
      )}

      {/* USER DROPDOWN */}
      {openAvt && (
        <div className="fixed top-[80px] right-6 z-[60] w-[160px] bg-white rounded-xl shadow-xl border border-gray-200 animate-fadeDown">
          {[
            { label: "Profile", path: "/profile" },
            { label: "Setting", path: "/setting" },
            { label: "History", path: "/history" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 transition"
            >
              {item.label}
            </button>
          ))}

          <button
            onClick={logoutFun}
            className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 font-medium transition"
          >
            Logout
          </button>
        </div>
      )}
    </>
  );
}
