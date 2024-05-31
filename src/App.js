import { useEffect, useState } from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from "axios";
import * as CF from "./config/function";
import { enum_api_uri } from './config/enum';
import { confirmPop } from './store/popupSlice';
import { siteInfo, siteInfoEdit, siteLangList, siteLang } from './store/commonSlice';
import MetaTag from './components/component/MetaTag';
import ConfirmPop from './components/popup/ConfirmPop';
import Layout from './components/layout/user/Layout';
import Main from "./pages/user/Main";
import OpenPopup from './pages/user/OpenPopup';
import Login from './pages/user/Login';
import SignUp from './pages/user/SignUp';
import ResetPasswordEmail from './pages/user/ResetPasswordEmail';
import ResetPassword from './pages/user/ResetPassword';
import SubWrap from './components/component/user/SubWrap';
import Html from './pages/user/Html';
import Custom from './pages/user/Custom';
import CustomTest from './pages/user/CustomTest';
import Board from './pages/user/Board';
import BoardDetail from './pages/user/BoardDetail';
import BoardWrite from './pages/user/BoardWrite';
import Faq from './pages/user/Faq';
import Inquiry from './pages/user/Inquiry';
import InquiryWrite from './pages/user/InquiryWrite';
import MyPage from './pages/user/MyPage';
import MyProfile from './components/component/user/MyProfile';
import MyInquiry from './components/component/user/MyInquiry';
import Policy from './pages/user/Policy';


import AdminLogin from './pages/admin/Login';
import AdminLayout from './components/layout/admin/Layout';
import AdminEvent from './pages/admin/event/Event';

import AdminMain from './pages/admin/Main';
import AdminMenuCategory from './pages/admin/MenuCategory';
import AdminBoard from "./pages/admin/Board";
import AdminBoardDetail from "./pages/admin/BoardDetail";
import AdminBoardWrite from "./pages/admin/BoardWrite";
import AdminCommentAll from "./pages/admin/CommentAll";
import AdminMemberUser from './pages/admin/MemberUser';
import AdminMemberManager from './pages/admin/MemberManager';
import AdminMemberCancel from './pages/admin/MemberCancel';
import AdminDesignBanner from "./pages/admin/DesignBanner";
import AdminDesignPopup from "./pages/admin/DesignPopup";
import AdminSettingSiteInfo from "./pages/admin/SettingSiteInfo";
import AdminSettingPolicy from "./pages/admin/SettingPolicy";
import AdminSettingLevel from './pages/admin/SettingLevel';
import AdminStatsChart from './pages/admin/StatsChart';
import AdminStatsVisitor from './pages/admin/StatsVisitor';
import AdminMaint from "./pages/admin/Maint";
import AdminMaintDetail from "./pages/admin/MaintDetail";
import AdminMaintWrite from "./pages/admin/MaintWrite";
import Popup from './components/popup/Popup';
import './css/default.css';

import Test from './pages/admin/Test';





function App() {
    const dispatch = useDispatch();
    const popup = useSelector((state)=>state.popup);
    const etc = useSelector((state)=>state.etc);
    const common = useSelector((state)=>state.common);
    const location = useLocation();
    const [confirm, setConfirm] = useState(false);
    const site_info = enum_api_uri.site_info;
    // const siteId = process.env.REACT_APP_SITE_ID;
    const siteId = 'likeweb';
    const [siteInfoData, setSiteInfoData] = useState({});
    


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);

    
    //페이지이동시 스크롤탑으로 이동 (상세->목록으로 뒤로가기시 제외)
    useEffect(()=>{
        if(!common.detailPageBack){
            window.scrollTo(0,0);
        }
    },[location]);
    


    return(<>
        {/* <MetaTag info={siteInfoData}/> */}
        <div>
            <Routes>
            {/* 관리자단---------------------------------------------- */}
                {/* 로그인 */}
                <Route path="/console/login" element={<AdminLogin />} />


                {/* 이벤트 - 이벤트 */}
                <Route path="/console/event/event/event1" element={<AdminLayout><AdminEvent/></AdminLayout>} />
            {/* //관리자단---------------------------------------------- */}

            </Routes>

            {/* 팝업 */}
            <Popup />
        </div>

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
}

export default App;
