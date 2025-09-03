import BestSellingList from "./bestSellingList";

export default function BestSelling() {
    return (
        <div className="w-full pt-[124px] pb-[51px]">
            
            <div className="w-full h-3/4 flex justify-center items-center gap-[12px]" >
                <div className="w-[41px] h-[1.5px] bg-[var(--black)]"></div>
                <h2 className="h-[62px] w-[259px] font-medium text-5xl text-center">Best Selling</h2>
                <div className="w-[41px] h-[1.5px] bg-[var(--black)]"></div>
            </div>
            <div className="w-full flex justify-center items-center gap-[42px] py-[42px]">
                <button className="bg-[var(--black)] text-[var(--white)] min-w-[122px] h-[79px] text-[28px] font-medium px-[35px] hover:opacity-[0.5]">Man</button>
                <button className=" text-[var(--description)] border-[2px]  border-[var(--description)] min-w-[122px] h-[79px] text-[28px] font-medium px-[35px]  hover:bg-[var(--description)] hover:text-[var(--white)]">Woman</button>
                <button className=" text-[var(--description)] border-[2px]  border-[var(--description)] min-w-[122px] h-[79px] text-[28px] font-medium px-[35px]  hover:bg-[var(--description)] hover:text-[var(--white)]">Boy</button>
                <button className=" text-[var(--description)] border-[2px] border-[var(--description)] min-w-[122px] h-[79px] text-[28px] font-medium px-[35px]  hover:bg-[var(--description)] hover:text-[var(--white)]">Child</button> 
            </div>
            <div className="w-full h-[900px] ">
                 <BestSellingList/>
            </div>
           
        </div>
    )
}