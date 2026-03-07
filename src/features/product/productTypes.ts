/* =======================
   PRODUCT VARIANT
======================= */
export type ProductVariant = {
  id: string;
  product_id: string;
  size: number;
  color: string;
  stock: number;
  price: string;
  image: string | null;
};

/* =======================
   PRODUCT
======================= */
export type Product = {
  id: string;
  name: string;
  base_price: string;
  description: string;
  brand: string;
  variants: ProductVariant[];
};

/* =======================
   RESPONSE
======================= */
export type ProductResponse = {
  success: boolean;
  message?: string;
  data: Product;
};

export type ProductListResponse = {
  success: boolean;
  message?: string;
  data: Product[];
}
