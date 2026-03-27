/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { conditionSetAPI } from "./conditionSetAPI";
import type {
    ConditionSet,
    ConditionSetWithDetails,
    CreateConditionSetRequest,
    UpdateConditionSetRequest,
} from "./conditionSetType";

/* =========================
   STATE
========================= */
interface ConditionSetState {
    allConditionSets: ConditionSet[];
    selectedConditionSet: ConditionSetWithDetails | null;
    pagination: {
        currentPage: number;
        totalPage: number;
        totalConditionSet: number;
    };
    loading: boolean;
    loadingDetail: boolean;
    error: string | null;
}

const initialState: ConditionSetState = {
    allConditionSets: [],
    selectedConditionSet: null,
    pagination: {
        currentPage: 1,
        totalPage: 1,
        totalConditionSet: 0,
    },
    loading: false,
    loadingDetail: false,
    error: null,
};

/* =========================
   THUNKS
========================= */

/** GET /condition-set/getAll/ */
export const getAllConditionSetsThunk = createAsyncThunk<
    { data: ConditionSet[]; currentPage: number; totalPage: number; totalConditionSet: number },
    void,
    { rejectValue: string }
>("conditionSet/getAll", async (_, { rejectWithValue }) => {
    try {
        const res = await conditionSetAPI.getAll();
        return {
            data: res.data.data,
            currentPage: res.data.currentPage,
            totalPage: res.data.totalPage,
            totalConditionSet: res.data.totalConditionSet,
        };
    } catch (error: unknown) {
        if (axios.isAxiosError(error))
            return rejectWithValue(error.response?.data?.message ?? "Failed to fetch condition sets");
        return rejectWithValue("Unexpected error");
    }
});

/** GET /condition-set/:id */
export const getConditionSetByIdThunk = createAsyncThunk<
    ConditionSetWithDetails,
    string,
    { rejectValue: string }
>("conditionSet/getById", async (id, { rejectWithValue }) => {
    try {
        const res = await conditionSetAPI.getById(id);
        return res.data.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error))
            return rejectWithValue(error.response?.data?.message ?? "Failed to fetch condition set");
        return rejectWithValue("Unexpected error");
    }
});

/** POST /condition-set/create */
export const createConditionSetThunk = createAsyncThunk<
    ConditionSetWithDetails,
    CreateConditionSetRequest,
    { rejectValue: string }
>("conditionSet/create", async (data, { rejectWithValue }) => {
    try {
        const res = await conditionSetAPI.create(data);
        return res.data.data;
    } catch (error: any) {
        if (axios.isAxiosError(error))
            return rejectWithValue(error.response?.data?.message ?? "Failed to create condition set");
        return rejectWithValue("Unexpected error");
    }
});

/** PUT /condition-set/update/:id */
export const updateConditionSetThunk = createAsyncThunk<
    ConditionSetWithDetails,
    { id: string; data: UpdateConditionSetRequest },
    { rejectValue: string }
>("conditionSet/update", async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await conditionSetAPI.update(id, data);
        return res.data.data;
    } catch (error: any) {
        if (axios.isAxiosError(error))
            return rejectWithValue(error.response?.data?.message ?? "Failed to update condition set");
        return rejectWithValue("Unexpected error");
    }
});

/** DELETE /condition-set/:id */
export const deleteConditionSetThunk = createAsyncThunk<
    string,
    string,
    { rejectValue: string }
>("conditionSet/delete", async (id, { rejectWithValue }) => {
    try {
        await conditionSetAPI.delete(id);
        return id;
    } catch (error: any) {
        if (axios.isAxiosError(error))
            return rejectWithValue(error.response?.data?.message ?? "Failed to delete condition set");
        return rejectWithValue("Unexpected error");
    }
});

/* =========================
   SLICE
========================= */
const conditionSetSlice = createSlice({
    name: "conditionSet",
    initialState,
    reducers: {
        clearSelectedConditionSet(state) {
            state.selectedConditionSet = null;
        },
        clearConditionSetError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ===== GET ALL =====
            .addCase(getAllConditionSetsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllConditionSetsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.allConditionSets = action.payload.data;
                state.pagination = {
                    currentPage: action.payload.currentPage,
                    totalPage: action.payload.totalPage,
                    totalConditionSet: action.payload.totalConditionSet,
                };
            })
            .addCase(getAllConditionSetsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? null;
            })

            // ===== GET BY ID =====
            .addCase(getConditionSetByIdThunk.pending, (state) => {
                state.loadingDetail = true;
                state.error = null;
            })
            .addCase(getConditionSetByIdThunk.fulfilled, (state, action: PayloadAction<ConditionSetWithDetails>) => {
                state.loadingDetail = false;
                state.selectedConditionSet = action.payload;
            })
            .addCase(getConditionSetByIdThunk.rejected, (state, action) => {
                state.loadingDetail = false;
                state.error = action.payload ?? null;
            })

            // ===== CREATE =====
            .addCase(createConditionSetThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createConditionSetThunk.fulfilled, (state, action: PayloadAction<ConditionSetWithDetails>) => {
                state.loading = false;
                const { id, name, is_reusable, created_at, updated_at } = action.payload;
                state.allConditionSets.unshift({ id, name, is_reusable, created_at, updated_at });
                state.pagination.totalConditionSet += 1;
            })
            .addCase(createConditionSetThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? null;
            })

            // ===== UPDATE =====
            .addCase(updateConditionSetThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateConditionSetThunk.fulfilled, (state, action: PayloadAction<ConditionSetWithDetails>) => {
                state.loading = false;
                const idx = state.allConditionSets.findIndex(cs => cs.id === action.payload.id);
                if (idx !== -1) {
                    const { id, name, is_reusable, created_at, updated_at } = action.payload;
                    state.allConditionSets[idx] = { id, name, is_reusable, created_at, updated_at };
                }
                if (state.selectedConditionSet?.id === action.payload.id) {
                    state.selectedConditionSet = action.payload;
                }
            })
            .addCase(updateConditionSetThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? null;
            })

            // ===== DELETE =====
            .addCase(deleteConditionSetThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteConditionSetThunk.fulfilled, (state, action: PayloadAction<string>) => {
                state.loading = false;
                state.allConditionSets = state.allConditionSets.filter(cs => cs.id !== action.payload);
                if (state.selectedConditionSet?.id === action.payload) {
                    state.selectedConditionSet = null;
                }
                state.pagination.totalConditionSet = Math.max(0, state.pagination.totalConditionSet - 1);
            })
            .addCase(deleteConditionSetThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? null;
            });
    },
});

export const { clearSelectedConditionSet, clearConditionSetError } = conditionSetSlice.actions;
export default conditionSetSlice.reducer;