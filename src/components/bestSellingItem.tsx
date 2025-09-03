import { BiHeart } from 'react-icons/bi';
export default function BestSellingItem() {
    return (
        <>
            <div className=" border-[2px] border-[var(--border)] rounded-[25px] h-[430px] w-full row-span-3">
                <div className="">
                    <img src="/images/bst_item_1.png"></img>
                </div>
                <div>
                    <h3>Tên</h3>
                    <div>
                        <div>
                            <p>Giá</p>
                            <p>giá cũ</p>
                        </div>
                        <button></button>
                    </div>
                </div>
                <button><BiHeart/></button>
                <div>
                    <p>new</p>
                </div>
            </div>

        </>
    )
}