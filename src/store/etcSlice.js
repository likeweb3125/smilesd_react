import { createSlice } from "@reduxjs/toolkit";

const etc = createSlice({
    name: "etc", //state 이름
    initialState: {
        pageNo: 1,
        pageNoChange: false,
        checkedList: [],
        closePopIdx: null,
        termsCheckList: [],  //회원가입시 이용약관 체크박스리스트
        menuCheckList: [],
        unMenuCheckList: [],
        cateMenuList: [],        //관리자단-메뉴관리-카테고리관리 1차카테고리 메뉴리스트
        activeMenuId: null,
        inquiryDetailIdx: null,
        commentPassCheck: false,    //비회원 댓글 수정 시 비밀번호체크
        commentPassCheckIdx: null,
        commentPassCheckTxt: '',
        commentDeltPassCheck: false,    //비회원 댓글 삭제 시 비밀번호체크
    },
    reducers:{
        pageNo: (state, action) => {
            state.pageNo = action.payload;
        },
        pageNoChange: (state, action) => {
            state.pageNoChange = action.payload;
        },
        checkedList: (state, action) => {
            state.checkedList = action.payload;
        },
        closePopIdx: (state, action) => {
            state.closePopIdx = action.payload;
        },
        termsCheckList: (state, action) => {
            state.termsCheckList = action.payload;
        },
        menuCheckList: (state, action) => {
            state.menuCheckList = action.payload;
        },
        unMenuCheckList: (state, action) => {
            state.unMenuCheckList = action.payload;
        },
        cateMenuList: (state, action) => {
            state.cateMenuList = action.payload;
        },
        activeMenuId: (state, action) => {
            state.activeMenuId = action.payload;
        },
        inquiryDetailIdx: (state, action) => {
            state.inquiryDetailIdx = action.payload;
        },
        commentPassCheck: (state, action) => {
            state.commentPassCheck = action.payload.commentPassCheck;
            state.commentPassCheckIdx = action.payload.commentPassCheckIdx;
            state.commentPassCheckTxt = action.payload.commentPassCheckTxt;
        },
        commentDeltPassCheck: (state, action) => {
            state.commentDeltPassCheck = action.payload;
        },
    }
});

export const {
    pageNo,
    pageNoChange,
    checkedList, 
    closePopIdx,
    termsCheckList,
    menuCheckList,
    unMenuCheckList,
    cateMenuList,
    activeMenuId,
    inquiryDetailIdx,
    commentPassCheck,
    commentDeltPassCheck,
} = etc.actions;
export default etc;