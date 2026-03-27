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
  category: string;
  variants: ProductVariant[];
};

/* =======================
   REQUEST BODIES
======================= */
export type VariantCreateDTO = {
  size: number;
  color: string;
  stock: number;
  price: number;
  image?: string | null;
};

export type VariantUpdateDTO = {
  size?: number;
  color?: string;
  stock?: number;
  price?: number;
  image?: string | null;
};

export type ProductCreateRequest = {
  name: string;
  description: string;
  brand: string;
  category: string;
  variants: VariantCreateDTO[];
};

export type ProductUpdateRequest = {
  name?: string;
  description?: string;
  brand?: string;
  category?: string;
  variants?: VariantUpdateDTO[];
};

/* =======================
   QUERY PARAMS
======================= */
export type ProductListParams = {
  page?: number;
  limit?: number;
};

export type ProductSearchParams = {
  name?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: number;
  color?: string;
  page?: number;
  limit?: number;
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
  currentPage: number;
  totalPage: number;
  totalProduct: number;
  data: Product[];
};