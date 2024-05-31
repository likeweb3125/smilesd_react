import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Formik, Field } from "formik";
import * as Yup from "yup";
import { enum_api_uri } from "../../config/enum";
import * as CF from "../../config/function";
import { termsCheckList } from "../../store/etcSlice";
import { confirmPop, termsPop } from "../../store/popupSlice";
import ConfirmPop from "../../components/popup/ConfirmPop";
import InputBox from "../../components/component/InputBox";


const SignUp = () => {
    const dispatch = useDispatch();
    const popup = useSelector((state)=>state.popup);
    const etc = useSelector((state)=>state.etc);
    const site_policy = enum_api_uri.site_policy;
    const [confirm, setConfirm] = useState(false);
    const [termsList, setTermsList] = useState([]);
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
            setCheckList2([]);
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


    //회원가입 Yup 유효성검사
    const validationSchema = Yup.object().shape({
        m_email: Yup.string()
            .defined("이메일을 입력해주세요.")
            .email("올바른 이메일 형식이 아닙니다."),
        m_password: Yup.string()
            .min(8, '8자 이상 입력해주세요.')
            .max(12, '12자까지 입력해주세요.')
            .required("비밀번호를 입력해주세요.")
            .matches(/[0-9]/, '숫자를 포함하여 입력해주세요.')
            .matches(/[a-z]/, '영문을 포함하여 입력해주세요.'),
        m_password2: Yup.string()
            .oneOf([Yup.ref("m_password"), null], "비밀번호가 일치하지 않습니다.")
            .required("비밀번호를 입력해주세요."),
    });


    //회원가입 버튼 클릭시
    const onSignupBtnClickHandler = (values) => {
        console.log(values);
        let newError = {...error};
        
        if(phoneChek){

        }else{
            newError.phone = true;
        }

        setError(newError);
    };



    return(<>
        <div className="page_user_join">
            <div className="section_inner">
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
                    <Formik
                        initialValues={{
                            m_email: "",
                            m_password: "",
                            m_password2: "",
                            m_mobile: "",
                        }}
                        validationSchema={validationSchema}
                        // onSubmit={onSignupBtnClickHandler}
                    >
                        {({values, handleChange, errors}) => (
                            <form>
                                <div className="form_inner">
                                    <div className="form_input">
                                        <h5>이메일 <i>*</i></h5>
                                        <div className="input_wrap">
                                            <InputBox
                                                className="input_box"
                                                type={`password`}
                                                placeholder="이메일" 
                                                inputClassName={errors.m_email ? "wrong_input" : ""}
                                                value={values.m_email} 
                                                name="m_email" 
                                                id="m_email"
                                                onChangeHandler={handleChange}
                                            />
                                            {errors.m_email &&
                                                <em className="txt_err">{errors.m_email}</em>
                                            }
                                        </div>
                                    </div>
                                    <div className="form_input">
                                        <h5>비밀번호 <i>*</i></h5>
                                        <div className="input_wrap">
                                            <InputBox
                                                className="input_box pwd_input"
                                                type={passView ? "text" : "password"} 
                                                placeholder="영문자, 숫자를 조합하여 12자 이내로 입력" 
                                                inputClassName={errors.m_password ? "wrong_input" : ""}
                                                value={values.m_password} 
                                                name="m_password" 
                                                id="m_password"
                                                onChangeHandler={handleChange}
                                                password={true}
                                                passwordBtnClickHandler={()=>setPassView(!passView)}
                                                countMax={12}
                                            />
                                            {errors.m_password && <em className="txt_err">{errors.m_password}</em>}
                                        </div>
                                    </div>
                                    <div className="form_input">
                                        <h5>비밀번호 확인 <i>*</i></h5>
                                        <div className="input_wrap">
                                            <InputBox
                                                className="input_box pwd_input"
                                                type={passView2 ? "text" : "password"} 
                                                placeholder="비밀번호 재입력" 
                                                inputClassName={errors.m_password2 ? "wrong_input" : ""}
                                                value={values.m_password2} 
                                                name="m_password2" 
                                                id="m_password2"
                                                onChangeHandler={handleChange}
                                                password={true}
                                                passwordBtnClickHandler={()=>setPassView2(!passView2)}
                                                countMax={12}
                                            />
                                            {errors.m_password2 && <em className="txt_err">{errors.m_password2}</em>}
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
                                                        inputClassName={error.phone ? "wrong_input" : ""}
                                                        value={phone}
                                                        onChangeHandler={(e)=>{
                                                            const val = e.currentTarget.value;
                                                            setPhone(val);
                                                            
                                                            const num = val.replace(/[^0-9]/g, '').length;
                                                            if(num > 10){
                                                                setPhoneAuth(true);
                                                            }else{
                                                                setPhoneAuth(false);
                                                            }
                                                        }} 
                                                        phone={true}
                                                    />
                                                    <button type="button" 
                                                        className={`btn_sign${phoneAuth && !authBox ? ' on' : ''}`}
                                                        disabled={phoneAuth && !authBox ? false : true}
                                                        onClick={onPhoneAuthHandler}
                                                    >인증번호 전송</button>
                                                </div>
                                                {error.phone && <em className="txt_err">휴대폰번호를 인증해주세요.</em>}
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
                                        <button type="button" className="btn_type25 w_100" onClick={()=>onSignupBtnClickHandler(values)}>회원가입</button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default SignUp;