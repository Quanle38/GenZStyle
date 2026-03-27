/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  Product,
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductListParams,
} from "./productTypes";
import { productAPI } from "./productAPI";
import { extractErrorMessage } from "../../utils/extractErrorMessage";

//
// ===== STATE =====
//
interface ProductState {
  product: Product | null;
  productList: Product[];
  currentPage: number;
  totalPage: number;
  totalProduct: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  product: null,
  productList: [],
  currentPage: 1,
  totalPage: 1,
  totalProduct: 0,
  isLoading: false,
  error: null,
};

//
// ===== THUNKS =====
//

// GET ALL
export const getAllProductThunk = createAsyncThunk<
  { data: Product[]; currentPage: number; totalPage: number; totalProduct: number },
  ProductListParams | undefined
>(
  "product/getAll",
  async (params, thunkAPI) => {
    try {
      const response = await productAPI.getAll(params);
      const { data, currentPage, totalPage, totalProduct } = response.data;
      return { data, currentPage, totalPage, totalProduct };
    } catch (error) {
      return thunkAPI.rejectWithValue(extractErrorMessage(error));
    }
  }
);

// GET BY ID
export const getProductByIdThunk = createAsyncThunk<Product, string>(
  "product/getById",
  async (productId, thunkAPI) => {
    try {
      const response = await productAPI.getById(productId);
      return response.data.data as Product;
    } catch (error) {
      return thunkAPI.rejectWithValue(extractErrorMessage(error));
    }
  }
);

// SEARCH
export const searchProductThunk = createAsyncThunk<Product[], string>(
  "product/search",
  async (query, thunkAPI) => {
    try {
      const response = await productAPI.search(query);
      return response.data.data as Product[];
    } catch (error) {
      return thunkAPI.rejectWithValue(extractErrorMessage(error));
    }
  }
);

// CREATE (ADMIN)
export const createProductThunk = createAsyncThunk<Product, ProductCreateRequest>(
  "product/create",
  async (body, thunkAPI) => {
    try {
      const response = await productAPI.create(body);
      return response.data.data as Product;
    } catch (error) {
      return thunkAPI.rejectWithValue(extractErrorMessage(error));
    }
  }
);

// UPDATE (ADMIN)
export const updateProductThunk = createAsyncThunk<
  Product,
  { id: string; body: ProductUpdateRequest }
>(
  "product/update",
  async ({ id, body }, thunkAPI) => {
    try {
      const response = await productAPI.update(id, body);
      return response.data.data as Product;
    } catch (error) {
      return thunkAPI.rejectWithValue(extractErrorMessage(error));
    }
  }
);

// DELETE (ADMIN)
export const deleteProductThunk = createAsyncThunk<string, string>(
  "product/delete",
  async (id, thunkAPI) => {
    try {
      await productAPI.delete(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(extractErrorMessage(error));
    }
  }
);

//
// ===== SLICE =====
//
const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    clearProduct: (state) => {
      state.product = null;
      state.isLoading = false;
      state.error = null;
    },
    clearProductList: (state) => {
      state.productList = [];
      state.currentPage = 1;
      state.totalPage = 1;
      state.totalProduct = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // ===== GET ALL =====
      .addCase(getAllProductThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllProductThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.data;
        state.currentPage = action.payload.currentPage;
        state.totalPage = action.payload.totalPage;
        state.totalProduct = action.payload.totalProduct;
        state.error = null;
      })
      .addCase(getAllProductThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as any)?.message || "Get products failed";
      })

      // ===== GET BY ID =====
      .addCase(getProductByIdThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProductByIdThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.product = action.payload;
        state.error = null;
      })
      .addCase(getProductByIdThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as any)?.message || "Get product failed";
      })

      // ===== SEARCH =====
      .addCase(searchProductThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProductThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload;
        state.error = null;
      })
      .addCase(searchProductThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as any)?.message || "Search failed";
      })

      // ===== CREATE =====
      .addCase(createProductThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProductThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList.unshift(action.payload);
        state.error = null;
      })
      .addCase(createProductThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as any)?.message || "Create product failed";
      })

      // ===== UPDATE =====
      .addCase(updateProductThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProductThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload;
        state.productList = state.productList.map((item) =>
          item.id === updated.id ? updated : item
        );
        state.product = updated;
        state.error = null;
      })
      .addCase(updateProductThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as any)?.message || "Update product failed";
      })

      // ===== DELETE =====
      .addCase(deleteProductThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProductThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = state.productList.filter(
          (item) => item.id !== action.payload
        );
        state.error = null;
      })
      .addCase(deleteProductThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as any)?.message || "Delete product failed";
      });
  },
});

export const { clearProduct, clearProductList } = productSlice.actions;
export default productSlice.reducer;