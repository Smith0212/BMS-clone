// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import MasterSlice from "./slices/MasterSlice";

const store = configureStore({
    reducer: {
        masterSlice: MasterSlice
    },
});

export default store;