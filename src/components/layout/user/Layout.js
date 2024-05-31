import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import axios from "axios";
import { enum_api_uri } from "../../../config/enum";
import { siteInfo, siteInfoEdit, siteLangList } from "../../../store/commonSlice";
import { commentPassCheck } from "../../../store/etcSlice";
import { confirmPop } from "../../../store/popupSlice";
import * as CF from "../../../config/function";
import Header from "./Header";
import Footer from "./Footer";
import ConfirmPop from "../../popup/ConfirmPop";


const Layout = (props) => {
    const location = useLocation();
    const dispatch = useDispatch();
    const popup = useSelector((state)=>state.popup);
    const common = useSelector((state)=>state.common);
    const site_info = enum_api_uri.site_info;
    const site_policy = enum_api_uri.site_policy;
    // const siteId = process.env.REACT_APP_SITE_ID;
    const siteId = 'likeweb';
    const [confirm, setConfirm] = useState(false);
    const [siteInfoData, setSiteInfoData] = useState({});
    const [policyList, setPolicyList] = useState([]);


    //페이지변경시
    useEffect(()=>{
        //게시글상세 - 댓글수정 열려있을수있으니 commentPassCheck값 초기화
        dispatch(commentPassCheck({commentPassCheck:false, commentPassCheckIdx:null, commentPassCheckTxt:''}));
    },[location]);


    //사이트정보 가져오기
    const getSiteInfo = () => {
        axios.get(`${site_info.replace(":site_id",siteId).replace(":c_lang",common.siteLang)}`)
        .then((res)=>{
            if(res.status === 200){
                let data = res.data.data;
                    data.site_id = siteId;
                setSiteInfoData(data);

                //store 에 사이트정보저장
                dispatch(siteInfo(data));

                //store 에 사이트언어리스트 저장
                const langList = data.c_site_lang;
                dispatch(siteLangList(langList));
            }
        })
        .catch((error) => {
            const err_msg = CF.errorMsgHandler(error);
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt: err_msg,
                confirmPopBtn:1,
            }));
            setConfirm(true);
        });
    };


    //사이트 운영정책리스트 가져오기
    const getPolicyList = () => {
        axios.get(`${site_policy}?p_lang=${common.siteLang}`)
        .then((res)=>{
            if(res.status === 200){
                let data = res.data.data;
                let list = data.policy_list;
                list = list.filter(item => item.p_use_yn == 'Y');
                setPolicyList(list);
            }
        })
        .catch((error) => {
            const err_msg = CF.errorMsgHandler(error);
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt: err_msg,
                confirmPopBtn:1,
            }));
            setConfirm(true);
        });
    };


    //언어변경시 사이트정보, 사이트 운영정책리스트 가져오기
    useEffect(()=>{
        getSiteInfo();
        getPolicyList();
    },[common.siteLang]);





    return(<>
        <div className="body_user">
            <div id="wrap">
                <Header />
                <main id="main" className="main sub_page">
                    <section className="user_section">
                        <div className="page_inner">{props.children}</div>
                    </section>
                </main>    
                <Footer 
                    policyList={policyList}
                />
            </div>
        </div>

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default Layout;