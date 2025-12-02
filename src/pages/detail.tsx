import { useParams } from "react-router-dom";
import { useState } from "react";
import productList from "../data/product.json";
import type { Product } from "../types/product.type";

export default function ProductPage() {
  const { id } = useParams();
  const product: Product | undefined = productList.find(
    (p) => p.id.toString() === id
  );

  // vẫn khai báo state bình thường
  const [activeImg, setActiveImage] = useState(product?.image ?? "");
  const [amount, setAmount] = useState(1);

  if (!product) {
    return <h2 className="text-center text-2xl mt-20">Product not found</h2>;
  }

  const images = {
    img1: product.image,
    img2: product.image,
    img3: product.image,
    img4: product.image,
  };

  const handleDecrease = () => {
    setAmount((prev) => (prev > 1 ? prev - 1 : 1));
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* LEFT IMAGE SECTION */}
      <div className="flex flex-col justify-center items-center gap-6 lg:w-1/2 bg-gray-50 p-6">
        <img
          src={activeImg}
          alt={product.name}
          className="w-full h-[600px] object-contain rounded-xl"
        />
        <div className="flex flex-row justify-center gap-4">
          {Object.values(images).map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`product-${idx}`}
              onClick={() => setActiveImage(img)}
              className={`w-24 h-24 rounded-md cursor-pointer border-2 transition ${
                activeImg === img
                  ? "border-violet-600"
                  : "border-transparent hover:border-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* RIGHT INFO SECTION */}
      <div className="flex flex-col justify-center gap-6 lg:w-1/2 p-12">
        <div>
          <span className="text-violet-600 font-semibold">Special Sneaker</span>
          <h1 className="text-4xl font-bold mt-2">{product.name}</h1>
        </div>

        <p className="text-gray-700 leading-relaxed">
          {product.description || "No description available."}
        </p>

        <h6 className="text-3xl font-semibold">${product.price}</h6>

        <div className="flex flex-row items-center gap-8">
          <div className="flex flex-row items-center">
            <button
              className="bg-gray-200 py-2 px-5 rounded-lg text-violet-800 text-3xl"
              onClick={handleDecrease}
            >
              -
            </button>
            <span className="py-4 px-6 rounded-lg text-xl">{amount}</span>
            <button
              className="bg-gray-200 py-2 px-4 rounded-lg text-violet-800 text-3xl"
              onClick={() => setAmount((prev) => prev + 1)}
            >
              +
            </button>
          </div>
          <button className="bg-violet-800 text-white font-semibold py-3 px-12 rounded-xl h-full hover:bg-violet-700 transition">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
