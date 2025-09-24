import { IoIosHeartEmpty, IoIosHeart } from "react-icons/io";
import { FaArrowUp } from "react-icons/fa6";
import { useState } from "react";
import Badge from "./badge";
import type { Product } from "../types/product.type";
interface IBestSellingItemProps {
    product: Product
}
export default function BestSellingItem({ product }: IBestSellingItemProps) {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <>
            <div className=" border-[2px] border-[var(--border)] rounded-[25px] h-[430px] w-full row-span-3 relative">
                <div className="bst-item flex justify-center ">
                    <img className='w-[300px] h-[300px] mt-[21px]' src={product.image}></img>
                </div>
                <div className='info w-[80%] flex flex-col justify-center items-center m-auto'>
                    <h3 className='name text-xl text-left w-full leading-[138.1%] font-medium'>{product.name}</h3>
                    <div className='below flex justify-between w-full mt-[18px]'>
                        <div className='price flex justify-center items-center gap-[28px] '>
                            <p className='current-price text-xl'>${product.price}</p>
                            <p className='old-price line-through text-base'>${product.oldPrice}</p>
                        </div>
                        <button className='w-[45px] h-[45px] rounded-[50%] bg-[var(--black)] '> <FaArrowUp className='rotate-45 m-auto text-[var(--white)] text-2xl ' /></button>
                    </div>
                </div>
                <button onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} className='absolute top-[38px] right-[31px]'>{isHovered ? <IoIosHeart className='text-3xl m-auto' /> : <IoIosHeartEmpty className='text-3xl m-auto' />}</button>

                <Badge text="New" className="absolute top-[38px] left-[-4px]" />
            </div>

        </>
    )
}