import type { Product } from "../types/product.type";
import { IoIosHeartEmpty, IoIosHeart } from "react-icons/io";
import { FaArrowUp } from "react-icons/fa6";
import { useState } from "react";
import Badge from "./badge";

interface IListProductProps {
  products: Product[];
}

export default function ListProduct({ products }: IListProductProps) {
  return (
    <div className="w-[90%] max-h-full overflow-y-auto flex flex-col gap-4 mx-auto">
      {products.map((product) => (
        <ListItem key={product.id} product={product} />
      ))}
    </div>
  );
}

function ListItem({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex items-center gap-6 p-5 border border-[var(--border)] rounded-[16px] hover:shadow-lg transition relative bg-white">
      {/* Ảnh */}
      <div className="w-[180px] h-[180px] flex-shrink-0 flex justify-center items-center rounded-[12px] overflow-hidden border border-[var(--border)]">
        <img
          src={product.image}
          className="w-full h-full object-contain"
          alt={product.name}
        />
      </div>

      {/* Thông tin */}
      <div className="flex-1 flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-gray-800">{product.name}</h3>
        <div className="flex items-center gap-4 mt-2">
          <p className="text-2xl font-bold text-[var(--black)]">
            ${product.price}
          </p>
          {product.oldPrice && (
            <p className="line-through text-gray-400 text-lg">
              ${product.oldPrice}
            </p>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Lorem ipsum dolor sit amet, description ngắn...
        </p>
      </div>

      {/* Action */}
      <div className="flex flex-col items-center gap-10 pr-4">
        <button
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="transition"
        >
          {isHovered ? (
            <IoIosHeart className="text-3xl " />
          ) : (
            <IoIosHeartEmpty className="text-3xl text-gray-600" />
          )}
        </button>

        <button className="w-[50px] h-[50px] rounded-full bg-[var(--black)] hover:bg-gray-800 transition">
          <FaArrowUp className="rotate-45 m-auto text-white text-2xl" />
        </button>
      </div>

      {/* Badge */}
      <Badge text="New" className="absolute top-[10px] left-[-5px]" />
    </div>
  );
}
