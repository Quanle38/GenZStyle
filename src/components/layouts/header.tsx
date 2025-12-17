import { Typography } from "antd";
import { BiSearch } from 'react-icons/bi';
import { BsCart3 } from 'react-icons/bs';
import { AiOutlineMenu } from 'react-icons/ai';
import "../../assets/scss/header.scss"
import { IoCloseOutline } from "react-icons/io5";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitch from "../languageSwitch";
import { useAuth } from "../../hooks/useAuth";
import { FaUserCircle } from "react-icons/fa";

export function HeaderCustom() {
    const [searchShow, setSearchShow] = useState(false);
    const [menuShow, setMenuShow] = useState(false);
    const [openAvt, setOpenAvt] = useState<boolean>(false);
    const navigate = useNavigate();
    const onNavigate = (link: string) => {
        navigate("/" + link);
    }
    const { isAuthenticated, logout} = useAuth();
    const { t } = useTranslation("header");
    return (
        <>
            <div className="Layout__Header--logo">
                <Typography.Title className="title" >GenZStyle</Typography.Title>
            </div>
            <div className="Layout__Header--nav">
                <Typography.Link className="link" href="/">{t("home")}</Typography.Link>
                <Typography.Link className="link" href="/shop">{t("shop")}</Typography.Link>
            </div>
            <div className="Layout__Header--icon">
                <LanguageSwitch className="icon" />
                <BiSearch onClick={() => setSearchShow(true)} className="icon" > </BiSearch>
                <BsCart3 className="icon" onClick={() => navigate("/cart")} ></BsCart3>
                {isAuthenticated ? (
                    <FaUserCircle
                        size={24}
                        className="icon"
                        onClick={() => setOpenAvt(!openAvt)}
                    />

                ) : (
                    <AiOutlineMenu onClick={() => setMenuShow(true)} className="icon"></AiOutlineMenu>
                )}
            </div>
            {searchShow && (
                <div className={`Layout__Header--search ${searchShow ? "open" : ""} absolute top-0 left-0 w-full h-[200px] z-20 backdrop-filter backdrop-blur-sm bg-opacity-70 border border-gray-100 bg-gray-300 flex justify-center items-center`}>
                    <input className="search-input w-[70%] h-[50px] rounded-[30px] border border-[var(--border)] m-auto pl-[15px] " type="text" placeholder={t("search")} />
                    <button onClick={() => setSearchShow(false)} className="closeButton absolute right-[30px] top-[30px]"><IoCloseOutline className=" h-[32px] w-[32px]" /></button>
                </div>
            )}
            {menuShow && (
                <div className={`Layout__Header--menu ${menuShow ? "open" : ""} absolute top-0 left-0 w-full h-[200px] z-20 backdrop-filter backdrop-blur-sm bg-opacity-70 border border-gray-100 bg-gray-300 flex flex-col justify-center items-center gap-4`}>
                    <button onClick={() => onNavigate("login")} className="menu-login w-[35%] h-[60px] bg-[var(--black)] text-white rounded-xl border-[2px] text-base border-black border-solid font-medium   hover:scale-105 transition ">{t("login")}</button>
                    <button onClick={() => onNavigate("register")} className="menu-register w-[35%] h-[60px] text-base rounded-xl border-[2px] border-black border-solid font-medium  hover:scale-105 transition ">{t("register")}</button>
                    <button />
                    <button onClick={() => setMenuShow(false)} className="closeButton absolute right-[30px] top-[30px]"><IoCloseOutline className=" h-[32px] w-[32px]" /></button>
                </div>
            )}
            {openAvt && (
                <div className="Layout__Header--userMenu absolute right-[20px] top-[70px] w-[180px] bg-white rounded-xl shadow-xl border border-gray-200 z-20 flex flex-col">

                    <button
                        onClick={() => navigate("/profile")}
                        className="menu-item px-4 py-2 text-left hover:bg-gray-100"
                    >
                        Profile
                    </button>

                    <button
                        onClick={() => navigate("/setting")}
                        className="menu-item px-4 py-2 text-left hover:bg-gray-100"
                    >
                        Setting
                    </button>

                    <button
                        onClick={() => navigate("/history")}
                        className="menu-item px-4 py-2 text-left hover:bg-gray-100"
                    >
                        History
                    </button>

                    <button
                        onClick={() => {
                            logout();
                        }}
                        className="menu-item px-4 py-2 text-left hover:bg-red-100 text-red-600 font-medium"
                    >
                        Logout
                    </button>

                </div>
            )}

        </>
    )
}