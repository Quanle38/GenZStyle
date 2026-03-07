import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { UserAddress } from "./addressType";
import type {
    GetAllUserAddressResponse,
    CreateUserAddressResponse,
    GetUserAddressDetailResponse,
    UpdateUserAddressResponse,
} from "./addressType";
import { addressAPI } from "./addressAPI";

/* ================= STATE ================= */

interface AddressState {
    list: UserAddress[];
    detail: UserAddress | null;
    loading: boolean;
    error: string | null;
}

const initialState: AddressState = {
    list: [],
    detail: null,
    loading: false,
    error: null,
};

/* ================= THUNKS ================= */

// GET ALL
export const getAllAddressThunk = createAsyncThunk<
    GetAllUserAddressResponse
>("address/getAll", async () => {
    const res = await addressAPI.getAll();
    return res.data;
});

// GET DETAIL
export const getAddressDetailThunk = createAsyncThunk<
    GetUserAddressDetailResponse,
    number
>("address/getDetail", async (addressId) => {
    const res = await addressAPI.getDetail(addressId);
    return res.data;
});

// CREATE
export const createAddressThunk = createAsyncThunk<
    CreateUserAddressResponse,
    Partial<UserAddress>
>("address/create", async (body) => {
    const res = await addressAPI.create(body);
    return res.data;
});

// UPDATE
export const updateAddressThunk = createAsyncThunk<
    UpdateUserAddressResponse,
    { addressId: number; body: Partial<UserAddress> }
>("address/update", async ({ addressId, body }) => {
    const res = await addressAPI.edit(addressId, body);
    return res.data;
});

// DELETE
export const deleteAddressThunk = createAsyncThunk<
    number,
    number
>("address/delete", async (addressId) => {
    await addressAPI.delete(addressId);
    return addressId;
});

/* ================= SLICE ================= */

const addressSlice = createSlice({
    name: "address",
    initialState,
    reducers: {
        clearAddressDetail(state) {
            state.detail = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // GET ALL
            .addCase(getAllAddressThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAllAddressThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.data;
            })
            .addCase(getAllAddressThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Get address failed";
            })

            // GET DETAIL
            .addCase(getAddressDetailThunk.fulfilled, (state, action) => {
                state.detail = action.payload.data;
            })

            // CREATE
            .addCase(createAddressThunk.fulfilled, (state, action) => {
                state.list.unshift(action.payload.data);
            })

            // UPDATE
            .addCase(updateAddressThunk.fulfilled, (state, action) => {
                const updated = action.payload.data;
                state.list = state.list.map((item) =>
                    item.address_id === updated.address_id ? updated : item
                );
                state.detail = updated;
            })

            // DELETE
            .addCase(deleteAddressThunk.fulfilled, (state, action) => {
                state.list = state.list.filter(
                    (item) => item.address_id !== action.payload
                );
            });
    },
});

export const { clearAddressDetail } = addressSlice.actions;
export default addressSlice.reducer;
