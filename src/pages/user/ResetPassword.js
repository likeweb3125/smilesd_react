import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { enum_api_uri } from "../../config/enum";
import * as CF from "../../config/function";
import { confirmPop } from "../../store/popupSlice";
import ConfirmPop from "../../components/popup/ConfirmPop";
import InputBox from "../../components/component/InputBox";


const ResetPassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const popup = useSelector((state)=>state.popup);
    const reset_password = enum_api_uri.reset_password;
    const [confirm, setConfirm] = useState(false);
    const [saveOkconfirm, setSaveOkConfirm] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [error, setError] = useState({});
    const [passView, setPassView] = useState(false);
    const [passView2, setPassView2] = useState(false);


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
            setSaveOkConfirm(false);
        }
    },[popup.confirmPop]);


    //저장버튼 클릭시
    const saveBtnClickHandler = () => {
        let newError = {...error};

        if(password.length > 0){
            let pw = password;
            let num = pw.search(/[0-9]/g);
            let eng = pw.search(/[a-z]/ig);
            
            if(pw.length < 8 || pw.length > 13){
                newError.password = '비밀번호를 8~12자 이내로 입력해주세요.';
            }else if(pw.search(/\s/) != -1){
                newError.password = '비밀번호를 공뱁없이 입력해주세요.';
            }else if(num < 0 || eng < 0){
                newError.password = '비밀번호를 영문,숫자를 포함하여 입력해주세요.';
            }else{
                newError.password = '';
            }
        }else{
            newError.password = '비밀번호를 입력해주세요.';
        }

        if(password2.length > 0){
            if (password === password2) {
                newError.password2 = '';
            } else {
                newError.password2 = '비밀번호가 일치하지 않습니다.';
            }
        }else{
            newError.password2 = '비밀번호를 재 입력해 주세요.';
        }

        setError(newError);

        if((!newError.password || newError.password.length === 0) && (!newError.password2 || newError.password2.length === 0)){
            saveHandler();
        }
    };


    //비밀번호변경 저장하기
    const saveHandler = () => {
        dispatch(confirmPop({
            confirmPop:true,
            confirmPopTit:'알림',
            confirmPopTxt:'비밀번호가 변경되었습니다.',
            confirmPopBtn:1,
        }));
        setSaveOkConfirm(true);
        const body = {
            new_password:password,
        };

        // axios.post(reset_password,body)
        // .then((res)=>{
        //     if(res.status === 200){
        //         dispatch(confirmPop({
        //             confirmPop:true,
        //             confirmPopTit:'알림',
        //             confirmPopTxt:'비밀번호가 변경되었습니다.',
        //             confirmPopBtn:1,
        //         }));
        //         setConfirm(true);
        //     }
        // })
        // .catch((error) => {
        //     const err_msg = CF.errorMsgHandler(error);
        //     dispatch(confirmPop({
        //         confirmPop:true,
        //         confirmPopTit:'알림',
        //         confirmPopTxt: err_msg,
        //         confirmPopBtn:1,
        //     }));
        //     setConfirm(true);
        // });
    };



    return(<>
        <div className="page_user_find">
            <div className="section_inner">
                <div className="user_con_box">
                    <div className="user_con_inner">
                        <h3>
                            <b>비밀번호 재설정</b>
                            <span>새 비밀번호로 재설정해주세요.</span>
                        </h3>
                        <div className="form_inner">
                            <div className="form_input">
                                <h5>새 비밀번호 <i>*</i></h5>
                                <div className="input_wrap">
                                    <InputBox
                                        className="input_box pwd_input"
                                        type={passView ? "text" : "password"} 
                                        placeholder="영문자, 숫자를 조합하여 12자 이내로 입력" 
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
                                <h5>새 비밀번호 확인 <i>*</i></h5>
                                <div className="input_wrap">
                                    <InputBox
                                        className="input_box pwd_input"
                                        type={passView2 ? "text" : "password"} 
                                        placeholder="비밀번호 재입력" 
                                        inputClassName={error.password2 && error.password2.length > 0 ? "wrong_input" : ""}
                                        value={password2}
                                        onChangeHandler={(e)=>{
                                            const val = e.currentTarget.value;
                                            setPassword2(val);
                                            
                                            let newError = {...error};
                                            if(val.length > 0){
                                                newError.password2 = '';
                                            }else{
                                                newError.password2 = '비밀번호를 재 입력해 주세요.';
                                            }
                                            setError(newError);
                                        }} 
                                        password={true}
                                        passwordBtnClickHandler={()=>setPassView2(!passView2)}
                                    />
                                    {error.password2 && error.password2.length > 0 && <em className="txt_err">{error.password2}</em>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="btn_wrap">
                        <button type="button" className="btn_type25" onClick={saveBtnClickHandler}>저장</button>
                    </div>
                </div>
            </div>
        </div>

        {/* 비밀번호저장완료 confirm팝업 */}
        {saveOkconfirm && <ConfirmPop closePop="custom" onCloseHandler={()=>navigate('/')} />}

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default ResetPassword;