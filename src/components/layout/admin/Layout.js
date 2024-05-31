import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { adminNotiPop, confirmPop } from "../../../store/popupSlice";
import { alarm, userLevelList, siteLangList, siteInfo } from "../../../store/commonSlice";
import { loginStatus, loginUser, siteId, maintName } from "../../../store/userSlice";
import { checkedList, activeMenuId } from "../../../store/etcSlice";
import { enum_api_uri } from "../../../config/enum";
import * as CF from "../../../config/function";
import Header from "./Header";
import Footer from "./Footer";
import NotiPop from "../../popup/admin/NotiPop";
import ConfirmPop from "../../popup/ConfirmPop";
import { Link } from "react-router-dom";


const Layout = (props) => {
    const dispatch = useDispatch();
    const popup = useSelector((state)=>state.popup);
    const common = useSelector((state)=>state.common);
    const user = useSelector((state)=>state.user);
    const [confirm, setConfirm] = useState(false);
    const [locationList, setLocationList] = useState([]);
    const location = useLocation();
    const { board_category } = useParams();
    const site_info = enum_api_uri.site_info;
    const alarm_list = enum_api_uri.alarm_list;
    const level_list = enum_api_uri.level_list;
    const navigate = useNavigate();


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);


    //현재페이지에 따라 page_inner 변경
    useEffect(()=>{
        const path = location.pathname;

        //페이지 변경시 store 에 저장된 checkedList 값 삭제
        dispatch(checkedList([]));

        //페이지 변경시 store 에 저장된 activeMenuId 값 삭제
        dispatch(activeMenuId(null));


        //주문관리 - 주문관리
        if(path === "/console/order/order/files"){
            setLocationList(["주문 관리","주문 관리","파일첨부"]);
        }

    },[location, common.boardMenu]);


    //로그아웃하기
    const logoutHandler = () => {
        //로그인 페이지이동
        navigate('/console/login');
    };


    return(<>
        <div className="body_admin">
            <div id="wrap">
                <Header />
                <main id="main" className="main">
                    {/* 상단 */}
                    <div className="admin_location">
                        <div className="location_wrap">
                            <ul className="location">
                                {locationList.map((cont,i)=>{
                                    if (i === 0) {
                                        return <li key={i}><h2>{cont}</h2></li>
                                    } else {
                                        return <li key={i}>{cont}</li>
                                    }
                                })}
                            </ul>
                            <div className="header_util">
                                <div className="log_util">
                                    <button type="button" className="btn_logout" onClick={logoutHandler}>로그아웃</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* //상단 */}
                    <section className="admin_section">
                        <div className="page_inner">
                            {props.children}
                        </div>
                    </section>
                </main>
                {/* <Footer/> */}
            </div>
        </div>

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default Layout;