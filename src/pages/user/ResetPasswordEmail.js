import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { enum_api_uri } from "../../config/enum";
import * as CF from "../../config/function";
import { confirmPop } from "../../store/popupSlice";
import ConfirmPop from "../../components/popup/ConfirmPop";
import InputBox from "../../components/component/InputBox";
import ic_send from "../../images/ic_send.svg";


const ResetPasswordEmail = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const popup = useSelector((state)=>state.popup);
    const email_password = enum_api_uri.email_password;
    const [confirm, setConfirm] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState({});
    const [step, setStep] = useState(1);


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);


    //재설정 버튼 클릭시
    const resetBtnClickHandler = () => {
        let newError = { ...error };

        if(email.length > 0){
            const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
            if (emailRegex.test(email)) {
                newError.email = '';
            } else {
                newError.email = '올바른 이메일 형식이 아닙니다.';
            }
        }else{
            newError.email = '이메일을 입력해주세요.';
        }

        setError(newError);

        if (!newError.email || newError.email.length === 0) {
            sendHandler();
        }
    };


    //이메일전송하기
    const sendHandler = () => {
        setStep(2);
        const body = {
            m_email:'',
        };

        // axios.post(email_password,body)
        // .then((res)=>{
        //     if(res.status === 200){
        //         setStep(2);
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
                {step === 1 ? 
                    <div className="user_con_box">
                        <div className="user_con_inner">
                            <h3>
                                <b>비밀번호 재설정</b>
                                <span>가입했던 이메일을 입력해주세요. <br/>비밀번호 재설정 메일을 보내드립니다.</span>
                            </h3>
                            <div className="form_inner">
                                <div className="form_input">
                                    <h5>이메일</h5>
                                    <div className="input_wrap">
                                        <InputBox
                                            className="input_box"
                                            type={`text`}
                                            placeholder="이메일" 
                                            inputClassName={error.email ? "wrong_input" : ""}
                                            value={email}
                                            onChangeHandler={(e)=>{
                                                const val = e.currentTarget.value;
                                                setEmail(val);

                                                let newError = {...error};
                                                if(val.length > 0){
                                                    newError.email = '';
                                                }else{
                                                    newError.email = '이메일을 입력해주세요.';
                                                }
                                                setError(newError);
                                            }} 
                                        />
                                       {error.email && error.email.length > 0 && <em className="txt_err">{error.email}</em>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="btn_wrap">
                            <button type="button" className="btn_type25" onClick={resetBtnClickHandler}>비밀번호 재설정</button>
                        </div>
                    </div>
                    : step === 2 &&
                    <div className="user_con_box">
                        <div className="user_con_inner">
                            <h3>
                                <b>이메일 전송</b>
                                <span>비밀번호 재설정 링크를 전송하였습니다.</span>
                            </h3>
                            <div className="con_txt">
                                <div className="ic">
                                    <img src={ic_send} alt="icon"/>
                                </div>
                                <span>고객님께서 회원가입 시 입력했던 이메일로 <br/>비밀번호 재설정 링크를 전송하였습니다.</span>
                            </div>
                        </div>
                        <div className="btn_wrap">
                            <Link to={'/'} className="btn_type26">홈으로 가기</Link>
                            <Link to={'/login'} className="btn_type25">로그인</Link>
                        </div>
                    </div>
                }
            </div>
        </div>

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default ResetPasswordEmail;