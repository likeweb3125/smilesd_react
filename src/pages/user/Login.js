import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { enum_api_uri } from "../../config/enum";
import * as CF from "../../config/function";
import { loginStatus ,loginUser, siteId, maintName } from "../../store/userSlice";
import { confirmPop } from "../../store/popupSlice";
import ConfirmPop from "../../components/popup/ConfirmPop";
import InputBox from "../../components/component/InputBox";


const Login = () => {
    const login = enum_api_uri.login;
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const popup = useSelector((state)=>state.popup);
    const [confirm, setConfirm] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState({});
    const [passView, setPassView] = useState(false);
    const [saveEmailCheck, setSaveEmailCheck] = useState(false);
    const saveEmail = sessionStorage.getItem('saveEmail');


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);


    //sessionStorage 에 저장된이메일이 있는지 체크
    useEffect(()=>{
        if(saveEmail){
            setEmail(saveEmail);
            setSaveEmailCheck(true);
        }
    },[saveEmail]);


    //로그인버튼 클릭하기
    const loginBtnClickHandler = () => {
        let newError = { ...error };

        if (email.length === 0) {
            newError.email = true;
        }
        if (password.length === 0) {
            newError.password = true;
        }

        setError(newError);

        if (!newError.email && !newError.password) {
            loginHandler();
        }
    };


    //로그인하기
    const loginHandler = () => {
        const body = {
            m_email:email,
            m_password:password,
            // m_email:"likeweb@likeweb.co.kr",
            // m_password:"test1!@#$",
        };

        axios.post(login,body)
        .then((res)=>{
            if(res.status === 200){
                // 이메일저장 체크
                if(saveEmailCheck){
                    sessionStorage.setItem('saveEmail',email);
                }else{
                    sessionStorage.removeItem('saveEmail');
                }

                let data = res.data.data;

                dispatch(loginStatus(true));

                //로그인한회원정보 store 에 저장
                dispatch(loginUser(data));

                //siteId store 에 저장 (고정값)
                // dispatch(siteId(process.env.REACT_APP_SITE_ID));
                dispatch(siteId('likeweb'));

                //maintName store 에 저장 (고정값) 유지보수업체이름
                // dispatch(maintName(process.env.REACT_APP_MAINT_NAME));
                dispatch(maintName('라이크웹테스트'));

                //메인으로 페이지이동
                navigate('/');
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
        <div className="page_user_login">
            <div className="section_inner">
                <div className="user_login">
                    <div className="login_tit">
                        <h1 className="logo">Lorem ipsum</h1>
                        <strong>로그인</strong>
                    </div>
                    <div className="form_inner">
                        <div className="form_input">
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
                                        if(val.length > 0){
                                            let newError = {...error};
                                                newError.email = false;
                                            setError(newError);
                                        }
                                    }} 
                                    onKeyDownHandler={(e)=>{
                                        if (e.key === 'Enter') {
                                            e.preventDefault(); // Enter 키의 기본 동작(줄 바꿈)을 막음
                                            loginBtnClickHandler(); // 엔터 키를 눌렀을 때 이벤트 핸들러 실행
                                        }
                                    }}
                                />
                                {error.email && <em className="txt_err">이메일을 입력해주세요.</em>}
                            </div>
                        </div>
                        <div className="form_input">
                            <div className="input_wrap">
                                <InputBox
                                    className="input_box pwd_input"
                                    type={passView ? "text" : "password"} 
                                    placeholder="비밀번호" 
                                    inputClassName={error.password ? "wrong_input" : ""}
                                    value={password}
                                    onChangeHandler={(e)=>{
                                        const val = e.currentTarget.value;
                                        setPassword(val);
                                        if(val.length > 0){
                                            let newError = {...error};
                                                newError.password = false;
                                            setError(newError);
                                        }
                                    }} 
                                    onKeyDownHandler={(e)=>{
                                        if (e.key === 'Enter') {
                                            e.preventDefault(); // Enter 키의 기본 동작(줄 바꿈)을 막음
                                            loginBtnClickHandler(); // 엔터 키를 눌렀을 때 이벤트 핸들러 실행
                                        }
                                    }}
                                    password={true}
                                    passwordBtnClickHandler={()=>setPassView(!passView)}
                                />
                                {error.password && <em className="txt_err">비밀번호를 입력해주세요.</em>}
                            </div>
                        </div>
                        <div className="login_util">
                            <div className="chk_box3">
                                <input type="checkbox" id="saveEmail" className="blind"
                                    onChange={(e)=>{
                                        const checked = e.currentTarget.checked;
                                        if(checked){
                                            setSaveEmailCheck(true);
                                        }else{
                                            setSaveEmailCheck(false);
                                        }
                                    }}
                                    checked={saveEmailCheck ? true : false}
                                />
                                <label htmlFor="saveEmail">이메일 저장</label>
                            </div>
                            <Link to="/reset_password_email" className="btn_type17">비밀번호 재설정</Link>
                        </div>
                        <div className="btn_wrap">
                            <button type="button" className="btn_type25" onClick={loginBtnClickHandler}>로그인</button>
                            <Link to="/signup" className="btn_type26">회원가입</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default Login;