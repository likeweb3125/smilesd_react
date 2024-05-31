import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as CF from "../../../config/function";
import { enum_api_uri } from "../../../config/enum";
import { adminPopupPop, confirmPop, adminPopupPopModify, adminPopupPopWrite } from "../../../store/popupSlice";
import ConfirmPop from "../../popup/ConfirmPop";
import InputBox from "../../component/InputBox";
import InputBox2 from "../../component/admin/InputBox2";
import InputDatepicker from "../../component/admin/InputDatepicker";
import Editor from "../../component/Editor";
import moment from "moment";


const PopupPop = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const common = useSelector((state)=>state.common);
    const popup_detail = enum_api_uri.popup_detail;
    const popup_list = enum_api_uri.popup_list;
    const [confirm, setConfirm] = useState(false);
    const [closeConfirm, setCloseConfirm] = useState(false);
    const [saveOkConfirm, setSaveOkConfirm] = useState(false);
    const [deltConfirm, setDeltConfirm] = useState(false);
    const [info, setInfo] = useState({});
    const [error, setError] = useState({});
    const [content, setContent] = useState("");
    const [useBtn, setUseBtn] = useState("N");
    const [showRaw, setShowRaw] = useState(false);
    const [rawHtml, setRawHtml] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [scrollCheck, setScrollCheck] = useState("Y");
    const [linkCheck, setLinkCheck] = useState("1");


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
            setCloseConfirm(false);
            setSaveOkConfirm(false);
            setDeltConfirm(false);
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
        dispatch(adminPopupPop({adminPopupPop:false,adminPopupPopIdx:null,adminPopupPopType:null,adminPopupPopLang:''}));
        dispatch(adminPopupPopWrite(false));
    };

    useEffect(()=>{
        console.log(popup.adminPopupPopLang);
    },[popup.adminPopupPopLang]);


    //상세정보 가져오기
    const getPopupData = () => {
        axios.get(`${popup_detail.replace(":idx",popup.adminPopupPopIdx)}`,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                let data = res.data.data;
                setInfo(data);

                setScrollCheck(data.p_scroll[0]);
                setLinkCheck(data.p_link_target[0]);
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


    //맨처음 
    useEffect(()=>{
        //팝업수정일때 상세정보 가져오기
        if(!popup.adminPopupPopWrite){
            getPopupData();
        }
        //팝업등록일때
        else{
            setScrollCheck("Y");
            setLinkCheck("1");
        }
    },[]);


    useEffect(()=>{
        if(Object.keys(info).length > 0){
            setInfo(info);
            
            if(info.p_open){
                setUseBtn(info.p_open[0]);
            }
            if(info.p_s_date){
                let dateString = info.p_s_date;
                let dateParts = dateString.split('.');
                let year = parseInt(dateParts[0]);
                let month = parseInt(dateParts[1]) - 1; // 월은 0부터 시작하므로 1을 빼줍니다.
                let day = parseInt(dateParts[2]);

                let date = new Date(year, month, day);
                setStartDate(date);
            }
            if(info.p_e_date){
                let dateString = info.p_e_date;
                let dateParts = dateString.split('.');
                let year = parseInt(dateParts[0]);
                let month = parseInt(dateParts[1]) - 1; // 월은 0부터 시작하므로 1을 빼줍니다.
                let day = parseInt(dateParts[2]);

                let date = new Date(year, month, day);
                setEndDate(date);
            }
            setContent(info.p_content);

            if(info.p_width_size && info.p_height_size){
                if(info.p_width_size.length > 0 && info.p_height_size.length > 0){
                    let newError = {...error};
                    newError.p_size = false;
                    setError(newError);
                }
            }
            if(info.p_left_point && info.p_top_point){
                if(info.p_left_point.length > 0 && info.p_top_point.length > 0){
                    let newError = {...error};
                    newError.p_point = false;
                    setError(newError);
                }
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

        if(id == "p_title" && val.length > 0){
            let newError = {...error};
                newError.p_title = false;
            setError(newError);
        }
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

        if(name == "p_one_day" && val.length > 0){
            let newError = {...error};
                newError.p_one_day = false;
            setError(newError);
        }
        if(name == "p_layer_pop" && val.length > 0){
            let newError = {...error};
                newError.p_layer_pop = false;
            setError(newError);
        }
    };


    //에디터내용 값
    const onEditorChangeHandler = (e) => {
        setContent(e);
        
        //html 내용 에러문구 false
        if(e){
            let newError = { ...error };
            newError.p_content = false;
            setError(newError);
        }
    };


    //에디터 HTML 버튼클릭시 textarea 보이기
    const handleClickShowRaw = () => {
        setShowRaw(!showRaw);
    };


    //에디터 HTML 버튼 토글
    useEffect(()=>{
        if (showRaw) {
            setRawHtml(content);
        }else {
            setContent(rawHtml);
        }
    },[showRaw]);


    //저장버튼 클릭시
    const saveBtnClickHandler = () => {
        let newError = { ...error };

        if (!info.p_title) {
            newError.p_title = true;
        }
        if (!info.p_one_day) {
            newError.p_one_day = true;
        }
        if (!info.p_layer_pop) {
            newError.p_layer_pop = true;
        }
        if (!info.p_width_size || !info.p_height_size) {
            newError.p_size = true;
        }
        if(popup.adminPopupPopType == "P"){
            if (!info.p_left_point || !info.p_top_point) {
                newError.p_point = true;
            }
        }
        setError(newError);

        //내용 html로 입력시 값 체크
        let cont;
        if(showRaw){
            cont = rawHtml;
        }else{
            cont = content.replace(/<p><br><\/p>/g, "");
        }
        if(!cont){
            newError.p_content = true;
        }

        if (!newError.p_title && !newError.p_one_day && !newError.p_layer_pop && !newError.p_size && !newError.p_point && cont) {
            saveHandler();
        }
    };


    //저장하기
    const saveHandler = () => {
        //새로 작성일때
        if(popup.adminPopupPopWrite){
            let sDate = "";
            if(startDate){
                sDate = moment(startDate).format("YYYY.MM.DD");
            }
            let eDate = "";
            if(endDate){
                eDate = moment(endDate).format("YYYY.MM.DD");
            }
            let cont;
            if(showRaw){
                cont = rawHtml;
            }else{
                cont = content;
            }
            const body = {
                p_type:popup.adminPopupPopType,
                p_open:useBtn,
                p_title:info.p_title,
                p_s_date:sDate,
                p_e_date:eDate,
                p_one_day:info.p_one_day,
                p_layer_pop:info.p_layer_pop,
                p_width_size:info.p_width_size,
                p_height_size:info.p_height_size,
                p_left_point:info.p_left_point,
                p_top_point:info.p_top_point,
                p_scroll:scrollCheck,
                p_link_target:linkCheck,
                p_link_url:info.p_link_url,
                p_content:cont,
                p_lang:popup.adminPopupPopLang
            };
            axios.post(`${popup_list}`, body, 
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
        }
        //수정일때
        else{
            let sDate = "";
            if(startDate){
                sDate = moment(startDate).format("YYYY.MM.DD");
            }
            let eDate = "";
            if(endDate){
                eDate = moment(endDate).format("YYYY.MM.DD");
            }

            let day = info.p_one_day;
            if(Array.isArray(day)){
                day = day[0];
            }

            let layer = info.p_layer_pop;
            if(Array.isArray(layer)){
                layer = layer[0];
            }

            let cont;
            if(showRaw){
                cont = rawHtml;
            }else{
                cont = content;
            }

            const body = {
                idx:popup.adminPopupPopIdx,
                p_type:popup.adminPopupPopType,
                p_open:useBtn,
                p_title:info.p_title,
                p_s_date:sDate,
                p_e_date:eDate,
                p_one_day:day,
                p_layer_pop:layer,
                p_width_size:info.p_width_size,
                p_height_size:info.p_height_size,
                p_left_point:info.p_left_point,
                p_top_point:info.p_top_point,
                p_scroll:scrollCheck,
                p_link_target:linkCheck,
                p_link_url:info.p_link_url,
                p_content:cont,
            };
            axios.put(`${popup_list}`, body, 
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
        }
    };

    
    //저장완료
    const saveOkHandler = () => {
        closePopHandler();
        dispatch(adminPopupPopModify(true));
    };


    //삭제버튼 클릭시
    const deltBtnClickHandler = () => {
        dispatch(confirmPop({
            confirmPop:true,
            confirmPopTit:'알림',
            confirmPopTxt:'해당 팝업을 삭제하시겠습니까?',
            confirmPopBtn:2,
        }));
        setDeltConfirm(true);
    };



    // 팝업삭제하기
    const deltHandler = () => {
        const body = {
            idx: popup.adminPopupPopIdx,
        };
        axios.delete(popup_list,
            {
                data: body,
                headers: {Authorization: `Bearer ${user.loginUser.accessToken}`}
            }
        )
        .then((res)=>{
            if(res.status === 200){
                closePopHandler();
                dispatch(adminPopupPopModify(true));
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




    return(<>
        <div className="pop_display pop_reg_pop">
            <div className="dimm"></div>
            <div className="popup_wrap">
                <div className="popup">
                    <div className="pop_tit">
                        <h3>{popup.adminPopupPopType == "P" ? "PC" : popup.adminPopupPopType == "M" && "Mobile"} 팝업 등록</h3>
                        <div className="btn_switch">
                            <input type="checkbox" className="blind" id="switch" 
                                onChange={(e)=>{
                                    const checked = e.currentTarget.checked;
                                    if(checked){
                                        setUseBtn("Y");
                                    }else{
                                        setUseBtn("N");
                                    }
                                }}
                                checked={useBtn == "Y" ? true : false} 
                            />
                            <label htmlFor="switch">노출토글</label>
                            <span>노출</span>
                        </div>
                    </div>
                    <div className="pop_con">
                        <div className="con_box">
                            <div className="form_pop_inner">
                                <div className="form_inner">
                                    <div className="form_box">
                                        <div className="form_input">
                                            <h6>제목 <i>*</i></h6>
                                            <div className="input_wrap">
                                                <InputBox
                                                    className="input_box" 
                                                    type={`text`}
                                                    placeholder={`팝업 제목을 입력해주세요.`}
                                                    value={info.p_title || ""}
                                                    onChangeHandler={onInputChangeHandler}
                                                    id={`p_title`}
                                                    inputClassName={error.p_title ? "wrong_input" : ""}
                                                />
                                                {error.p_title && <em className="txt_err">팝업 제목을 입력해주세요.</em>}
                                            </div>
                                        </div>
                                        <div className="form_input">
                                            <h6>기간</h6>
                                            <div className="input_wrap">
                                                <div className="search_date">
                                                    <InputDatepicker 
                                                        selectedDate={startDate} 
                                                        ChangeHandler={(date)=>setStartDate(date)} 
                                                        txt={`시작일`}
                                                    />
                                                    <em>~</em>
                                                    <InputDatepicker 
                                                        selectedDate={endDate} 
                                                        ChangeHandler={(date)=>setEndDate(date)} 
                                                        txt={`종료일`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form_box">
                                        <div className="form_input">
                                            <h6>팝업창 1일 유효 여부 <i>*</i></h6>
                                            <div className="input_wrap">
                                                <div className="chk_rdo_wrap">
                                                    <div className="rdo_box1">
                                                        <input type="radio" id="check_day1" className="blind"
                                                            onChange={(e)=>{
                                                                const checked = e.currentTarget.checked;
                                                                onCheckChangeHandler(checked,"p_one_day","Y");
                                                            }}
                                                            checked={info.p_one_day && info.p_one_day[0] == "Y" ? true : false}
                                                            name="check_day"
                                                        />
                                                        <label htmlFor="check_day1">사용</label>
                                                    </div>
                                                    <div className="rdo_box1">
                                                        <input type="radio" id="check_day2" className="blind"
                                                            onChange={(e)=>{
                                                                const checked = e.currentTarget.checked;
                                                                onCheckChangeHandler(checked,"p_one_day","N");
                                                            }}
                                                            checked={info.p_one_day && info.p_one_day[0] == "N" ? true : false}
                                                            name="check_day"
                                                        />
                                                        <label htmlFor="check_day2">사용 안 함</label>
                                                    </div>
                                                </div>
                                                {error.p_one_day && <em className="txt_err">팝업창 1일 유효 여부를 선택해주세요.</em>}
                                            </div>
                                        </div>
                                        <div className="form_input">
                                            <h6>팝업/레이어 선택 <i>*</i></h6>
                                            <div className="input_wrap">
                                                <div className="chk_rdo_wrap">
                                                    <div className="rdo_box1">
                                                        <input type="radio" id="check_layer1" className="blind"
                                                            onChange={(e)=>{
                                                                const checked = e.currentTarget.checked;
                                                                onCheckChangeHandler(checked,"p_layer_pop","1");
                                                            }}
                                                            checked={info.p_layer_pop && info.p_layer_pop[0] == "1" ? true : false}
                                                            name="check_layer"
                                                        />
                                                        <label htmlFor="check_layer1">레이어</label>
                                                    </div>
                                                    <div className="rdo_box1">
                                                        <input type="radio" id="check_layer2" className="blind"
                                                            onChange={(e)=>{
                                                                const checked = e.currentTarget.checked;
                                                                onCheckChangeHandler(checked,"p_layer_pop","2");
                                                            }}
                                                            checked={info.p_layer_pop && info.p_layer_pop[0] == "2" ? true : false}
                                                            name="check_layer"
                                                        />
                                                        <label htmlFor="check_layer2">팝업창</label>
                                                    </div>
                                                </div>
                                                {error.p_layer_pop && <em className="txt_err">팝업유형을 선택해주세요.</em>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form_box">
                                        <div className="form_input">
                                            <h6>팝업창 사이즈 <i>*</i><b>권장 : 300 * 400</b></h6>
                                            <div className="input_wrap input_wrap2">
                                                <InputBox2 
                                                    type={`text`}
                                                    value={info.p_width_size || ""}
                                                    onChangeHandler={onInputChangeHandler}
                                                    id={`p_width_size`}
                                                    numberOnly={true}
                                                    thousandSeparator={','}
                                                    decimalScale={0}
                                                    txt={`가로`}
                                                />
                                                <InputBox2 
                                                    type={`text`}
                                                    value={info.p_height_size || ""}
                                                    onChangeHandler={onInputChangeHandler}
                                                    id={`p_height_size`}
                                                    numberOnly={true}
                                                    thousandSeparator={','}
                                                    decimalScale={0}
                                                    txt={`세로`}
                                                />
                                            </div>
                                            {error.p_size && <em className="txt_err">팝업창 사이즈를 입력해주세요.</em>}
                                        </div>
                                        <div className="form_input">
                                            <h6>팝업창 위치 지정 {popup.adminPopupPopType == "P" && <><i>*</i><b>권장 : 550 * 250</b></>}</h6>
                                            {popup.adminPopupPopType == "P" ?
                                                <div className="input_wrap input_wrap2">
                                                    <InputBox2 
                                                        type={`text`}
                                                        value={info.p_left_point || ""}
                                                        onChangeHandler={onInputChangeHandler}
                                                        id={`p_left_point`}
                                                        numberOnly={true}
                                                        thousandSeparator={','}
                                                        decimalScale={0}
                                                        txt={`가로`}
                                                    />
                                                    <InputBox2 
                                                        type={`text`}
                                                        value={info.p_top_point || ""}
                                                        onChangeHandler={onInputChangeHandler}
                                                        id={`p_top_point`}
                                                        numberOnly={true}
                                                        thousandSeparator={','}
                                                        decimalScale={0}
                                                        txt={`세로`}
                                                    />
                                                </div>
                                                :   <div className="input_wrap">
                                                        <p>* 모바일의 경우 등록한 최신순을 가장 먼저 중앙 정렬되어 노출됩니다.</p>
                                                    </div>
                                            }
                                            {error.p_point && <em className="txt_err">팝업창 위치를 지정해주세요.</em>}
                                        </div>
                                    </div>
                                </div>
                            </div>                            
                        </div>
                        <div className="con_box">
                            <div className="form_pop_inner">
                                <div className="form_inner">
                                    <div className="form_box">
                                        <div className="form_input">
                                            <h6>스크롤</h6>
                                            <div className="input_wrap">
                                                <div className="chk_rdo_wrap">
                                                    <div className="rdo_box1">
                                                        <input type="radio" id="check_scroll1" className="blind"
                                                            onChange={(e)=>{
                                                                const checked = e.currentTarget.checked;
                                                                if(checked){
                                                                    setScrollCheck("Y");
                                                                }else{
                                                                    setScrollCheck("");
                                                                }
                                                            }}
                                                            checked={scrollCheck == "Y" ? true : false}
                                                            name="check_scroll"
                                                        />
                                                        <label htmlFor="check_scroll1">사용</label>
                                                    </div>
                                                    <div className="rdo_box1">
                                                        <input type="radio" id="check_scroll2" className="blind"
                                                            onChange={(e)=>{
                                                                const checked = e.currentTarget.checked;
                                                                if(checked){
                                                                    setScrollCheck("N");
                                                                }else{
                                                                    setScrollCheck("");
                                                                }
                                                            }}
                                                            checked={scrollCheck == "N" ? true : false}
                                                            name="check_scroll"
                                                        />
                                                        <label htmlFor="check_scroll2">사용 안 함</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form_input">
                                            <h6>링크 열림창</h6>
                                            <div className="input_wrap">
                                                <div className="chk_rdo_wrap">
                                                    <div className="rdo_box1">
                                                        <input type="radio" id="check_link1" className="blind"
                                                            onChange={(e)=>{
                                                                const checked = e.currentTarget.checked;
                                                                if(checked){
                                                                    setLinkCheck("1");
                                                                }else{
                                                                    setLinkCheck("");
                                                                }
                                                            }}
                                                            checked={linkCheck == "1" ? true : false}
                                                            name="check_link"
                                                        />
                                                        <label htmlFor="check_link1">부모창</label>
                                                    </div>
                                                    <div className="rdo_box1">
                                                        <input type="radio" id="check_link2" className="blind"
                                                            onChange={(e)=>{
                                                                const checked = e.currentTarget.checked;
                                                                if(checked){
                                                                    setLinkCheck("2");
                                                                }else{
                                                                    setLinkCheck("");
                                                                }
                                                            }}
                                                            checked={linkCheck == "2" ? true : false}
                                                            name="check_link"
                                                        />
                                                        <label htmlFor="check_link2">새창</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form_box">
                                        <div className="form_input">
                                        </div>
                                        <div className="form_input">
                                            <h6>링크</h6>
                                            <div className="input_wrap">
                                                <InputBox
                                                    className="input_box" 
                                                    type={`text`}
                                                    placeholder={`url 입력해주세요.`}
                                                    value={info.p_link_url || ""}
                                                    onChangeHandler={onInputChangeHandler}
                                                    id={`p_link_url`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form_box form_box2">
                                        <div className="form_input">
                                            <div className="edit_box">
                                                <Editor 
                                                    value={content}
                                                    onChangeHandler={onEditorChangeHandler}
                                                    onClickRaw={handleClickShowRaw}
                                                    btnHtmlOn={showRaw}
                                                />
                                                {showRaw ? 
                                                    <textarea
                                                        value={rawHtml}
                                                        onChange={(e) => {
                                                            const val = e.currentTarget.value;
                                                            setRawHtml(val);

                                                            //html 내용 에러문구 false
                                                            if(val.length > 0){
                                                                let newError = { ...error };
                                                                newError.p_content = false;
                                                                setError(newError);
                                                            }
                                                        }}
                                                        className="raw_editor"
                                                    />
                                                    : null  
                                                }
                                            </div>
                                        </div>
                                        {error.p_content && <em className="txt_err">내용을 입력해주세요.</em>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="pop_btn_wrap">
                            <button type="button" className="btn_left" onClick={deltBtnClickHandler}>팝업 삭제</button>
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

        {/* 삭제 confirm팝업 */}
        {deltConfirm && <ConfirmPop onClickHandler={deltHandler} />}

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default PopupPop;