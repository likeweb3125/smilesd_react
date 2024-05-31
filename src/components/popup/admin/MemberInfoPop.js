import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as CF from "../../../config/function";
import { enum_api_uri } from "../../../config/enum";
import { adminMemberInfoPop, confirmPop, adminMemberInfoPopModify } from "../../../store/popupSlice";
import ConfirmPop from "../ConfirmPop";
import InputBox from "../../component/InputBox";
import TxtSelectBox from "../../component/admin/TxtSelectBox";


const MemberInfoPop = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const common = useSelector((state)=>state.common);
    const member_info = enum_api_uri.member_info;
    const member_modify = enum_api_uri.member_modify;
    const [confirm, setConfirm] = useState(false);
    const [closeConfirm, setCloseConfirm] = useState(false);
    const [saveOkConfirm, setSaveOkConfirm] = useState(false);
    const [info, setInfo] = useState({});
    const [error, setError] = useState({});
    const [levelList, setLevelList] = useState([]);
    const [levelSelect, setLevelSelect] = useState('');
    const [level, setLevel] = useState(null);
    const [menuAuthCheck, setMenuAuthCheck] = useState([]);


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
        dispatch(adminMemberInfoPop({adminMemberInfoPop:false,adminMemberInfoPopIdx:null}));
        dispatch(adminMemberInfoPopModify(false));
    };


    //회원등급리스트 가져오기
    useEffect(()=>{
        const list = common.userLevelList;

        setLevelList(list);
    },[common.userLevelList]);


    //사용자정보 가져오기
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


    //맨처음 사용자정보 가져오기
    useEffect(()=>{
        getInfoData();
    },[]);


    //회원등급리스트 값 있으면 회원등급 셀렉트에 txt 값 넣기
    useEffect(()=>{
        if(levelList.length > 0 && Object.keys(info).length > 0){
            const level = levelList.find(item=>item.l_level === info.m_level);
            setLevelSelect(level.l_name);
        }
    },[levelList, info]);


    useEffect(()=>{
        if(Object.keys(info).length > 0){
            setInfo(info);
            setLevel(info.m_level);

            if(info.m_menu_auth !== null && info.m_menu_auth[0] !== null){
                const authArray = info.m_menu_auth.map((item) => item[0]);
                setMenuAuthCheck(authArray);
            }
        }
    },[info]);


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


    //체크박스, 라디오 값 변경시
    const onCheckChangeHandler = (checked, name, val) => {
        let newData = {...info};

        if(checked){
            newData[name] = val;
        }else{
            newData[name] = "";
        }
        
        setInfo(newData);
    };


    //셀렉트값 변경시
    const onSelectChangeHandler = (name, val) => {
        let newData = {...info};
        const numericValue = parseInt(val, 10); // 문자열을 숫자로 변환

        if (!isNaN(numericValue)) { // 숫자로 변환 가능한 경우
            newData[name] = numericValue;
        }else{
            newData[name] = val;
        }
    
        setInfo(newData);
    };


    //관리자일때 관리자권한 체크박스 체크시
    const onMenuAuthCheckHandler = (checked, val) => {
        const newCheck = [...menuAuthCheck];
        if(checked){
            newCheck.push(val);
        }else{
            newCheck.pop(val);
        }
        setMenuAuthCheck(newCheck);
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
        let menu_auth;
        //관리자일때
        if(info.m_level == 9){
            menu_auth = menuAuthCheck.join();
        }
        else{
            menu_auth = null;
        }

        const body = {
            m_email:info.m_email,
            m_name:info.m_name,
            m_mobile:info.m_mobile,
            m_level:info.m_level,
            m_sms_yn:info.m_sms_yn,
            m_mail_yn:info.m_mail_yn,
            m_memo:info.m_memo,
            m_menu_auth:menu_auth,
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
        dispatch(adminMemberInfoPopModify(true));
    };



    return(<>
        <div className="pop_display pop_user_info">
            <div className="dimm"></div>
            <div className="popup_wrap">
                <div className="popup">
                    <div className="pop_tit">
                        <h3>사용자 정보</h3>
                        <div className="tit_txt">
                            <em>{info.m_level == 9 ? '관리자' : '회원'}</em>
                            <p>※ 정보수정 시 저장 버튼을 눌러 변경된 정보를 꼭 저장해 주세요.</p>
                        </div>
                    </div>
                    <div className="pop_con">
                        <div className="con_box">
                            <div className="form_pop_inner">
                                <div className="form_inner">
                                    <div className="form_box">
                                        <div className="form_input">
                                            <h6>이메일 <em>가입날짜: {info.reg_date || ""}</em></h6>
                                            <div className="input_wrap">
                                                <InputBox
                                                    className="input_box" 
                                                    type={`text`}
                                                    value={info.m_email || ""}
                                                    disabled={true}
                                                />
                                            </div>
                                        </div>
                                        <div className="form_input">
                                            <h6>회원등급</h6>
                                            <div className="input_wrap">
                                                <TxtSelectBox 
                                                    className="select_type2"
                                                    list={levelList}
                                                    selected={levelSelect || ""}
                                                    selectedLevel={level}
                                                    onChangeHandler={(e)=>{
                                                        const val = e.currentTarget.value;
                                                        const level = e.target.options[e.target.selectedIndex].getAttribute("data-level");
                                                        setLevelSelect(val);
                                                        setLevel(level);
                                                        onSelectChangeHandler("m_level",level);
                                                    }}
                                                    selHidden={true}
                                                    objectSel={`level_list`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form_box">
                                        <div className="form_input">
                                            <h6>이름</h6>
                                            <div className="input_wrap">
                                                <InputBox
                                                    className="input_box" 
                                                    type={`text`}
                                                    placeholder={`이름을 입력해주세요.`}
                                                    value={info.m_name || ""}
                                                    onChangeHandler={onInputChangeHandler}
                                                    id={`m_name`}
                                                    inputClassName={error.m_name ? "wrong_input" : ""}
                                                />
                                                {error.m_name && <em className="txt_err">이름을 입력해주세요.</em>}
                                            </div>
                                        </div>
                                        <div className="form_input">
                                            <h6>휴대폰번호</h6>
                                            <div className="input_wrap">
                                                <InputBox
                                                    className="input_box" 
                                                    type={`text`}
                                                    placeholder={`이름을 입력해주세요.`}
                                                    value={info.m_mobile || ""}
                                                    onChangeHandler={onInputChangeHandler}
                                                    id={`m_mobile`}
                                                    inputClassName={error.m_mobile ? "wrong_input" : ""}
                                                    phone={true}
                                                />
                                                {error.m_mobile && <em className="txt_err">휴대폰번호를 입력해주세요.</em>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>                            
                        </div>
                        <div className="con_box">
                            <div className="form_pop_inner">
                                <div className="form_inner">
                                    {info.m_level == 9 ? //관리자일때 노출
                                        <div className="form_box form_box2">
                                            <div className="form_input">
                                                <h6>관리자 권한</h6>
                                                <div className="input_wrap">
                                                    <div className="chk_rdo_wrap chk_rdo_wrap3">
                                                        <div className="chk_box1">
                                                            <input type="checkbox" id="check_auth1" className="blind" 
                                                                onChange={(e)=>{
                                                                    const checked = e.currentTarget.checked;
                                                                    onMenuAuthCheckHandler(checked,'1');
                                                                }}
                                                                checked={menuAuthCheck.includes('1') ? true : false}
                                                            />
                                                            <label htmlFor="check_auth1">사용자 관리</label>
                                                        </div>
                                                        <div className="chk_box1">
                                                            <input type="checkbox" id="check_auth2" className="blind" 
                                                                onChange={(e)=>{
                                                                    const checked = e.currentTarget.checked;
                                                                    onMenuAuthCheckHandler(checked,'2');
                                                                }}
                                                                checked={menuAuthCheck.includes('2') ? true : false}
                                                            />
                                                            <label htmlFor="check_auth2">메시징 관리</label>
                                                        </div>
                                                        <div className="chk_box1">
                                                            <input type="checkbox" id="check_auth3" className="blind" 
                                                                onChange={(e)=>{
                                                                    const checked = e.currentTarget.checked;
                                                                    onMenuAuthCheckHandler(checked,'3');
                                                                }}
                                                                checked={menuAuthCheck.includes('3') ? true : false}
                                                            />
                                                            <label htmlFor="check_auth3">카테고리 관리</label>
                                                        </div>
                                                        <div className="chk_box1">
                                                            <input type="checkbox" id="check_auth4" className="blind" 
                                                                onChange={(e)=>{
                                                                    const checked = e.currentTarget.checked;
                                                                    onMenuAuthCheckHandler(checked,'4');
                                                                }}
                                                                checked={menuAuthCheck.includes('4') ? true : false}
                                                            />
                                                            <label htmlFor="check_auth4">카테고리 운영</label>
                                                        </div>
                                                        <div className="chk_box1">
                                                            <input type="checkbox" id="check_auth5" className="blind" 
                                                                onChange={(e)=>{
                                                                    const checked = e.currentTarget.checked;
                                                                    onMenuAuthCheckHandler(checked,'5');
                                                                }}
                                                                checked={menuAuthCheck.includes('5') ? true : false}
                                                            />
                                                            <label htmlFor="check_auth5">통계 관리</label>
                                                        </div>
                                                        <div className="chk_box1">
                                                            <input type="checkbox" id="check_auth6" className="blind" 
                                                                onChange={(e)=>{
                                                                    const checked = e.currentTarget.checked;
                                                                    onMenuAuthCheckHandler(checked,'6');
                                                                }}
                                                                checked={menuAuthCheck.includes('6') ? true : false}
                                                            />
                                                            <label htmlFor="check_auth6">시스템 환경</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        : //관리자아닐때 노출
                                        <div className="form_box">
                                            <div className="form_input">
                                                <h6>문자수신</h6>
                                                <div className="input_wrap">
                                                    <div className="chk_rdo_wrap">
                                                        <div className="rdo_box1">
                                                            <input type="radio" id="check_sms1" className="blind"
                                                                onChange={(e)=>{
                                                                    const checked = e.currentTarget.checked;
                                                                    onCheckChangeHandler(checked,"m_sms_yn",'Y');
                                                                }}
                                                                checked={info.m_sms_yn && info.m_sms_yn == 'Y' ? true : false}
                                                                name="check_sms"
                                                            />
                                                            <label htmlFor="check_sms1">수신</label>
                                                        </div>
                                                        <div className="rdo_box1">
                                                            <input type="radio" id="check_sms2" className="blind"
                                                                onChange={(e)=>{
                                                                    const checked = e.currentTarget.checked;
                                                                    onCheckChangeHandler(checked,"m_sms_yn",'N');
                                                                }}
                                                                checked={info.m_sms_yn && info.m_sms_yn == 'N' ? true : false}
                                                                name="check_sms"
                                                            />
                                                            <label htmlFor="check_sms2">거부</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form_input">
                                                <h6>메일 수신</h6>
                                                <div className="input_wrap">
                                                    <div className="chk_rdo_wrap">
                                                        <div className="rdo_box1">
                                                            <input type="radio" id="check_mail1" className="blind"
                                                                onChange={(e)=>{
                                                                    const checked = e.currentTarget.checked;
                                                                    onCheckChangeHandler(checked,"m_mail_yn",'Y');
                                                                }}
                                                                checked={info.m_mail_yn && info.m_mail_yn == 'Y' ? true : false}
                                                                name="check_mail"
                                                            />
                                                            <label htmlFor="check_mail1">수신</label>
                                                        </div>
                                                        <div className="rdo_box1">
                                                            <input type="radio" id="check_mail2" className="blind"
                                                                onChange={(e)=>{
                                                                    const checked = e.currentTarget.checked;
                                                                    onCheckChangeHandler(checked,"m_mail_yn",'N');
                                                                }}
                                                                checked={info.m_mail_yn && info.m_mail_yn == 'N' ? true : false}
                                                                name="check_mail"
                                                            />
                                                            <label htmlFor="check_mail2">거부</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    <div className="form_box form_box2">
                                        <div className="form_input">
                                            <h6>메모 <b>회원 메모는 관리자만 확인할 수 있습니다.</b></h6>
                                            <div className="input_wrap">
                                                <InputBox
                                                    className="input_box" 
                                                    type={`text`}
                                                    placeholder={`메모를 입력해주세요.`}
                                                    value={info.m_memo || ""}
                                                    onChangeHandler={onInputChangeHandler}
                                                    id={`m_memo`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>                            
                        </div>
                        <div className="pop_btn_wrap">
                            <button type="button" className="btn_left">회원 탈퇴</button>
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

export default MemberInfoPop;