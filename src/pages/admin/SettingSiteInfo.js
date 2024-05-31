import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { enum_api_uri } from "../../config/enum";
import * as CF from "../../config/function";
import { confirmPop } from "../../store/popupSlice";
import { siteInfo, siteInfoEdit } from "../../store/commonSlice";
import InputBox from "../../components/component/InputBox";
import ConfirmPop from "../../components/popup/ConfirmPop";


const SettingSiteInfo = () => {
    const site_info = enum_api_uri.site_info;
    const site_info_modify = enum_api_uri.site_info_modify;
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const [cancelConfirm, setCancelConfirm] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [info, setInfo] = useState({});
    const [error, setError] = useState({});
    const [langTabList, setLangTabList] = useState([]);
    const [langTabOn, setLangTabOn] = useState(0);


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
            setCancelConfirm(false);
        }
    },[popup.confirmPop]);


    //사이트정보 가져오기
    const getInfo = (lang) => {
        axios.get(`${site_info.replace(":site_id",user.siteId).replace(":c_lang",lang)}`,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                let data = res.data.data;
                    data.site_id = user.siteId;
                setInfo(data);

                //사이트언어 리스트
                const langList = data.c_site_lang;
                setLangTabList(langList);
            }
        })
        .catch((error) => {
            const err_msg = CF.errorMsgHandler(error);
            if(error.response.status === 401){//토큰에러시 관리자단 로그인페이지로 이동
                navigate("/console/login");
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

    
    //언어탭변경시 사이트정보 가져오기
    useEffect(()=>{
        let lang = 'KR';
        if(langTabList.length > 1){
            lang = langTabList[langTabOn].site_lang;
        }
        getInfo(lang);
    },[langTabOn]);


    //인풋값 변경시
    const onInputChangeHandler = (e) => {
        const id = e.currentTarget.id;
        const val = e.currentTarget.value;

        let newInfo = {...info};
            newInfo[id] = val;
            
        setInfo(newInfo);

        if(id == "c_site_name" && val.length > 0){
            let newError = {...error};
                newError.c_site_name = false;
            setError(newError);
        }
        if(id == "c_b_title" && val.length > 0){
            let newError = {...error};
                newError.c_b_title = false;
            setError(newError);
        }
    };


    //저장버튼 클릭시
    const saveBtnClickHandler = () => {
        let newError = { ...error };

        if (!info.c_site_name) {
            newError.c_site_name = true;
        }
        if (!info.c_b_title) {
            newError.c_b_title = true;
        }

        setError(newError);

        if (!newError.c_site_name && !newError.c_b_title) {
            saveHandler();
        }
    };


    //사이트정보 저장하기
    const saveHandler = () => {
        const langList = langTabList.map(item => item.site_lang);
        const lang = langTabList[langTabOn].site_lang;
        const body = info;
        body.site_lang = langList;
        body.c_lang = lang;
        delete body.c_site_lang;

        axios.put(`${site_info_modify}`, body, 
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                dispatch(siteInfo(body));
                dispatch(siteInfoEdit(true));

                setLangTabOn(0);

                dispatch(confirmPop({
                    confirmPop:true,
                    confirmPopTit:'알림',
                    confirmPopTxt:'사이트정보가 저장되었습니다.',
                    confirmPopBtn:1,
                }));
                setConfirm(true);
            }
        })
        .catch((error) => {
            const err_msg = CF.errorMsgHandler(error);
            if(error.response.status === 401){//토큰에러시 관리자단 로그인페이지로 이동
                navigate("/console/login");
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


    //취소버튼 클릭시
    const cancelBtnClickHandler = () => {
        dispatch(confirmPop({
            confirmPop:true,
            confirmPopTit:'알림',
            confirmPopTxt:'작성 중인 내용을 취소하시겠습니까?',
            confirmPopBtn:2,
        }));
        setCancelConfirm(true);
    };
    

    //취소하기 사이트정보 다시 가져오기
    const cancelHandler = () => {
        getInfo();
        setLangTabOn(0);
    };
    

    return(<>
        <div className="page_admin_setting">
            <ul className="tab_type1">
                {langTabList.length > 1 && langTabList.map((cont,i)=>
                    <li key={i} className={langTabOn === i ? 'on' : ''}>
                        <button type="button" onClick={()=>setLangTabOn(i)}>{cont.site_lang_hangul}</button>
                    </li>
                )}
            </ul>
            <div className="content_box">
                <div className="tit">
                    <h3>
                        <b>기본 정보</b>
                    </h3>
                    <p>입력된 정보는 웹사이트 하단과 개인정보취급방침 고지란에 기재됩니다.</p>
                </div>
                <div className="tbl_wrap2">
                    <table>
                        <caption>정보 테이블</caption>
                        <colgroup>
                            <col style={{width: "140px"}}/>
                            <col style={{width: "auto"}}/>
                            <col style={{width: "24px"}}/>
                            <col style={{width: "140px"}}/>
                            <col style={{width: "auto"}}/>
                        </colgroup>
                        <tbody>
                            <tr>
                                <th>사이트이름 <i>*</i></th>
                                <td>
                                    <InputBox
                                        className="input_box" 
                                        type={`text`}
                                        placeholder={`사이트이름을 입력해주세요.`}
                                        countShow={true}
                                        countMax={16}
                                        count={info.c_site_name ? info.c_site_name.length : 0}
                                        value={info.c_site_name || ""}
                                        onChangeHandler={onInputChangeHandler}
                                        id={`c_site_name`}
                                        inputClassName={error.c_site_name ? "wrong_input" : ""}
                                    />
                                    {error.c_site_name && <em className="txt_err">사이트이름을 입력해주세요.</em>}
                                </td>
                                <td></td>
                                {/* <th>웹 브라우저 타이틀</th>
                                <td>
                                    <InputBox
                                        className="input_box" 
                                        type={`text`}
                                        placeholder={`웹 브라우저 타이틀을 입력해주세요.`}
                                        countShow={true}
                                        countMax={16}
                                        count={info.c_web_title ? info.c_web_title.length : 0}
                                        value={info.c_web_title || ""}
                                        onChangeHandler={onInputChangeHandler}
                                        id={`c_web_title`}
                                    />
                                </td> */}
                            </tr>
                            <tr>
                                <th>대표자</th>
                                <td>
                                    <InputBox
                                        className="input_box" 
                                        type={`text`}
                                        placeholder={`대표자를 입력해주세요.`}
                                        value={info.c_ceo || ""}
                                        onChangeHandler={onInputChangeHandler}
                                        id={`c_ceo`}
                                    />
                                </td>
                                <td></td>
                                <th>대표전화</th>
                                <td>
                                    <InputBox
                                        className="input_box" 
                                        type={`text`}
                                        placeholder={`대표전화를 입력해주세요.`}
                                        value={info.c_tel || ""}
                                        onChangeHandler={onInputChangeHandler}
                                        id={`c_tel`}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th>사업자번호</th>
                                <td>
                                    <InputBox
                                        className="input_box" 
                                        type={`text`}
                                        placeholder={`사업자번호를 입력해주세요.`}
                                        value={info.c_num || ""}
                                        onChangeHandler={onInputChangeHandler}
                                        id={`c_num`}
                                    />
                                </td>
                                <td></td>
                                <th>통신판매번호</th>
                                <td>
                                    <InputBox
                                        className="input_box" 
                                        type={`text`}
                                        placeholder={`통신판매번호를 입력해주세요.`}
                                        value={info.c_num2 || ""}
                                        onChangeHandler={onInputChangeHandler}
                                        id={`c_num2`}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th>이메일</th>
                                <td>
                                    <InputBox
                                        className="input_box" 
                                        type={`text`}
                                        placeholder={`이메일을 입력해주세요.`}
                                        value={info.c_email || ""}
                                        onChangeHandler={onInputChangeHandler}
                                        id={`c_email`}
                                    />
                                </td>
                                <td></td>
                                <th>주소</th>
                                <td>
                                    <InputBox
                                        className="input_box" 
                                        type={`text`}
                                        placeholder={`주소를 입력해주세요.`}
                                        value={info.c_address || ""}
                                        onChangeHandler={onInputChangeHandler}
                                        id={`c_address`}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th>FAX 번호</th>
                                <td>
                                    <InputBox
                                        className="input_box" 
                                        type={`text`}
                                        placeholder={`FAX 번호를 입력해주세요.`}
                                        value={info.c_fax || ""}
                                        onChangeHandler={onInputChangeHandler}
                                        id={`c_fax`}
                                    />
                                </td>
                                <td></td>
                                <th>개인정보관리책임자</th>
                                <td>
                                    <InputBox
                                        className="input_box" 
                                        type={`text`}
                                        placeholder={`개인정보관리책임자를 입력해주세요.`}
                                        value={info.c_manager || ""}
                                        onChangeHandler={onInputChangeHandler}
                                        id={`c_manager`}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="content_box">
                <div className="tit">
                    <h3>
                        <b>메타정보</b>
                    </h3>
                    <p>웹마스터 도구에 활용되어 포털 검색 시 노출되는 정보입니다.</p>
                </div>
                <div className="tbl_wrap2">
                    <table>
                        <caption>정보 테이블</caption>
                        <colgroup>
                            <col style={{width: "140px"}}/>
                            <col style={{width: "auto"}}/>
                            <col style={{width: "24px"}}/>
                            <col style={{width: "140px"}}/>
                            <col style={{width: "auto"}}/>
                        </colgroup>
                        <tbody>
                            <tr>
                                <th>브라우저 타이틀 <i>*</i></th>
                                <td>
                                    <InputBox
                                        className="input_box" 
                                        type={`text`}
                                        placeholder={`브라우저 타이틀을 입력해주세요.`}
                                        value={info.c_b_title || ""}
                                        onChangeHandler={onInputChangeHandler}
                                        id={`c_b_title`}
                                        inputClassName={error.c_b_title ? "wrong_input" : ""}
                                    />
                                    {error.c_b_title && <em className="txt_err">브라우저 타이틀을 입력해주세요.</em>}
                                </td>
                                <td></td>
                                <th>메타설명</th>
                                <td>
                                    <InputBox
                                        className="input_box" 
                                        type={`text`}
                                        placeholder={`메타설명을 입력해주세요.`}
                                        value={info.c_meta || ""}
                                        onChangeHandler={onInputChangeHandler}
                                        id={`c_meta`}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th>메타 태그</th>
                                <td>
                                    <InputBox
                                        className="input_box" 
                                        type={`text`}
                                        placeholder={`메타 태그를 입력해주세요.`}
                                        value={info.c_meta_tag || ""}
                                        onChangeHandler={onInputChangeHandler}
                                        id={`c_meta_tag`}
                                    />
                                </td>
                                <td></td>
                                {/* <th>메타 분류</th>
                                <td>
                                    <InputBox
                                        className="input_box" 
                                        type={`text`}
                                        placeholder={`메타 분류를 입력해주세요.`}
                                        value={info.c_meta_type || ""}
                                        onChangeHandler={onInputChangeHandler}
                                        id={`c_meta_type`}
                                    />
                                </td> */}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="form_btn_wrap">
                <button type="button" className="btn_type3" onClick={cancelBtnClickHandler}>취소</button>
                <button type="button" className="btn_type4" onClick={saveBtnClickHandler}>저장</button>
            </div>
        </div>

        {/* 취소 confirm팝업 */}
        {cancelConfirm && <ConfirmPop onClickHandler={cancelHandler} />}

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default SettingSiteInfo;