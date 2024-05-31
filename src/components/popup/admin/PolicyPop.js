import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as CF from "../../../config/function";
import { enum_api_uri } from "../../../config/enum";
import { adminPolicyPop, confirmPop, adminPolicyPopModify, adminPolicyPopWrite } from "../../../store/popupSlice";
import ConfirmPop from "../../popup/ConfirmPop";
import InputBox from "../../component/InputBox";
import Editor from "../../component/Editor";


const PolicyPop = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const policy_detail = enum_api_uri.policy_detail;
    const policy_modify = enum_api_uri.policy_modify;
    const site_policy = enum_api_uri.site_policy;
    const [confirm, setConfirm] = useState(false);
    const [closeConfirm, setCloseConfirm] = useState(false);
    const [saveOkConfirm, setSaveOkConfirm] = useState(false);
    const [info, setInfo] = useState({});
    const [error, setError] = useState({});
    const [content, setContent] = useState("");
    const [useBtn, setUseBtn] = useState("");
    const [showRaw, setShowRaw] = useState(false);
    const [rawHtml, setRawHtml] = useState('');


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
        dispatch(adminPolicyPop({adminPolicyPop:false,adminPolicyPopIdx:null,adminPolicyPopLang:''}));
        dispatch(adminPolicyPopWrite(false));
    };


    //상세정보 가져오기
    const getPolicyData = () => {
        axios.get(`${policy_detail.replace(":idx",popup.adminPolicyPopIdx)}?p_lang=${popup.adminPolicyPopLang}`,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                let data = res.data.data;
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


    //맨처음 새로작성이 아닐때만 상세정보 가져오기
    useEffect(()=>{
        if(!popup.adminPolicyPopWrite){
            getPolicyData();
        }
    },[]);


    useEffect(()=>{
        if(Object.keys(info).length > 0){
            setInfo(info);
            setUseBtn(info.p_use_yn);
            setContent(info.p_contents);
        }
    },[info]);


    //인풋값 변경시
    const onInputChangeHandler = (e) => {
        const id = e.currentTarget.id;
        const val = e.currentTarget.value;

        let newInfo = {...info};
            newInfo[id] = val;
            
        setInfo(newInfo);

        if(id == "p_title" && val.length > 0){
            let newError = {...error};
                newError.p_title = false;
            setError(newError);
        }
    };


    //에디터내용 값
    const onEditorChangeHandler = (e) => {
        setContent(e);
    };


    //에디터 HTML 버튼클릭시 textarea 보이기
    const handleClickShowRaw = () => {
        setShowRaw(!showRaw);
    };


    //에디터 HTML 버튼 토글
    useEffect(()=>{
        if (showRaw) {
            setRawHtml(content);
        }else {
            setContent(rawHtml);
        }
    },[showRaw]);


    //저장버튼 클릭시
    const saveBtnClickHandler = () => {
        let newError = { ...error };

        if (!info.p_title) {
            newError.p_title = true;
        }

        setError(newError);

        let cont;
        if(showRaw){
            cont = rawHtml;
        }else{
            cont = content.replace(/<p><br><\/p>/g, "");
        }
        if(!cont){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'내용을 입력해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }else if (!newError.p_title && cont) {
            saveHandler();
        }
    };


    //저장하기
    const saveHandler = () => {
        let cont;
        if(showRaw){
            cont = rawHtml;
        }else{
            cont = content;
        }
        //새로 작성일때
        if(popup.adminPolicyPopWrite){
            const body = {
                p_title:info.p_title,
                p_contents:cont,
                p_use_yn:useBtn,
                p_lang:popup.adminPolicyPopLang,
            };
            axios.post(`${site_policy}`, body, 
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
        }
        //수정일때
        else{
            const body = {
                idx:popup.adminPolicyPopIdx,
                p_title:info.p_title,
                p_contents:cont,
                p_use_yn:useBtn,
                p_lang:info.p_lang,
            };
            axios.put(`${policy_modify}`, body, 
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
        }
    };

    
    //저장완료
    const saveOkHandler = () => {
        closePopHandler();
        dispatch(adminPolicyPopModify(true));
    };



    return(<>
        <div className="pop_display admin_pop_terms">
            <div className="dimm"></div>
            <div className="popup_wrap">
                <div className="popup">
                    <div className="pop_tit">
                        <h3>시스템 운영정책</h3>
                        <div className="btn_switch">
                            <input type="checkbox" className="blind" id="switch" 
                                onChange={(e)=>{
                                    const checked = e.currentTarget.checked;
                                    if(checked){
                                        setUseBtn("Y");
                                    }else{
                                        setUseBtn("N");
                                    }
                                }}
                                checked={useBtn == "Y" ? true : false} 
                            />
                            <label htmlFor="switch">노출토글</label>
                            <span>노출</span>
                        </div>
                    </div>
                    <div className="pop_con">
                        <div className="con_box">
                            <div className="form_pop_inner">
                                <div className="form_inner">
                                    <div className="form_box form_box2">
                                        <div className="form_input">
                                            <h6>운영정책 제목 <i>*</i></h6>
                                            <div className="input_wrap">
                                                <InputBox
                                                    className="input_box" 
                                                    type={`text`}
                                                    placeholder={`운영정책 제목을 입력해주세요.`}
                                                    countShow={true}
                                                    countMax={16}
                                                    count={info.p_title ? info.p_title.length : 0}
                                                    value={info.p_title || ""}
                                                    onChangeHandler={onInputChangeHandler}
                                                    id={`p_title`}
                                                    inputClassName={error.p_title ? "wrong_input" : ""}
                                                />
                                                {error.p_title && <em className="txt_err">운영정책 제목을 입력해주세요.</em>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form_box form_box2">
                                        <div className="edit_box">
                                            <Editor 
                                                value={content}
                                                onChangeHandler={onEditorChangeHandler}
                                                onClickRaw={handleClickShowRaw}
                                                btnHtmlOn={showRaw}
                                            />
                                            {showRaw ? 
                                                <textarea
                                                    value={rawHtml}
                                                    onChange={(e) => {
                                                        setRawHtml(e.target.value);
                                                        
                                                    }}
                                                    className="raw_editor"
                                                />
                                                : null  
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>                            
                        </div>
                        <div className="pop_btn_wrap">
                            <button type="button" className="btn_left">등록한 운영정책 삭제</button>
                            <div className="btn_box">
                                <button type="button" className="btn_type3" onClick={closeBtnClickHandler}>취소</button>
                                <button type="button" className="btn_type4" onClick={saveBtnClickHandler}>저장</button>
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

export default PolicyPop;