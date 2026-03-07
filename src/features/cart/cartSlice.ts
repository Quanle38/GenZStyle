/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Cart, RemoveItemResponse } from "./cartTypes";
import { cartAPI } from "./cartAPI";
import { extractErrorMessage } from "../../utils/extractErrorMessage";

//
// ===== STATE =====
//
interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  isLoading: false,
  error: null
};

//
// ===== THUNK =====
//

// 🔥 GET CART
export const getCartThunk = createAsyncThunk(
  "cart/get",
  async (_, thunkAPI) => {
    try {
      const response = await cartAPI.get();
      return response.data.data as Cart;
    } catch (error) {
      return thunkAPI.rejectWithValue(extractErrorMessage(error));
    }
  }
);

// 🔥 ADD ITEM TO CART
export const addCartItemThunk = createAsyncThunk<
  Cart,
  { variant_id: string; quantity: number }
>(
  "cart/addItem",
  async (body, thunkAPI) => {
    try {
      const response = await cartAPI.add(body);
      return response.data.data as Cart;
    } catch (error) {
      return thunkAPI.rejectWithValue(extractErrorMessage(error));
    }
  }
);

// 🔥 REMOVE ITEM FROM CART
export const removeCartItemThunk = createAsyncThunk<
  RemoveItemResponse,
  number
>(
  "cart/removeItem",
  async (cartItemId, thunkAPI) => {
    try {
      const response = await cartAPI.remove(cartItemId);
      return response.data as RemoveItemResponse;
    } catch (error) {
      return thunkAPI.rejectWithValue(extractErrorMessage(error));
    }
  }
);

// 🔥 UPDATE CART ITEM
export const updateCartItemThunk = createAsyncThunk<
  Cart,
  {
    cartItemId: number;
    body: {
      variantId?: string;
      quantity?: number;
    };
  }
>(
  "cart/updateItem",
  async ({ cartItemId, body }, thunkAPI) => {
    try {
      const response = await cartAPI.update(cartItemId, body);
      return response.data.data as Cart;
    } catch (error) {
      return thunkAPI.rejectWithValue(extractErrorMessage(error));
    }
  }
);

//
// ===== SLICE =====
//
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart: (state) => {
      state.cart = null;
      state.isLoading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // ===== GET CART =====
      .addCase(getCartThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCartThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
        state.error = null;
      })
      .addCase(getCartThunk.rejected, (state, action) => {
        state.isLoading = false;

        if (action.payload) {
          state.error = (action.payload as { message: string }).message;
        } else {
          state.error = action.error.message || "Get cart failed";
        }
      })

      // ===== ADD ITEM =====
      .addCase(addCartItemThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addCartItemThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
        state.error = null;
      })
      .addCase(addCartItemThunk.rejected, (state, action) => {
        state.isLoading = false;

        if (action.payload) {
          state.error = (action.payload as { message: string }).message;
        } else {
          state.error = action.error.message || "Add item failed";
        }
      })

      // ===== REMOVE ITEM =====
      .addCase(removeCartItemThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeCartItemThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(removeCartItemThunk.rejected, (state, action) => {
        state.isLoading = false;

        if (action.payload) {
          state.error = (action.payload as { message: string }).message;
        } else {
          state.error = action.error.message || "Remove item failed";
        }
      })
      // ===== UPDATE ITEM =====
      .addCase(updateCartItemThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartItemThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
        state.error = null;
      })
      .addCase(updateCartItemThunk.rejected, (state, action) => {
        state.isLoading = false;

        if (action.payload) {
          state.error = (action.payload as { message: string }).message;
        } else {
          state.error = action.error.message || "Update cart item failed";
        }
      });

  }
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
