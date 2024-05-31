import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import * as CF from "../../../config/function";
import { enum_api_uri } from "../../../config/enum";
import { confirmPop, changePasswordPop } from "../../../store/popupSlice";
import InputBox from "../../component/InputBox";
import ConfirmPop from "../ConfirmPop";


const ChangePasswordPop = () => {
    const dispatch = useDispatch();
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const reset_password = enum_api_uri.reset_password;
    const [confirm, setConfirm] = useState(false);
    const [okConfirm, setOkConfirm] = useState(false);
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPassword2, setNewPassword2] = useState("");
    const [passView, setPassView] = useState(false);
    const [newPassView, setNewPassView] = useState(false);
    const [newPassView2, setNewPassView2] = useState(false);
    const [error, setError] = useState({});


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
            setOkConfirm(false);
        }
    },[popup.confirmPop]);


    //팝업닫기
    const closePopHandler = () => {
        dispatch(changePasswordPop(false));
    };


    //비밀번호변경 버튼 클릭시
    const changeBtnClickHandler = () => {
        let newError = {...error};

        if(password.length > 0){
            newError.password = '';
        }else{
            newError.password = '기존 비밀번호를 입력해 주세요.';
        }

        if(newPassword.length > 0){
            let pw = newPassword;
            let num = pw.search(/[0-9]/g);
            let eng = pw.search(/[a-z]/ig);
            
            if(pw.length < 8 || pw.length > 13){
                newError.newPassword = '비밀번호를 8~12자 이내로 입력해주세요.';
            }else if(pw.search(/\s/) != -1){
                newError.newPassword = '비밀번호를 공뱁없이 입력해주세요.';
            }else if(num < 0 || eng < 0){
                newError.newPassword = '비밀번호를 영문,숫자를 포함하여 입력해주세요.';
            }else{
                newError.newPassword = '';
            }
        }else{
            newError.newPassword = '새 비밀번호를 입력해주세요.';
        }

        if(newPassword2.length > 0){
            if (newPassword === newPassword2) {
                newError.newPassword2 = '';
            } else {
                newError.newPassword2 = '비밀번호가 일치하지 않습니다.';
            }
        }else{
            newError.newPassword2 = '새 비밀번호를 재 입력해 주세요.';
        }

        setError(newError);

        if((!newError.password || newError.password.length === 0) && (!newError.newPassword || newError.newPassword.length === 0) && (!newError.newPassword2 || newError.newPassword2.length === 0)){
            changeHandler();
        }
    };


    //비밀번호 변경하기
    const changeHandler = () => {
        const body = {
            old_password:password,
            new_password:newPassword,
        };

        axios.post(reset_password,body,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}    
        )
        .then((res)=>{
            if(res.status === 200){
                dispatch(confirmPop({
                    confirmPop:true,
                    confirmPopTit:'알림',
                    confirmPopTxt:'비밀번호가 변경되었습니다.',
                    confirmPopBtn:1,
                }));
                setOkConfirm(true);
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




    return(<>
        <div className="pop_display pop_pwd">
            <div className="dimm"></div>
            <div className="popup_wrap">
                <div className="popup">
                    <div className="pop_tit">
                        <h3>비밀번호 변경</h3>
                    </div>
                    <div className="pop_con">
                        <div className="con_box">
                            <div className="form_inner">
                                <div className="form_input">
                                    <div className="input_wrap">
                                        <h5>기존 비밀번호 <i>*</i></h5>
                                        <InputBox
                                            className="input_box pwd_input"
                                            type={passView ? "text" : "password"} 
                                            placeholder="기존 비밀번호 입력" 
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
                                </div>
                                <div className="form_input">
                                    <div className="input_wrap">
                                        <h5>새 비밀번호 <i>*</i></h5>
                                        <InputBox
                                            className="input_box pwd_input"
                                            type={newPassView ? "text" : "password"} 
                                            placeholder="영문자, 숫자를 조합하여 12자 이내로 입력" 
                                            inputClassName={error.newPassword && error.newPassword.length > 0 ? "wrong_input" : ""}
                                            value={newPassword}
                                            onChangeHandler={(e)=>{
                                                const val = e.currentTarget.value;
                                                setNewPassword(val);

                                                let newError = {...error};
                                                if(val.length > 0){
                                                    newError.newPassword = '';
                                                }else{
                                                    newError.newPassword = '비밀번호를 입력해주세요.';
                                                }
                                                setError(newError);
                                            }} 
                                            password={true}
                                            passwordBtnClickHandler={()=>setNewPassView(!newPassView)}
                                        />
                                        {error.newPassword && error.newPassword.length > 0 && <em className="txt_err">{error.newPassword}</em>}
                                    </div>
                                </div>
                                <div className="form_input">
                                    <div className="input_wrap">
                                        <h5>새 비밀번호 확인 <i>*</i></h5>
                                        <InputBox
                                            className="input_box pwd_input"
                                            type={newPassView2 ? "text" : "password"} 
                                            placeholder="영문자, 숫자를 조합하여 12자 이내로 입력" 
                                            inputClassName={error.newPassword2 && error.newPassword2.length > 0 ? "wrong_input" : ""}
                                            value={newPassword2}
                                            onChangeHandler={(e)=>{
                                                const val = e.currentTarget.value;
                                                setNewPassword2(val);

                                                let newError = {...error};
                                                if(val.length > 0){
                                                    newError.newPassword2 = '';
                                                }else{
                                                    newError.newPassword2 = '비밀번호를 입력해주세요.';
                                                }
                                                setError(newError);
                                            }} 
                                            password={true}
                                            passwordBtnClickHandler={()=>setNewPassView2(!newPassView2)}
                                        />
                                        {error.newPassword2 && error.newPassword2.length > 0 && <em className="txt_err">{error.newPassword2}</em>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="pop_btn_wrap">
                            <div className="btn_box w_100">
                                <button type="button" className="btn_type3" onClick={closePopHandler}>취소</button>
                                <button type="button" className="btn_type4" onClick={changeBtnClickHandler}>변경</button>
                            </div>
                        </div>
                    </div>
                    <button type="button" className="btn_pop_close" onClick={closePopHandler}>팝업닫기</button>
                </div>
            </div>
        </div>

        {/* 비밀번호변경 완료 confirm팝업 */}
        {okConfirm && <ConfirmPop closePop="custom" onCloseHandler={closePopHandler} />}

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default ChangePasswordPop;