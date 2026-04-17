// src/store/slices/MasterSlice.js
import { createSlice } from "@reduxjs/toolkit";
// import * as API from '@/utils/api.services';

// export const getSubAdminListThunk = createAsyncThunk("subAdminList", async (submitData, { dispatch }) => {
//     try {
//         // dispatch(setLoader(true))
//         const { data: subAdmin } = await API.subAdminList(submitData);
//         // dispatch(setLoader(false))
//         return subAdmin;
//     } catch (error) {
//         throw error;
//     }
// });

const initialState = {
    isLoading: false,
    customModel: {
        isOpen: false,
        modalType: ''
    },
    // subAdminList: {
    //     data: [],
    //     error: null,
    // },
};

const masterSlice = createSlice({
    name: 'masterslice',
    initialState,
    reducers: {
        setLoader: (state, action) => {
            state.isLoading = action.payload;
        },
        setModalStatus: (state, action) => {
            const { modalType, isOpen } = action.payload;
            state.customModel.modalType = modalType;
            state.customModel.isOpen = isOpen;
        },
    },
    // extraReducers: (builder) => {
    //     builder
    //         .addCase(getSubAdminListThunk.fulfilled, (state, action) => {
    //             state.subAdminList.data = action.payload;
    //         })
    //         .addCase(getSubAdminListThunk.rejected, (state, action) => {
    //             state.subAdminList.error = action.error.message;
    //         })
    // },
});

export const { setLoader, setModalStatus } = masterSlice.actions;
export default masterSlice.reducer;