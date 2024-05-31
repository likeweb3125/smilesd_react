import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { enum_api_uri } from "../../../config/enum";
import { confirmPop, changePasswordPop } from "../../../store/popupSlice";
import * as CF from "../../../config/function";
import ConfirmPop from "../../popup/ConfirmPop";
import InputBox from "../InputBox";

const MyProfile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const user_info = enum_api_uri.user_info;
    const user_info_edit = enum_api_uri.user_info_edit;
    const [confirm, setConfirm] = useState(false);
    const [deltConfirm, setDeltConfirm] = useState(false);
    const [info, setInfo] = useState({});
    const [phone, setPhone] = useState("");
    const [number, setNumber] = useState("");
    const [error, setError] = useState({});
    const [phoneAuth, setPhoneAuth] = useState(false);
    const [authBox, setAuthBox] = useState(false);
    const [minutes, setMinutes] = useState(5);
    const [seconds, setSeconds] = useState(0);
    const [phoneChek, setPhoneCheck] = useState(true);


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
            setDeltConfirm(false);
        }
    },[popup.confirmPop]);


    //회원정보 가져오기
    const getUserInfo = () => {
        axios.get(user_info,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                const data = res.data.data.member;
                setInfo(data);
                setPhone(data.m_mobile);
            }
        })
        .catch((error) => {
            const err_msg = CF.errorMsgHandler(error);
            if(error.response.status === 401){//토큰에러시 로그인페이지로 이동
                navigate("/login");
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


    //맨처음 회원정보 가져오기
    useEffect(()=>{
        getUserInfo();
    },[]);


    //휴대폰번호 인증번호 전송
    const onPhoneAuthHandler = () => {
        setAuthBox(true);

        let newError = {...error};
        newError.phone = '';
        setError(newError);
    };


    //인증번호확인 타이머
    useEffect(() => {
        if(authBox){
            const countdown = setInterval(() => {
                if (parseInt(seconds) > 0) {
                    setSeconds(parseInt(seconds) - 1);
                }
                if (parseInt(seconds) === 0) {
                    if (parseInt(minutes) === 0) {
                        clearInterval(countdown);

                        dispatch(confirmPop({
                            confirmPop:true,
                            confirmPopTit:'알림',
                            confirmPopTxt:'유효시간이 지났습니다. 인증번호를 다시 전송해주세요.',
                            confirmPopBtn:1,
                        }));
                        setConfirm(true);

                        setAuthBox(false);
                        setMinutes(5);
                        setSeconds(0);
                    } else {
                        setMinutes(parseInt(minutes) - 1);
                        setSeconds(59);
                    }
                }
            }, 1000);
            return () => clearInterval(countdown);
        }
    },[minutes, seconds, authBox]);


    //인증번호 인증하기
    const onAuthCheckHandler = () => {
        //폰 인증완료
        setPhoneCheck(true);
        setAuthBox(false);
        setMinutes(5);
        setSeconds(0);

        let newError = {...error};
        newError.phone = '';
        setError(newError);
    };


    //휴대폰번호 입력값 변경시
    const phoneInputChangeHandler = (val) => {
        setPhone(val);

        const num = val.replace(/[^0-9]/g, '').length;
        let newError = {...error};

        if(num > 10){
            //기존등록한 휴대폰번호인지 체크
            if(val !== info.m_mobile){
                setPhoneAuth(true);
                setPhoneCheck(false);
            }else{
                setPhoneAuth(false);
                setPhoneCheck(true);
            }
            newError.phone = '';
        }else{
            setPhoneAuth(false);
            newError.phone = '휴대폰 번호를 입력해주세요.';
        }
        setError(newError);
    };


    //체크박스, 라디오 값 변경시
    const onCheckChangeHandler = (checked, name, val) => {
        let newData = {...info};

        if(checked){
            newData[name] = val;
        }else{
            newData[name] = val;
        }
        
        setInfo(newData);
    };


    //저장버튼 클릭시
    const saveBtnClickHandler = () => {
        let newError = {...error};

        if(!phoneChek){
            newError.phone = '휴대폰 번호를 인증해주세요.';
        }else{
            newError.phone = '';
        }

        setError(newError);

        if(phoneChek){
            saveHandler();
        }
    };


    //회원정보 저장하기
    const saveHandler = () => {
        const body = {
            m_mobile:phone,
            m_sms_yn:info.m_sms_yn,
            m_mail_yn:info.m_mail_yn,
        };
        axios.put(`${user_info_edit}`, body, 
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
            }
        })
        .catch((error) => {
            const err_msg = CF.errorMsgHandler(error);
            if(error.response.status === 401){//토큰에러시 로그인페이지로 이동
                navigate("/login");
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


    //탈퇴하기 버튼 클릭시
    const deltBtnClickHandler = () => {
        dispatch(confirmPop({
            confirmPop:true,
            confirmPopTit:'알림',
            confirmPopTxt:'탈퇴 하시겠습니까?',
            confirmPopBtn:2,
        }));
        setDeltConfirm(true);
    };


    //탈퇴하기
    const deltHandler = () => {
        
    };


    return(<>
        <div className="tbl_wrap4">
            <table>
                <colgroup>
                    <col style={{'width':'180px'}}/>
                    <col style={{'width':'auto'}}/>
                </colgroup>
                <tbody>
                    <tr>
                        <th>이메일</th>
                        <td>{info.m_email}</td>
                    </tr>
                    <tr>
                        <th>비밀번호</th>
                        <td>
                            <button type="button" className="btn_type27" onClick={()=>dispatch(changePasswordPop(true))}>비밀번호 변경</button>
                        </td>
                    </tr>
                    <tr>
                        <th>이름</th>
                        <td>{info.m_name}</td>
                    </tr>
                    <tr>
                        <th>휴대폰 번호</th>
                        <td>
                            <div className="sign_phone">
                                <div className="input_box">
                                    <InputBox
                                        className="input_box"
                                        type={`text`}
                                        placeholder="숫자만" 
                                        inputClassName={error.phone && error.phone.length > 0 ? "wrong_input" : ""}
                                        value={phone}
                                        onChangeHandler={(e)=>{
                                            const val = e.currentTarget.value;
                                            phoneInputChangeHandler(val);
                                        }} 
                                        phone={true}
                                    />
                                    <button type="button" 
                                        className={`btn_sign${phoneAuth && !authBox ? ' on' : ''}`}
                                        disabled={phoneAuth && !authBox ? false : true}
                                        onClick={onPhoneAuthHandler}
                                    >인증번호 전송</button>
                                </div>
                                {error.phone && error.phone.length > 0 && <em className="txt_err">{error.phone}</em>}
                                {authBox &&
                                    <div className="input_box">
                                        <InputBox
                                            className="input_box"
                                            type={`text`}
                                            placeholder="인증번호 입력" 
                                            inputClassName={error.number ? "wrong_input" : ""}
                                            value={number}
                                            onChangeHandler={(e)=>{
                                                const val = e.currentTarget.value;
                                                setNumber(val);

                                                let newError = {...error};
                                                if(val.length > 0){
                                                    newError.number = '';
                                                }else{
                                                    newError.number = '인증번호를 입력해주세요.';
                                                }
                                                setError(newError);
                                            }} 
                                            numberOnly={true}
                                        />
                                        <button type="button" className={`btn_sign on`}
                                            onClick={onAuthCheckHandler}
                                        >인증번호 인증</button>
                                        <b className="sign_time">{minutes}:{seconds < 10 ? `0${seconds}` : seconds}</b>
                                    </div>
                                }
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th>마케팅 <br className="m_br"/>수신동의</th>
                        <td>
                            <div className="chk_rdo_wrap chk_rdo_wrap2">
                                <div className="chk_box1">
                                    <input type="checkbox" id="email_check" className="blind"
                                        onChange={(e)=>{
                                            const checked = e.currentTarget.checked;
                                            if(checked){
                                                onCheckChangeHandler(checked,"m_mail_yn",'Y');
                                            }else{
                                                onCheckChangeHandler(checked,"m_mail_yn",'N');
                                            }
                                        }} 
                                        checked={info.m_mail_yn && info.m_mail_yn == 'Y' ? true : false}
                                    />
                                    <label htmlFor="email_check">이메일</label>
                                </div>
                                <div className="chk_box1">
                                    <input type="checkbox" id="sms_check" className="blind"
                                        onChange={(e)=>{
                                            const checked = e.currentTarget.checked;
                                            if(checked){
                                                onCheckChangeHandler(checked,"m_sms_yn",'Y');
                                            }else{
                                                onCheckChangeHandler(checked,"m_sms_yn",'N');
                                            }
                                        }} 
                                        checked={info.m_sms_yn && info.m_sms_yn == 'Y' ? true : false}
                                    />
                                    <label htmlFor="sms_check">문자</label>
                                </div>
                            </div>
                            <p className="txt">* 회원가입시 입력했던 회원 정보로 수신됩니다.</p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div className="btn_between_wrap">
            <button type="button" className="btn_type17" onClick={deltBtnClickHandler}>탈퇴하기</button>
            <button type="button" className="btn_type28" onClick={saveBtnClickHandler}>저장</button>
        </div>

        {/* 탈퇴하기 confirm팝업 */}
        {deltConfirm && <ConfirmPop onClickHandler={deltHandler} />}

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default MyProfile;