import { createSlice } from "@reduxjs/toolkit";

const popup = createSlice({
    name: "popup", //state 이름
    initialState: {
        //안내,알림 팝업
        confirmPop: false,
        confirmPopTit: "",
        confirmPopTxt: "",
        confirmPopBtn: "",

        // 사용자-------------------------------
        //회원가입 이용약관 팝업
        termsPop: false,
        termsPopIdx: null,

        //비밀글 비밀번호확인 팝업
        passwordCheckPop: false,
        passwordCheckPopCate: null,
        passwordCheckPopIdx: null,
        passwordCheckPopMoveUrl: null,

        //비회원댓글 비밀번호확인 팝업
        commentPassCheckPop: false,
        commentPassCheckPopIdx: null,
        commentPassCheckPopTxt: '',
        commentPassCheckPopDelt: false,

        //마이페이지-비밀번호변경 팝업
        changePasswordPop: false,


        // 관리자-------------------------------
        //알림 팝업
        adminNotiPop: false,

        //운영정책 상세 팝업
        adminPolicyPop: false,
        adminPolicyPopIdx: null,
        adminPolicyPopLang: '',
        adminPolicyPopModify: false,
        adminPolicyPopWrite: false,

        //1차카테고리 설정팝업
        adminCategoryPop: false,
        adminCategoryPopIdx: null,
        adminCategoryPopLang: '',
        adminCategoryPopModify: false,
        adminCategoryPopDelt: false,

        //하위카테고리 설정팝업
        adminSubCategoryPop: false,
        adminSubCategoryPopIdx: null,
        adminSubCategoryPopLang: '',
        adminSubCategoryPopData: {},
        adminSubCategoryPopModify: false,
        adminSubCategoryPopParentData: {},

        //게시판분류 팝업
        adminBoardGroupPop: false,
        adminBoardGroupPopId: null,
        adminBoardGroupPopMenuOn: null,

        //메인배너관리 상세 팝업
        adminBannerPop: false,
        adminBannerPopIdx: null,
        adminBannerPopType: null,
        adminBannerPopModify: false,
        adminBannerPopWrite: false,

        //팝업관리 상세 팝업
        adminPopupPop: false,
        adminPopupPopIdx: null,
        adminPopupPopType: null,
        adminPopupPopLang: '',
        adminPopupPopModify: false,
        adminPopupPopWrite: false,

        //회원관리 - 사용자정보 팝업
        adminMemberInfoPop: false,
        adminMemberInfoPopIdx: null,
        adminMemberInfoPopModify: false,
        //회원관리 - 단체메시지전송 팝업
        adminMsgPop: false,

        //통계관리 최다접속경로, 최다브라우저 팝업
        adminVisitorHistoryPop: false,
        adminVisitorHistoryPopType: null,

    },
    reducers:{
        // 공통 -----------------------------------
        confirmPop: (state, action) => {
            state.confirmPop = action.payload.confirmPop;
            state.confirmPopTit = action.payload.confirmPopTit;
            state.confirmPopTxt = action.payload.confirmPopTxt;
            state.confirmPopBtn = action.payload.confirmPopBtn;
        },

        // 사용자-------------------------------
        termsPop: (state, action) => {
            state.termsPop = action.payload.termsPop;
            state.termsPopIdx = action.payload.termsPopIdx;
        },
        passwordCheckPop: (state, action) => {
            state.passwordCheckPop = action.payload.passwordCheckPop;
            state.passwordCheckPopCate = action.payload.passwordCheckPopCate;
            state.passwordCheckPopIdx = action.payload.passwordCheckPopIdx;
            state.passwordCheckPopMoveUrl = action.payload.passwordCheckPopMoveUrl;
        },
        commentPassCheckPop: (state, action) => {
            state.commentPassCheckPop = action.payload.commentPassCheckPop;
            state.commentPassCheckPopIdx = action.payload.commentPassCheckPopIdx;
            state.commentPassCheckPopTxt = action.payload.commentPassCheckPopTxt;
            state.commentPassCheckPopDelt = action.payload.commentPassCheckPopDelt;
        },
        changePasswordPop: (state, action) => {
            state.changePasswordPop = action.payload;
        },

        // 관리자-------------------------------
        adminNotiPop: (state, action) => {
            state.adminNotiPop = action.payload;
        },
        adminPolicyPop: (state, action) => {
            state.adminPolicyPop = action.payload.adminPolicyPop;
            state.adminPolicyPopIdx = action.payload.adminPolicyPopIdx;
            state.adminPolicyPopLang = action.payload.adminPolicyPopLang;
        },
        adminPolicyPopModify: (state, action) => {
            state.adminPolicyPopModify = action.payload;
        },
        adminPolicyPopWrite: (state, action) => {
            state.adminPolicyPopWrite = action.payload;
        },

        adminCategoryPop: (state, action) => {
            state.adminCategoryPop = action.payload.adminCategoryPop;
            state.adminCategoryPopIdx = action.payload.adminCategoryPopIdx;
            state.adminCategoryPopLang = action.payload.adminCategoryPopLang;
        },
        adminCategoryPopModify: (state, action) => {
            state.adminCategoryPopModify = action.payload;
        },
        adminCategoryPopDelt: (state, action) => {
            state.adminCategoryPopDelt = action.payload;
        },
        adminSubCategoryPop: (state, action) => {
            state.adminSubCategoryPop = action.payload.adminSubCategoryPop;
            state.adminSubCategoryPopIdx = action.payload.adminSubCategoryPopIdx;
            state.adminSubCategoryPopLang = action.payload.adminSubCategoryPopLang;
        },
        adminSubCategoryPopData: (state, action) => {
            state.adminSubCategoryPopData = action.payload;
        },
        adminSubCategoryPopModify: (state, action) => {
            state.adminSubCategoryPopModify = action.payload;
        },
        adminSubCategoryPopParentData: (state, action) => {
            state.adminSubCategoryPopParentData = action.payload;
        },

        adminBoardGroupPop: (state, action) => {
            state.adminBoardGroupPop = action.payload.adminBoardGroupPop;
            state.adminBoardGroupPopId = action.payload.adminBoardGroupPopId;
        },
        adminBoardGroupPopMenuOn: (state, action) => {
            state.adminBoardGroupPopMenuOn = action.payload;
        },
        adminBannerPop: (state, action) => {
            state.adminBannerPop = action.payload.adminBannerPop;
            state.adminBannerPopIdx = action.payload.adminBannerPopIdx;
            state.adminBannerPopType = action.payload.adminBannerPopType;
        },
        adminBannerPopModify: (state, action) => {
            state.adminBannerPopModify = action.payload;
        },
        adminBannerPopWrite: (state, action) => {
            state.adminBannerPopWrite = action.payload;
        },
        adminPopupPop: (state, action) => {
            state.adminPopupPop = action.payload.adminPopupPop;
            state.adminPopupPopIdx = action.payload.adminPopupPopIdx;
            state.adminPopupPopType = action.payload.adminPopupPopType;
            state.adminPopupPopLang = action.payload.adminPopupPopLang;
        },
        adminPopupPopModify: (state, action) => {
            state.adminPopupPopModify = action.payload;
        },
        adminPopupPopWrite: (state, action) => {
            state.adminPopupPopWrite = action.payload;
        },
        adminMemberInfoPop: (state, action) => {
            state.adminMemberInfoPop = action.payload.adminMemberInfoPop;
            state.adminMemberInfoPopIdx = action.payload.adminMemberInfoPopIdx;
        },
        adminMemberInfoPopModify: (state, action) => {
            state.adminMemberInfoPopModify = action.payload;
        },
        adminMsgPop: (state, action) => {
            state.adminMsgPop = action.payload;
        },
        adminVisitorHistoryPop: (state, action) => {
            state.adminVisitorHistoryPop = action.payload.adminVisitorHistoryPop;
            state.adminVisitorHistoryPopType = action.payload.adminVisitorHistoryPopType;
        },
    }
});

export const {
    confirmPop, 

    termsPop,
    passwordCheckPop,
    commentPassCheckPop,
    changePasswordPop,

    adminNotiPop,
    adminPolicyPop,
    adminPolicyPopModify,
    adminPolicyPopWrite,

    adminCategoryPop,
    adminCategoryPopModify,
    adminCategoryPopDelt,

    adminSubCategoryPop,
    adminSubCategoryPopData,
    adminSubCategoryPopModify,
    adminSubCategoryPopParentData,
    adminBoardGroupPop,
    adminBoardGroupPopMenuOn,
    adminBannerPop,
    adminBannerPopModify,
    adminBannerPopWrite,
    adminPopupPop,
    adminPopupPopModify,
    adminPopupPopWrite,
    adminMemberInfoPop,
    adminMemberInfoPopModify,
    adminMsgPop,
    adminVisitorHistoryPop
} = popup.actions;
export default popup;