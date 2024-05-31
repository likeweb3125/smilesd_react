import { createSlice } from "@reduxjs/toolkit";

const user = createSlice({
    name: "user", //state 이름
    initialState: {
        loginStatus: false,
        loginUser: {},
        siteId: "", //고정값
        maintName: "", //유지보수업체이름 고정값
    },
    reducers:{
        loginStatus: (state, action) => {
            state.loginStatus = action.payload;
        },
        loginUser: (state, action) => {
            state.loginUser = action.payload;
        },
        siteId: (state, action) => {
            state.siteId = action.payload;
        },
        maintName: (state, action) => {
            state.maintName = action.payload;
        },
    },
});

export const { loginStatus, loginUser, siteId, maintName } = user.actions;
export default user;