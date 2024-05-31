import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import * as CF from "../../../config/function";
import { enum_api_uri } from "../../../config/enum";
import { confirmPop, termsPop } from "../../../store/popupSlice";
import { termsCheckList } from "../../../store/etcSlice";
import ConfirmPop from "../../popup/ConfirmPop";


const TermsPop = () => {
    const dispatch = useDispatch();
    const popup = useSelector((state)=>state.popup);
    const etc = useSelector((state)=>state.etc);
    const policy_detail = enum_api_uri.policy_detail;
    const [confirm, setConfirm] = useState(false);
    const [info, setInfo] = useState({});


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);


    //팝업닫기
    const closePopHandler = () => {
        dispatch(termsPop({termsPop:false,termsPopIdx:null}));
    };


    //약관 상세정보 가져오기
    const getPolicyData = () => {
        axios.get(`${policy_detail.replace(":idx",popup.termsPopIdx)}`)
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


    //맨처음 약관 상세정보 가져오기
    useEffect(()=>{
        getPolicyData();
    },[]);


    //동의하기
    const onAgreeHandler = () => {
        let newCheckList = [...etc.termsCheckList];
        if(!newCheckList.includes(popup.termsPopIdx)){
            newCheckList = newCheckList.concat(popup.termsPopIdx);
            dispatch(termsCheckList(newCheckList));
        }
        closePopHandler();
    };



    return(<>
        <div className="pop_display pop_terms">
            <div className="dimm"></div>
            <div className="popup_wrap">
                <div className="popup">
                    <div className="pop_tit">
                        <h3>{info.p_title}{info.constraint_type == 'Y' ? ' (필수)' : ' (선택)'}</h3>
                    </div>
                    <div className="pop_con">
                        <div className="con_box">
                            <div className="terms">
                                <div dangerouslySetInnerHTML={{__html:info.p_contents}}></div>
                            </div>
                        </div>
                        <div className="pop_btn_wrap">
                            <div className="btn_box w_100">
                                <button type="button" className="btn_type3" onClick={closePopHandler}>취소</button>
                                <button type="button" className="btn_type4" onClick={onAgreeHandler}>동의</button>
                            </div>
                        </div>
                    </div>
                    <button type="button" className="btn_pop_close" onClick={closePopHandler}>팝업닫기</button>
                </div>
            </div>
        </div>

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default TermsPop;