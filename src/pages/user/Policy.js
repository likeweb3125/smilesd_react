import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import * as CF from "../../config/function";
import { enum_api_uri } from "../../config/enum";
import { confirmPop } from "../../store/popupSlice";
import ConfirmPop from "../../components/popup/ConfirmPop";


const Policy = () => {
    const dispatch = useDispatch();
    const popup = useSelector((state)=>state.popup);
    const common = useSelector((state)=>state.common);
    const policy_detail = enum_api_uri.policy_detail;
    const { policy_idx } = useParams();
    const [confirm, setConfirm] = useState(false);
    const [info, setInfo] = useState({});


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);


    //상세정보 가져오기
    const getPolicyData = () => {
        axios.get(`${policy_detail.replace(":idx",policy_idx)}?p_lang=${common.siteLang}`)
        .then((res)=>{
            if(res.status === 200){
                let data = res.data.data;
                setInfo(data);
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


    useEffect(()=>{
        if(policy_idx){
            getPolicyData();
        }
    },[policy_idx]);


    return(<>
        <div className="sub_visual sub_visual_terms">
            <div className="section_inner">
                <div className="location_wrap">
                    <ul className="location">
                        <li>
                            <Link to="/" className="btn_home">홈</Link>
                        </li>
                        <li>운영정책</li>
                        <li>{info.p_title}</li>
                    </ul>
                </div>
                <h2>
                    <strong>{info.p_title}</strong>
                </h2>
            </div>
        </div>
        <div className="page_user_terms">
            <div className="section_inner">
                <div className="txt" dangerouslySetInnerHTML={{__html:info.p_contents}}></div>
            </div>
        </div>

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default Policy;