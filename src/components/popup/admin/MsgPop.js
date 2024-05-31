import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as CF from "../../../config/function";
import { enum_api_uri } from "../../../config/enum";
import { confirmPop, adminMsgPop } from "../../../store/popupSlice";
import ConfirmPop from "../ConfirmPop";
import InputBox from "../../component/InputBox";
import TxtSelectBox from "../../component/admin/TxtSelectBox";
import SmsTxtBox from "../../component/admin/SmsTxtBox";
import TextareaBox from "../../component/TextareaBox";


const MsgPop = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const member_info = enum_api_uri.member_info;
    const member_modify = enum_api_uri.member_modify;

    const sms_txt = enum_api_uri.sms_txt;
    const [confirm, setConfirm] = useState(false);
    const [closeConfirm, setCloseConfirm] = useState(false);
    const [saveOkConfirm, setSaveOkConfirm] = useState(false);
    const [info, setInfo] = useState({});
    const [error, setError] = useState({});

    const [presetOn, setPresetOn] = useState(false);
    const [smsList, setSmsList] = useState([]);
    const [smsTxtList, setSmsTxtList] = useState([]);

    const [txtValue, setTxtValue] = useState('');


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
            setCloseConfirm(false);
            setSaveOkConfirm(false);
        }
    },[popup.confirmPop]);


    //닫기, 취소버튼 클릭시
    const closeBtnClickHandler = () => {
        dispatch(confirmPop({
            confirmPop:true,
            confirmPopTit:'알림',
            confirmPopTxt: '작성중인 내용을 종료하시겠습니까?',
            confirmPopBtn:2,
        }));
        setCloseConfirm(true);
    };

    //팝업닫기
    const closePopHandler = () => {
        dispatch(adminMsgPop(false));
    };



    //상세정보 가져오기
    const getInfoData = () => {
        axios.get(`${member_info.replace(":idx",popup.adminMemberInfoPopIdx)}`,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                let data = res.data.data;
                    data.m_sms_yn = data.m_sms_yn[0];
                    data.m_mail_yn = data.m_mail_yn[0];
                setInfo(data);
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


    //맨처음 회원등급리스트, 사용자정보 가져오기
    useEffect(()=>{
        // getInfoData();
    },[]);


    //문자 프리셋 리스트 가져오기
    const getSmsTxt = () => {
        axios.get(sms_txt,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                const data = res.data.data;
                setSmsList([...data]);
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


    //문자 프리셋 리스트 값 변경시 send_txt 값만 smsTxtList배열값으로 넣기
    useEffect(()=>{
        const list = smsList.map((item) => item.send_txt);
        setSmsTxtList([...list]);
    },[smsList]);


    //문자 프리셋 열었을때 문자프리셋 리스트 가져오기
    useEffect(()=>{
        if(presetOn){
            getSmsTxt();
        }
    },[presetOn]);


    //문자프리셋 textarea 값 변경시
    const onSmsTxtChangeHandler = (e, idx) => {
        const val = e.currentTarget.value;

        let newSmsTxtList = [...smsTxtList];
            newSmsTxtList[idx] = val;
        setSmsTxtList(newSmsTxtList);
    };


    //문자프리셋 저장하기
    const onSmsTxtSaveHandler = (idx) => {
        if(smsTxtList[idx] && smsTxtList[idx].length > 0){
            const body = {
                idx: idx+1,
                send_txt: smsTxtList[idx]
            };

            axios.put(sms_txt, body,
                {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
            )
            .then((res)=>{
                if(res.status === 200){
                    dispatch(confirmPop({
                        confirmPop:true,
                        confirmPopTit:'알림',
                        confirmPopTxt:'저장되었습니다.',
                        confirmPopBtn:1,
                    }));
                    setConfirm(true);

                    getSmsTxt();
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
        }else{
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'내용을 입력해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }
    };


    //문자프리셋 적용하기
    const onSmsTxtApplyHandler = (idx) => {
        if(smsList[idx].send_txt && (smsList[idx].send_txt == smsTxtList[idx])){
            const txt = smsList[idx].send_txt;
            setTxtValue(txt);
        }else{
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'문자 프리셋 저장 후 적용이 가능합니다.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }
    };


    //인풋값 변경시
    const onInputChangeHandler = (e) => {
        const id = e.currentTarget.id;
        const val = e.currentTarget.value;

        let newInfo = {...info};
            newInfo[id] = val;
            
        setInfo(newInfo);

        let newError = {...error};
        if(id == "m_name" && val.length > 0){
            newError.m_name = false;
        }
        if(id == "m_mobile" && val.length > 0){
            newError.m_mobile = false;
        }
        setError(newError);
    };


    //저장버튼 클릭시
    const saveBtnClickHandler = () => {
        let newError = { ...error };

        if (!info.m_name) {
            newError.m_name = true;
        }
        if (!info.m_mobile) {
            newError.m_mobile = true;
        }

        setError(newError);

        if (!newError.m_name && !newError.m_mobile) {
            saveHandler();
        }
    };


    //저장하기
    const saveHandler = () => {
        const body = {
            m_email:info.m_email,
            m_name:info.m_name,
            m_mobile:info.m_mobile,
            m_level:info.m_level,
            m_sms_yn:info.m_sms_yn,
            m_mail_yn:info.m_mail_yn,
            m_memo:info.m_memo,
            m_menu_auth:null,
        };
        axios.put(`${member_modify}`, body, 
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                dispatch(confirmPop({
                    confirmPop:true,
                    confirmPopTit:'알림',
                    confirmPopTxt:'저장되었습니다.',
                    confirmPopBtn:1,
                }));
                setSaveOkConfirm(true);
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

    
    //저장완료
    const saveOkHandler = () => {
        closePopHandler();
    };


    return(<>
        <div className={`pop_display pop_group_msg${presetOn ? ' on_preset' : ''}`}>
            <div className="dimm"></div>
            <div className="popup_wrap">
                <div className="preset_wrap">
                    <h4>문자 프리셋</h4>
                    <ul className="list_preset">
                        {smsList.map((cont, i)=>{
                            let count = 0;
                            if(smsTxtList[i] && smsTxtList[i] !== null){
                                count = smsTxtList[i].length;
                            }
                            return(
                                <li key={i}>
                                    <SmsTxtBox 
                                        cols={30}
                                        rows={5}
                                        placeholder="내용을 입력해주세요."
                                        countShow={true}
                                        countMax={1000}
                                        count={count}
                                        value={smsTxtList[i] || ''}
                                        onChangeHandler={(e)=>onSmsTxtChangeHandler(e, i)}
                                        onSaveHandler={()=>onSmsTxtSaveHandler(i)}
                                        onApplyHandler={()=>onSmsTxtApplyHandler(i)}
                                    />
                                </li>
                            );
                        })}
                    </ul>
                    <button type="button" className="btn_preset_close" onClick={()=>setPresetOn(false)}>문자 프리셋 닫기</button>
                </div>
                <div className="popup">
                    <div className="pop_tit">
                        <h3>단체 메시지 전송</h3>
                    </div>
                    <div className="pop_con">
                        <div className="con_box">
                            <h4>
                                메시지 전송 해당 회원
                                <b>총 30,235명</b>
                            </h4>
                            <div className="btn_util">
                                <button type="button" className="btn_type16">추가</button>
                                <button type="button" className="btn_type12">삭제</button>
                            </div>
                            <div className="tbl_wrap1">
                                <table>
                                    <caption>단체메시지 회원 목록 테이블</caption>
                                    {/* <colgroup>
                                        <col style="width: auto;">
                                        <col style="width: 14%;">
                                        <col style="width: 14%;">
                                        <col style="width: 14%;">
                                        <col style="width: 24%;">
                                    </colgroup> */}
                                    <thead>
                                        <tr>
                                            <th>이메일</th>
                                            <th>회원명</th>
                                            <th>회원등급</th>
                                            <th>가입일자</th>
                                            <th>휴대폰번호</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <span className="txt_ellipsis">zzzzzzz92164156zzzz...</span>
                                            </td>
                                            <td>관리자</td>
                                            <td>관리자</td>
                                            <td>
                                                <span className="txt_light">2018.10.10 10:20</span>
                                            </td>
                                            <td>010-0000-0000</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <span className="txt_ellipsis">zzzzzzz92164156zzzz...</span>
                                            </td>
                                            <td>관리자</td>
                                            <td>관리자</td>
                                            <td>
                                                <span className="txt_light">2018.10.10 10:20</span>
                                            </td>
                                            <td>010-0000-0000</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <span className="txt_ellipsis">zzzzzzz92164156zzzz...</span>
                                            </td>
                                            <td>관리자</td>
                                            <td>관리자</td>
                                            <td>
                                                <span className="txt_light">2018.10.10 10:20</span>
                                            </td>
                                            <td>010-0000-0000</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <span className="txt_ellipsis">zzzzzzz92164156zzzz...</span>
                                            </td>
                                            <td>관리자</td>
                                            <td>관리자</td>
                                            <td>
                                                <span className="txt_light">2018.10.10 10:20</span>
                                            </td>
                                            <td>010-0000-0000</td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <span className="txt_ellipsis">zzzzzzz92164156zzzz...</span>
                                            </td>
                                            <td>관리자</td>
                                            <td>관리자</td>
                                            <td>
                                                <span className="txt_light">2018.10.10 10:20</span>
                                            </td>
                                            <td>010-0000-0000</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="preset_con">
                            <h4>문자 입력</h4>
                            <button type="button" className="btn_type16 btn_preset_open" onClick={()=>setPresetOn(!presetOn)}>문자 프리셋</button>
                            <TextareaBox 
                                cols={30}
                                rows={9}
                                placeholder="내용을 입력해주세요."
                                countShow={true}
                                countMax={1000}
                                count={txtValue.length}
                                value={txtValue}
                                onChangeHandler={(e)=>{
                                    const val = e.currentTarget.value;
                                    setTxtValue(val);
                                }}
                            />
                            <p className="txt">* 문장이 90Byte 이하면 단문, 90Byte 이상, 2000Byte 이하이면 장문으로 발송 됩니다.</p>
                        </div>
                        <div className="pop_btn_wrap">
                            <button type="button" className="btn_left" onClick={()=>setTxtValue('')}>입력한 내용 초기화</button>
                            <div className="btn_box">
                                <button type="button" className="btn_type3" onClick={closeBtnClickHandler}>취소</button>
                                <button type="button" className="btn_type4">문자발송</button>
                            </div>
                        </div>
                    </div>
                    <button type="button" className="btn_pop_close" onClick={closeBtnClickHandler}>팝업닫기</button>
                </div>
            </div>
        </div>

        {/* 닫기,취소 confirm팝업 */}
        {closeConfirm && <ConfirmPop onClickHandler={closePopHandler} />}

        {/* 저장완료 confirm팝업 */}
        {saveOkConfirm && <ConfirmPop closePop="custom" onCloseHandler={saveOkHandler} />}

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default MsgPop;