import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { enum_api_uri } from "../../config/enum";
import * as CF from "../../config/function";
import { termsCheckList } from "../../store/etcSlice";
import { confirmPop, termsPop } from "../../store/popupSlice";
import ConfirmPop from "../../components/popup/ConfirmPop";
import InputBox from "../../components/component/InputBox";
import SignUpCompletedBox from "../../components/component/user/SignUpCompletedBox";


const SignUp = () => {
    const dispatch = useDispatch();
    const popup = useSelector((state)=>state.popup);
    const etc = useSelector((state)=>state.etc);
    const site_policy = enum_api_uri.site_policy;
    const signup = enum_api_uri.signup;
    const [confirm, setConfirm] = useState(false);
    const [signUpCompleted, setSingUpCompleted] = useState(false);
    const [termsList, setTermsList] = useState([]);
    const [termsChecked, setTermsChecked] = useState([]);
    const [allCheck, setAllCheck] = useState(false);
    const [checkList, setCheckList] = useState([]);
    const [checkList2, setCheckList2] = useState([]);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [phone, setPhone] = useState("");
    const [number, setNumber] = useState("");
    const [error, setError] = useState({});
    const [passView, setPassView] = useState(false);
    const [passView2, setPassView2] = useState(false);
    const [phoneAuth, setPhoneAuth] = useState(false);
    const [authBox, setAuthBox] = useState(false);
    const [minutes, setMinutes] = useState(5);
    const [seconds, setSeconds] = useState(0);
    const [phoneChek, setPhoneCheck] = useState(false);


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);


    //약관 리스트 가져오기
    const getTermsList = () => {
        axios.get(site_policy)
        .then((res)=>{
            if(res.status === 200){
                const data = res.data.data;
                setTermsList(data.policy_list);

                //필수체크인 이용약관 리스트 idx값만 배열로 
                const list = data.policy_list.filter((item) => item.constraint_type == 'Y');
                const idxList = list.map((item) => item.idx);
                setTermsChecked(idxList);
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


    //맨처음 약관리스트 가져오기
    useEffect(()=>{
        getTermsList();
    },[]);


    //전체약관 동의
    const allAgreeHandler = (checked) => {
        setAllCheck(!allCheck);

        const list = termsList.map((item) => item.idx);
        if (checked) {
            setCheckList(list);
        }else{
            setCheckList([]);
        }
    }


    //이용약관 체크박스 체크시
    const onCheckHandler = (idx, checked) => {
        let newCheckList = [...checkList];
        
        if(checked){
            newCheckList = newCheckList.concat(idx);
        }else if(!checked && newCheckList.includes(idx)){
            newCheckList = newCheckList.filter((item)=>item !== idx);
        }
        setCheckList(newCheckList);
    };


    //마케팅수신동의 선택 체크박스 체크시
    const onCheckHandler2 = (idx, checked) => {
        let newCheckList2 = [...checkList2];

        if(checked){
            newCheckList2 = newCheckList2.concat(idx);
        }else if(!checked && newCheckList2.includes(idx)){
            newCheckList2 = newCheckList2.filter((item)=>item !== idx);
        }
        setCheckList2(newCheckList2);
    };

    
    //약관 체크박스 변경시
    useEffect(()=>{
        dispatch(termsCheckList(checkList));

        if(checkList.includes(8)){
            setCheckList2([1,2]);
        }else{
            if(checkList2.includes(1) && !checkList2.includes(2)){
                setCheckList2([1]);
            }else if(!checkList2.includes(1) && checkList2.includes(2)){
                setCheckList2([2]);
            }else{
                setCheckList2([]);
            }
        }

        if(checkList.length > 0 && checkList.length === termsList.length){
            setAllCheck(true);
        }else{
            setAllCheck(false);
        }
    },[checkList]);


    //마케팅수신동의 안에 체크박스 변경시
    useEffect(()=>{
        let newCheckList = [...checkList];

        if(checkList2.includes(1) && checkList2.includes(2)){
            if(!newCheckList.includes(8)){
                newCheckList = newCheckList.concat(8);
                setCheckList(newCheckList);
            }
        }else{
            if(newCheckList.includes(8)){
                newCheckList = newCheckList.filter((item)=>item !== 8);
                setCheckList(newCheckList);
            }
        }
    },[checkList2]);


    useEffect(()=>{
        setCheckList(etc.termsCheckList);
    },[etc.termsCheckList]);


    //휴대폰번호 인증번호 전송
    const onPhoneAuthHandler = () => {
        setAuthBox(true);
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
    };


    //회원가입 버튼 클릭시
    const signupBtnClickHandler = () => {
        //필수 이용약관 체크
        const termsCheck = termsChecked.every(item => checkList.includes(item));
        if(!termsCheck){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'이용약관에 동의해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }

        let newError = {...error};

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

        if(!phoneChek){
            newError.phone = '휴대폰 번호를 인증해주세요.';
        }else{
            newError.phone = '';
        }

        setError(newError);

        if((!newError.email || newError.email.length === 0) && (!newError.password || newError.password.length === 0) && (!newError.password2 || newError.password2.length === 0) && phoneChek){
            signupHandler();
        }
    };


    //회원가입 하기
    const signupHandler = () => {
        let emailCheck = '';
        let smsCheck = '';
        if(checkList2.includes(1)){
            emailCheck = 'Y';
        }
        if(checkList2.includes(2)){
            smsCheck = 'Y';
        }

        const body = {
            m_email: email,
            m_password: password,
            m_name: '테스트',
            m_mobile: phone,
            m_sms_yn: emailCheck,
            m_mail_yn: smsCheck,
        };

        console.log(body);

        // axios.post(signup,body)
        // .then((res)=>{
        //     if(res.status === 200){
        //         //회원가입 완료
        //         setSingUpCompleted(true);
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
        <div className="page_user_join">
            <div className="section_inner">
                {!signUpCompleted ?
                    <div className="join_form">
                        <h3 className="join_tit">회원가입</h3>
                        <div className="terms_wrap">
                            <div className="all_chk_wrap">
                                <div className="chk_box3">
                                    <input type="checkbox" id="allChk" className="blind"
                                        onChange={(e)=>{
                                            const checked = e.currentTarget.checked;
                                            allAgreeHandler(checked);
                                        }}
                                        checked={allCheck}
                                    />
                                    <label htmlFor="allChk">전체 이용약관에 동의</label>
                                </div>
                            </div>
                            <div className="terms_box">
                                <ul className="list_terms">
                                    {termsList.map((cont,i)=>{
                                        return(
                                            <li key={i}>
                                                <div className="terms_chk">
                                                    <div className="chk_box3">
                                                        <input type="checkbox" id={`terms${cont.idx}`} className="blind"
                                                            onChange={(e)=>{
                                                                const checked = e.currentTarget.checked;
                                                                onCheckHandler(cont.idx, checked);
                                                            }}
                                                            checked={checkList.includes(cont.idx)}
                                                        />
                                                        <label htmlFor={`terms${cont.idx}`}>{cont.p_title}{cont.constraint_type == 'Y' ? ' (필수)' : ' (선택)'}</label>
                                                    </div>
                                                    <button type="button" className="btn_open_terms" onClick={()=>dispatch(termsPop({termsPop:true,termsPopIdx:cont.idx}))}>약관 보기</button>
                                                </div>
                                                {/* 마케팅 수신 동의 일때만 노출 */}
                                                {cont.policy_type == '4' &&
                                                    <div className="chk_wrap">
                                                        <div className="chk_box1">
                                                            <input type="checkbox" id="email_check" className="blind"
                                                                onChange={(e)=>{
                                                                    const checked = e.currentTarget.checked;
                                                                    onCheckHandler2(1, checked);
                                                                }} 
                                                                checked={checkList2.includes(1)}
                                                            />
                                                            <label htmlFor="email_check">[선택] 이메일 수신 동의</label>
                                                        </div>
                                                        <div className="chk_box1">
                                                            <input type="checkbox" id="sms_check" className="blind"
                                                                onChange={(e)=>{
                                                                    const checked = e.currentTarget.checked;
                                                                    onCheckHandler2(2, checked);
                                                                }} 
                                                                checked={checkList2.includes(2)}
                                                            />
                                                            <label htmlFor="sms_check">[선택] 문자 수신 동의</label>
                                                        </div>
                                                    </div>
                                                }
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                        <div className="form_inner">
                            <div className="form_input">
                                <h5>이메일 <i>*</i></h5>
                                <div className="input_wrap">
                                    <InputBox
                                        className="input_box"
                                        type={`text`}
                                        placeholder="이메일" 
                                        inputClassName={error.email && error.email.length > 0 ? "wrong_input" : ""}
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
                            <div className="form_input">
                                <h5>비밀번호 <i>*</i></h5>
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
                                <h5>비밀번호 확인 <i>*</i></h5>
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
                            <div className="form_input">
                                <h5>휴대폰 번호 <i>*</i></h5>
                                <div className="input_wrap">
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
                                                    setPhone(val);

                                                    const num = val.replace(/[^0-9]/g, '').length;
                                                    let newError = {...error};
                                                    if(num > 10){
                                                        setPhoneAuth(true);
                                                        newError.phone = '';
                                                    }else{
                                                        setPhoneAuth(false);
                                                        newError.phone = '휴대폰 번호를 입력해주세요.';
                                                    }
                                                    setError(newError);
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
                                </div>
                            </div>
                            <div className="btn_wrap">
                                <button type="button" 
                                    className="btn_type25 w_100"
                                    onClick={signupBtnClickHandler}
                                >회원가입</button>
                            </div>
                        </div>
                    </div>
                    : <SignUpCompletedBox name={'테스트'} />
                }
            </div>
        </div>

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default SignUp;