import type { Product } from "../types/product.type";
import "../components/bestSellingItem"
import BestSellingItem from "../components/bestSellingItem";
interface IListProductProps {
  products: Product[];
}

export default function ListProduct({ products }: IListProductProps) {
  return (
    <>
    <div className="flex flex-col gap-4">
      {products.map((product) => (
        <BestSellingItem key={product.id} product={product} />
      ))}
    </div>
    </>
  );
}
