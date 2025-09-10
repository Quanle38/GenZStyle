import type { Product } from "../types/product.type";
import BestSellingItem from "./bestSellingItem";
interface IBestSellingListProps {
 productList : Product[];
}
export default function BestSellingList({productList} : IBestSellingListProps) {
  const products: Product[] = productList;

  return (
    <>
      {/* tự soạn data giả ở list ==>map truyền qua prop đến item (truyền  product) */}
      <div className="w-full px-[80px] grid grid-cols-3 gap-x-10 gap-y-[17px]">
        {products.map((product) => (
          <BestSellingItem key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}