import type { Product } from "../types/product.type";
import BestSellingItem from "./bestSellingItem";

export default function BestSellingList() {
  const products : Product[] = [
    {
      id: 1,
      name: "Slick formal sneaker shoe",
      price: 2999,
      oldPrice: 3999,
      image: "/images/bst_item_1.png",
    },
    {
      id: 2,
      name: "Casual summer dress",
      price: 1999,
      oldPrice: 2999,
      image: "/images/bst_item_2.png",
    },
    {
      id: 3,
      name: "Stylish sunglasses",
      price: 999,
      oldPrice: 1499,
      image: "/images/bst_item_3.png",
    },
    {
      id: 4,
      name: "Elegant wristwatch",
      price: 4999,
      oldPrice: 5999,
      image: "/images/bst_item_4.png",
    },
    {
      id: 5,
      name: "Classic leather belt",
      price: 1299,
      oldPrice: 1799,
      image: "/images/bst_item_5.png",
    },
    {
      id: 6,
      name: "Trendy backpack",
      price: 2499,
      oldPrice: 2999,
      image: "/images/bst_item_6.png",
    },
  ];

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