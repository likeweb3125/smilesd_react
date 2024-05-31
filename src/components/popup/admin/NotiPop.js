import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import * as CF from "../../../config/function";
import { enum_api_uri } from "../../../config/enum";
import { adminNotiPop, confirmPop } from "../../../store/popupSlice";
import { alarm } from "../../../store/commonSlice";
import ConfirmPop from "../../popup/ConfirmPop";
import { Link, useNavigate } from "react-router-dom";

const NotiPop = (props) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const alarm_list = enum_api_uri.alarm_list;
    const alarm_modify = enum_api_uri.alarm_modify;
    const [confirm, setConfirm] = useState(false);
    const [deltConfirm, setDeltConfirm] = useState(false);
    const [tab, setTab] = useState("all");
    const [total, setTotal] = useState(0);
    const [list, setList] = useState([]);


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
            setDeltConfirm(false);
        }
    },[popup.confirmPop]);

    //팝업닫기
    const closePopHandler = () => {
        dispatch(adminNotiPop(false));
    };


    //알림 가져오기
    const getAlarmList = () => {
        axios.get(`${alarm_list.replace(":follow",tab)}`,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                let data = res.data.data;
                setTotal(data.totalCnt);
                setList(data.list);
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
        getAlarmList();
    },[tab]);


    useEffect(()=>{
        // list 배열 중에 a_read의 첫 번째 값이 "N"인 요소가 하나라도 있는지 확인
        const hasUnread = list.some(item => item.a_read[0] === "N");

        if (hasUnread) {
            // "N"이 하나라도 있는 경우
            dispatch(alarm(true));
        } else {
            // 모두 "N"이 아닌 경우
            dispatch(alarm(false));
        }
    },[list]);


    //알림 전체읽기 처리
    const readHandler = () => {
        const body = {
            follow:"read",
            idx:"",
            flg:""
        };
        axios.put(`${alarm_modify}`, body,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                //현재 list 배열에서 모든 a_read 값을 ["Y", "읽음"]로 변경
                const updatedList = list.map((item) => {
                    return {
                        ...item,
                        a_read: ["Y", "읽음"],
                    };
                });
                setList(updatedList);
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


    //읽은알림 삭제버튼 클릭시
    const deltAllBtnClickHandler = () => {
        dispatch(confirmPop({
            confirmPop:true,
            confirmPopTit:'알림',
            confirmPopTxt:'읽은 알림을 모두 삭제하시겠습니까?',
            confirmPopBtn:2,
        }));
        setDeltConfirm(true);
    };


    //읽은알림 전체삭제하기
    const deltAllHandler = () => {
        const body = {
            follow:"delete",
            idx:"",
            flg:""
        };
        axios.put(`${alarm_modify}`, body,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                getAlarmList();
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


    //알림 삭제하기
    const deltHandler = (idx,flg) => {
        const body = {
            follow:"delete",
            idx:idx,
            flg:flg
        };
        axios.put(`${alarm_modify}`, body,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                getAlarmList();
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



    return(<>
        <div className="pop_noti">
            <h5>알림</h5>
            <div className="pop_inner">
                <ul className="tab_noti">
                    <li className={tab == "all" ? "on" : ""}><button type="button" onClick={()=>setTab("all")}>전체</button></li>
                    <li className={tab == "board" ? "on" : ""}><button type="button" onClick={()=>setTab("board")}>게시글</button></li>
                    <li className={tab == "comment" ? "on" : ""}><button type="button" onClick={()=>setTab("comment")}>댓글</button></li>
                </ul>
                <div className="noti_box">
                    <div className="noti_util">
                        <span>알림이 총 <b>{CF.MakeIntComma(total)}</b>개가 있습니다.</span>     
                        {list.length > 0 &&                                  
                            <ul className="btn_wrap">
                                <li>
                                    <button type="button" onClick={readHandler}>전체 읽기</button>
                                </li>
                                <li>
                                    <button type="button" onClick={deltAllBtnClickHandler}>읽은 알림 삭제</button>
                                </li>
                            </ul>
                        }
                    </div>
                    {list.length > 0 ?
                        <ul className="list_noti">
                            {list.map((cont,i)=>{
                                const date = cont.reg_date.split(' ')[0];
                                return(
                                    <li key={i} className={cont.a_read[0] == "Y" ? "read" : ""}>
                                        <div className="cate">{cont.follow}</div>
                                        <div className="txt_wrap">
                                            <Link to={`/console/board/post/detail/${cont.category}/${cont.idx}`}>
                                                <em className="ellipsis">{`[${cont.c_name}] `}{`‘${cont.title}‘`}{cont.follow == "게시글" ? " 새 글 작성" : " 댓글 작성"}</em>
                                                <strong>
                                                    <b>{cont.m_name}</b>
                                                    <span>{cont.content}</span>
                                                </strong>
                                                <i>{date}</i>
                                            </Link>
                                        </div>
                                        <button type="button" className="btn_noti_remove" onClick={()=>{deltHandler(cont.idx,cont.follow)}}>알림 삭제</button>
                                    </li>
                                );
                            })}
                        </ul>
                        : <div className="none_data">알림이 없습니다.</div>
                    }
                </div>
            </div>
            <button type="button" className="btn_noti_close" onClick={closePopHandler}>알림팝업 닫기</button>
        </div>

        {/* 알림삭제 confirm팝업 */}
        {deltConfirm && <ConfirmPop onClickHandler={deltAllHandler} />}

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default NotiPop;