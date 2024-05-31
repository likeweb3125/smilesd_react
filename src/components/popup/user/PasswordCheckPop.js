import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import * as CF from "../../../config/function";
import { enum_api_uri } from "../../../config/enum";
import { confirmPop, passwordCheckPop } from "../../../store/popupSlice";
import { inquiryDetailIdx } from "../../../store/etcSlice";
import { secretPassCheckOk } from "../../../store/commonSlice";
import InputBox from "../../component/InputBox";
import ConfirmPop from "../ConfirmPop";


const PasswordCheckPop = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const popup = useSelector((state)=>state.popup);
    const board_password = enum_api_uri.board_password;
    const [confirm, setConfirm] = useState(false);
    const [password, setPassword] = useState("");
    const [passView, setPassView] = useState(false);
    const [error, setError] = useState({});


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);


    //팝업닫기
    const closePopHandler = () => {
        dispatch(passwordCheckPop({passwordCheckPop:false,passwordCheckPopCate:null,passwordCheckPopIdx:null,passwordCheckPopMoveUrl:null}));
    };


    //비밀번호 확인하기버튼 클릭시
    const passwordCheckHandler = () => {
        let newError = {...error};

        if(!newError.password || newError.password.length === 0){
            passwordCheck();
        }
    };


    //비밀번호 확인하기
    const passwordCheck = () => {
        const body = {
            idx: popup.passwordCheckPopIdx,
            password: password,
        };
        axios.post(board_password, body)
        .then((res)=>{
            if(res.status === 200){
                closePopHandler();

                //게시글 상세페이지로 이동일때
                if(popup.passwordCheckPopMoveUrl){
                    navigate(popup.passwordCheckPopMoveUrl+popup.passwordCheckPopCate+'/'+popup.passwordCheckPopIdx);
                }else{
                    dispatch(inquiryDetailIdx(popup.passwordCheckPopIdx));
                }

                //비밀번호체크 성공
                dispatch(secretPassCheckOk(true));
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

            //비밀번호체크 실패
            dispatch(secretPassCheckOk(false));
        });
    };




    return(<>
        <div className="pop_display pop_pwd">
            <div className="dimm"></div>
            <div className="popup_wrap">
                <div className="popup">
                    <div className="pop_tit">
                        <h3>알림</h3>
                    </div>
                    <div className="pop_con">
                        <div className="con_box">
                            <div className="txt_box">
                                이 글은 비밀글입니다.
                                <br/>
                                <b>비밀번호</b>를 입력해 주세요.
                            </div>
                            <InputBox
                                className="input_box pwd_input"
                                type={passView ? "text" : "password"} 
                                placeholder="비밀번호를 입력해주세요." 
                                inputClassName={error.password && error.password.length > 0 ? "wrong_input" : ""}
                                value={password}
                                onChangeHandler={(e)=>{
                                    const val = e.currentTarget.value;
                                    setPassword(val);

                                    let newError = {...error};
                                    if(val.length > 0){
                                        newError.password = '';
                                    }else{
                                        newError.password = '비밀번호를 입력해주세요.';
                                    }
                                    setError(newError);
                                }} 
                                password={true}
                                passwordBtnClickHandler={()=>setPassView(!passView)}
                            />
                            {error.password && error.password.length > 0 && <em className="txt_err">{error.password}</em>}
                        </div>
                        <div className="pop_btn_wrap">
                            <div className="btn_box w_100">
                                <button type="button" className="btn_type3" onClick={closePopHandler}>취소</button>
                                <button type="button" className="btn_type4" onClick={passwordCheckHandler}>확인</button>
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

export default PasswordCheckPop;