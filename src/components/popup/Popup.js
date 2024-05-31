import { useSelector } from "react-redux";
import { createPortal } from "react-dom";

import TermsPop from "./user/TermsPop";
import PasswordCheckPop from "./user/PasswordCheckPop";
import CommentPassCheckPop from "./user/CommentPassCheckPop";
import ChangePasswordPop from "./user/ChangePasswordPop";

import AdminPoilicyPop from "./admin/PolicyPop";
import AdminCategoryPop from "./admin/CategoryPop";
import AdminSubCategoryPop from "./admin/SubCategoryPop";
import AdminBoardGroupPop from "./admin/BoardGroupPop";
import AdminBannerPop from "./admin/BannerPop";
import AdminPopupPop from "./admin/PopupPop";
import AdminMemberInfoPop from "./admin/MemberInfoPop";
import AdminMsgPop from "./admin/MsgPop";
import AdminVisitorHistoryPop from "./admin/VisitorHistoryPop";




const Popup = () => {
    const popup = useSelector((state)=>state.popup);

    return createPortal(
        <>
            {/* 사용자 --------------------------------------*/}
            {/* 회원가입 - 이용약관 팝업 */}
            {popup.termsPop && <TermsPop />}

            {/* 비밀글 비밀번호확인 팝업 */}
            {popup.passwordCheckPop && <PasswordCheckPop />}

            {/* 비회원댓글 비밀번호확인 팝업 */}
            {popup.commentPassCheckPop && <CommentPassCheckPop />}

            {/* 마이페이지 - 비밀번호변경 팝업 */}
            {popup.changePasswordPop && <ChangePasswordPop />}


            {/* 관리자 --------------------------------------*/}
            {/* 운영정책 상세 팝업 */}
            {popup.adminPolicyPop && <AdminPoilicyPop />}

            {/* 1차카테고리 팝업 */}
            {popup.adminCategoryPop && <AdminCategoryPop />}

            {/* 하위카테고리 팝업 */}
            {popup.adminSubCategoryPop && <AdminSubCategoryPop />}

            {/* 게시판분류 팝업 */}
            {popup.adminBoardGroupPop && <AdminBoardGroupPop />}

            {/* 메인배너관리 팝업 */}
            {popup.adminBannerPop && <AdminBannerPop />}

            {/* 팝업관리 팝업 */}
            {popup.adminPopupPop && <AdminPopupPop />}

            {/* 회원관리 - 사용자정보 팝업 */}
            {popup.adminMemberInfoPop && <AdminMemberInfoPop />}
            {/* 회원관리 - 단체메시지전송 팝업 */}
            {popup.adminMsgPop && <AdminMsgPop />}

            {/* 통계관리 - 최다접속경로, 최다브라우저 팝업 */}
            {popup.adminVisitorHistoryPop && <AdminVisitorHistoryPop />}

        </>,
        document.getElementById('modal-root')
    );
};

export default Popup;