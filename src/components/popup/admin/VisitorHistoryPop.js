import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as CF from "../../../config/function";
import { enum_api_uri } from "../../../config/enum";
import { adminVisitorHistoryPop, confirmPop } from "../../../store/popupSlice";
import ConfirmPop from "../../popup/ConfirmPop";
import TableWrap from "../../component/admin/TableWrap";


const VisitorHistoryPop = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const stat_url = enum_api_uri.stat_url;
    const stat_agent = enum_api_uri.stat_agent;
    const [confirm, setConfirm] = useState(false);
    const [list, setList] = useState([]);


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);


    //팝업닫기
    const closePopHandler = () => {
        dispatch(adminVisitorHistoryPop({adminVisitorHistoryPop:false,adminVisitorHistoryPopType:null}));
    };


    //최다 접속경로 or 최다 브라우저 가져오기
    const getList = () => {
        axios.get(popup.adminVisitorHistoryPopType === 1 ? stat_url : stat_agent,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                const data = res.data.data;
                setList(data);
            }
        })
        .catch((error) => {
            const err_msg = CF.errorMsgHandler(error);
            if(error.response.status === 401){//토큰에러시 관리자단 로그인페이지로 이동
                navigate("/console/login");

                closePopHandler();
            }else{
                dispatch(confirmPop({
                    confirmPop:true,
                    confirmPopTit:'알림',
                    confirmPopTxt: err_msg,
                    confirmPopBtn:1,
                }));
                setConfirm(true);
            }
        });
    };


    useEffect(()=>{
        getList();
    },[]);



    return(<>
        <div className="pop_display pop_charts">
            <div className="dimm"></div>
            <div className="popup_wrap">
                <div className="popup">
                    <div className="pop_tit">
                        <h3>최다 접속 경로</h3>
                    </div>
                    <div className="pop_con">
                        <div className="con_box">
                            <p className="txt">* 최대 20개까지 확인할 수 있습니다.</p>
                            <div className="scroll_wrap">
                                <TableWrap 
                                    className="tbl_wrap1"
                                    colgroup={["80px","auto","25%"]}
                                    thList={["순위",popup.adminVisitorHistoryPopType === 1 ? "경로" : "브라우저","횟수"]}
                                    tdList={list}
                                    type={"visitor_history"}
                                />
                            </div>                    
                        </div>
                        <div className="pop_btn_wrap">
                            <div className="btn_box">
                                <button type="button" className="btn_type4" onClick={closePopHandler}>확인</button>
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

export default VisitorHistoryPop;