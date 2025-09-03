import BestSellingItem from "./bestSellingItem";

export default function BestSellingList(){
   return (
  <>
    <div className="w-full px-[80px]  h-[500px] grid grid-flow-col  gap-10">
        <BestSellingItem/>
        {/* tự soạn data giả ở list ==>map truyền qua prop đến item (truyền  product) */}
    </div>
  </>
)

}