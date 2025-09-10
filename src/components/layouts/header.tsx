import { Typography } from "antd";
import { BiSearch } from 'react-icons/bi';
import { BsCart3 } from 'react-icons/bs';
import { AiOutlineMenu } from 'react-icons/ai';
import "../../assets/scss/header.scss"
import { IoCloseOutline } from "react-icons/io5";
import { useState } from "react";
export function HeaderCustom() {
    const [searchShow, setSearchShow] = useState(false);
    const [menuShow, setMenuShow] = useState(false);
    return (
        <>
            <div className="Layout__Header--logo">
                <Typography.Title className="title"  >GenZStyle</Typography.Title>
            </div>
            <div className="Layout__Header--nav">
                <Typography.Link className="link" href="/">Home</Typography.Link>
                <Typography.Link className="link" href="/shop">Shop</Typography.Link>
            </div>
            <div className="Layout__Header--icon">
                <BiSearch onClick={() => setSearchShow(true)}  className="icon" > </BiSearch>
                <BsCart3 className="icon"></BsCart3>
                <AiOutlineMenu onClick={() => setMenuShow(true)} className="icon"></AiOutlineMenu>
            </div>
            {searchShow && (
                <div className={`Layout__Header--search ${searchShow ? "open" : ""} absolute top-0 left-0 w-full h-[200px] z-20 backdrop-filter backdrop-blur-sm bg-opacity-70 border border-gray-100 bg-gray-300 flex justify-center items-center`}>
                    <input className="search-input w-[70%] h-[50px] rounded-[30px] border border-[var(--border)] m-auto pl-[15px] " type="text" placeholder="Sreach.." />
                    <button onClick={() => setSearchShow(false)} className="closeButton absolute right-[30px] top-[30px]"><IoCloseOutline className=" h-[32px] w-[32px]" /></button>
                </div>
            )};
            {menuShow && (
               <div className={`Layout__Header--menu ${menuShow ? "open" : ""} absolute top-0 left-0 w-full h-[200px] z-20 backdrop-filter backdrop-blur-sm bg-opacity-70 border border-gray-100 bg-gray-300 flex flex-col justify-center items-center gap-4`}>
                    <button className="menu-login w-[35%] h-[60px] bg-[var(--black)] text-white rounded-xl border-[2px] text-base border-black border-solid   hover:scale-105 transition ">Login</button>
                    <button className="menu-register w-[35%] h-[60px] text-base rounded-xl border-[2px] border-black border-solid  hover:scale-105 transition ">Register</button>
                    <button/>
                    <button onClick={() => setMenuShow(false)} className="closeButton absolute right-[30px] top-[30px]"><IoCloseOutline className=" h-[32px] w-[32px]" /></button>
                </div>
            )};
        </>
    )
}