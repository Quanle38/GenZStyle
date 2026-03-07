/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Product } from "./productTypes";
import { productAPI } from "./productAPI";
import { extractErrorMessage } from "../../utils/extractErrorMessage";

//
// ===== STATE =====
//
interface ProductState {
  product: Product | null;
  isLoading: boolean;
  error: string | null;
  productList : Product[] | [];
}


const initialState: ProductState = {
  product: null,
  isLoading: false,
  error: null,
  productList : []
};

//
// ===== THUNK =====
//
export const getProductByIdThunk = createAsyncThunk<
  Product,
  string
>(
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

export const searchProductThunk = createAsyncThunk<
  Product[],
  string
>(
  "product/",
  async (query, thunkAPI) => {
    try {
      const response = await productAPI.search(query);
      return response.data.data as Product[];
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
    }
  },
  extraReducers: (builder) => {
    builder
      // ===== GET PRODUCT =====
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

        if (action.payload) {
          state.error = (action.payload as { message: string }).message;
        } else {
          state.error = action.error.message || "Get product failed";
        }
      })

      // ===== SEARCH PRODUCT =====
      .addCase(searchProductThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProductThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.productList = action.payload;
      });
  }
});

export const { clearProduct } = productSlice.actions;
export default productSlice.reducer;
