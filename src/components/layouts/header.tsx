import { Typography } from "antd";
import { BiSearch } from 'react-icons/bi';
import { BsCart3 } from 'react-icons/bs';
import { AiOutlineMenu } from 'react-icons/ai';
import "../../assets/scss/header.scss"
export function HeaderCustom(){
    return(
        <>
            <div className="Layout__Header--logo">
                <Typography.Title className="title"  >GenZStyle</Typography.Title>
            </div>
            <div className="Layout__Header--nav">
                <Typography.Link className="link" href="/">Home</Typography.Link>
                <Typography.Link className="link" href="/shop">Shop</Typography.Link>
            </div>
            <div className="Layout__Header--icon">
            <BiSearch className="icon" > </BiSearch>
            <BsCart3 className="icon"></BsCart3>
            <AiOutlineMenu className="icon"></AiOutlineMenu>
            </div>
        </>
    )
}