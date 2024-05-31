import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useDropzone } from 'react-dropzone';
import axios from "axios";
import * as CF from "../../../config/function";
import { enum_api_uri } from "../../../config/enum";
import { adminSubCategoryPop, confirmPop , adminSubCategoryPopData, adminSubCategoryPopModify, adminSubCategoryPopParentData } from "../../../store/popupSlice";
import ConfirmPop from "../ConfirmPop";
import InputBox from "../../component/InputBox";
import SubCategoryPopCont1 from "../../component/admin/SubCategoryPopCont1";
import SubCategoryPopCont2 from "../../component/admin/SubCategoryPopCont2";
import SubCategoryPopCont3 from "../../component/admin/SubCategoryPopCont3";
import SubCategoryPopCont4 from "../../component/admin/SubCategoryPopCont4";
import SubCategoryPopCont5 from "../../component/admin/SubCategoryPopCont5";
import SubCategoryPopCont6 from "../../component/admin/SubCategoryPopCont6";
import SubCategoryPopCont7 from "../../component/admin/SubCategoryPopCont7";


const SubCategoryPop = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const menu_sub_detail = enum_api_uri.menu_sub_detail;
    const menu_sub = enum_api_uri.menu_sub;
    const [confirm, setConfirm] = useState(false);
    const [closeConfirm, setCloseConfirm] = useState(false);
    const [saveConfirm, setSaveConfirm] = useState(false);
    const [deltConfirm, setDeltConfirm] = useState(false);
    const [info, setInfo] = useState({});
    const [error, setError] = useState({});
    const [titImg, setTitImg] = useState(null);
    const [titImgData, setTitImgData] = useState(null);
    const [tabList, setTabList] = useState(["HTML","빈 메뉴","고객맞춤","일반 게시판","갤러리 게시판","FAQ","문의게시판"]);
    const [tab, setTab] = useState(1);
    const [titImgDelt, setTitImgDelt] = useState(false);


    useEffect(()=>{
        console.log(popup.adminSubCategoryPopLang);
    },[popup.adminSubCategoryPopLang]);


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
            setCloseConfirm(false);
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
        dispatch(adminSubCategoryPop({adminSubCategoryPop:false,adminSubCategoryPopIdx:null,adminSubCategoryPopLang:''}));
        dispatch(adminSubCategoryPopData({}));
    };


    //상세정보 가져오기
    const getData = () => {
        axios.get(`${menu_sub_detail.replace(":id",popup.adminSubCategoryPopIdx)}`,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                let data = res.data.data;
                    data.c_content_type = data.c_content_type[0];
                if(!data.c_type){
                    data.c_type = 1;
                }
                if(!data.b_read_lv){
                    data.b_read_lv = 0;
                }
                if(!data.b_write_lv){
                    data.b_write_lv = 0;
                }
                if(!data.b_reply_lv){
                    data.b_reply_lv = 0;
                }
                if(!data.b_comment_lv){
                    data.b_comment_lv = 0;
                }
                setInfo(data);

                if(data.c_main_banner_file){
                    setTitImg(data.c_main_banner_file);
                }
                setTab(data.c_content_type);
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
        //하위카테고리 수정일때만 상세정보 가져오기
        if(popup.adminSubCategoryPopIdx){
            getData();
        }else{
            let data = {
                c_depth: popup.adminSubCategoryPopParentData.c_depth+1,
                c_depth_parent: popup.adminSubCategoryPopParentData.id,
                c_num:'',
                c_content_type:1,
                c_main_banner:'',
                content:'',
                b_list_cnt:10,
                b_column_title:'',
                b_column_date:'',
                b_column_view:'',
                b_column_recom:'',
                b_column_file:'',
                b_thumbnail_with:0,
                b_thumbnail_height:0,
                b_thumbnail:'1',
                b_read_lv:0,
                b_write_lv:0,
                b_group:'',
                b_secret:'',
                b_reply:'',
                b_reply_lv:0,
                b_comment:'',
                b_comment_lv:0,
                b_write_alarm:'',
                b_write_send:'',
                b_alarm:'',
                b_alarm_phone:'',
                b_top_html:'',
                b_template:'',
                b_template_text:'',
                c_type:1,
                file_path:'',
                admin_file_path:'',
                sms:'',
                email:'',
                c_lang: popup.adminSubCategoryPopLang,
            };
            setInfo({...data});
        }
    },[]);


    useEffect(()=>{
        //카테고리 값 변경시 adminSubCategoryPopData store 에 저장
        dispatch(adminSubCategoryPopData(info));
    },[info]);

    
    //카테고리 종류 탭 클릭시
    const tabClickHandler = (idx) => {
        setTab(idx);

        let newInfo = {...info};
            newInfo.c_content_type = idx;
            
        setInfo(newInfo);
    };
    

    //인풋값 변경시
    const onInputChangeHandler = (e) => {
        const id = e.currentTarget.id;
        const val = e.currentTarget.value;

        let newInfo = {...info};
            newInfo[id] = val;
            
        setInfo(newInfo);
    };

    
    // 카테고리 제목이미지 등록
    const { getRootProps: getRootProps1, getInputProps: getInputProps1 } = useDropzone({
        accept: {
          'image/*': []
        },
        onDrop: acceptedFiles => {
            setTitImg(acceptedFiles[0].name);
            setTitImgData(acceptedFiles);
            setTitImgDelt(false);
        }
    });


    useEffect(()=>{
        console.log(popup.adminSubCategoryPopData);
    },[popup.adminSubCategoryPopData]);



    //저장버튼 클릭시 필수입력 체크
    const saveBtnClickHandler = () => {
        const data = popup.adminSubCategoryPopData;
        
        //고객맞춤-수신문자
        let sms;
        if(data.sms){
            sms = data.sms.replace(/[^0-9]/g, '').length;
        }

        //고객맞춤-수신메일
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
        let email = '';
        if(data.email){
            email = data.email;
        }
        

        //공통 필수값 체크 (카테고리명, 카테고리종류) --------------
        if(!data || !data.c_name){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt: '카테고리 명을 입력해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }
        //고객맞춤일때 필수값 체크 (파일경로, 관리자파일경로) && 수신문자,수신메일 입력시 값체크 ---------
        else if(data.c_content_type == 3 && !data.file_path){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt: '파일 경로를 입력해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }else if(data.c_content_type == 3 && !data.admin_file_path){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt: '관리자 파일 경로를 입력해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }else if(data.c_content_type == 3 && data.sms && sms <= 10){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt: '문자 수신을 받을 휴대폰 번호를 입력해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }else if(data.c_content_type == 3 && data.email && !emailRegex.test(email)){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt: '올바른 이메일 형식이 아닙니다.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }
        //갤러리게시판일때 필수값 체크 (썸네일) ---------
        else if(data.c_content_type == 5 && data.b_thumbnail_with <= 0){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt: '썸네일 가로사이즈를 입력해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }else if(data.c_content_type == 5 && data.b_thumbnail_height <= 0){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt: '썸네일 세로사이즈를 입력해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }else if(data.c_content_type == 5 && !data.b_thumbnail){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt: '썸네일 이미지스타일을 선택해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }else{
            saveHandler();
        }
    };


    //저장하기
    const saveHandler = () => {
        const body = popup.adminSubCategoryPopData;
        const formData = new FormData();

        console.log(body);

        //수정일때
        if(popup.adminSubCategoryPopIdx){
            // 객체를 순회하며 모든 속성을 formData에 추가
            for (const key in body) {
                if (body.hasOwnProperty(key)) {
                    const value = body[key];
                    if (key !== 'c_main_banner_file') {
                        formData.append(key, value);
                    }
                }
            }

            if(titImgData){
                titImgData.forEach((file) => {
                    formData.append("c_main_banner_file", file);
                });
            }else{
                formData.append("c_main_banner_file", "");
            }

            // 제목이미지 삭제했으면 삭제
            if(titImgDelt){
                formData.append("c_main_banner_file_del", "Y");
            }


            if(!body.hasOwnProperty('content')){
                formData.append("content", "");
            }
            if(!body.hasOwnProperty('b_list_cnt')){
                formData.append("b_list_cnt", 10);
            }
            if(!body.hasOwnProperty('b_column_title')){
                formData.append("b_column_title", '');
            }
            if(!body.hasOwnProperty('b_column_date')){
                formData.append("b_column_date", '');
            }
            if(!body.hasOwnProperty('b_column_view')){
                formData.append("b_column_view", '');
            }
            if(!body.hasOwnProperty('b_column_recom')){
                formData.append("b_column_recom", '');
            }
            if(!body.hasOwnProperty('b_column_file')){
                formData.append("b_column_file", '');
            }
            if(!body.hasOwnProperty('b_thumbnail_with')){
                formData.append("b_thumbnail_with", 0);
            }
            if(!body.hasOwnProperty('b_thumbnail_height')){
                formData.append("b_thumbnail_height", 0);
            }
            if(!body.hasOwnProperty('b_thumbnail')){
                formData.append("b_thumbnail", '1');
            }
            if(!body.hasOwnProperty('b_read_lv')){
                formData.append("b_read_lv", 0);
            }
            if(!body.hasOwnProperty('b_write_lv')){
                formData.append("b_write_lv", 0);
            }
            if(!body.hasOwnProperty('b_group')){
                formData.append("b_group", '');
            }
            if(!body.hasOwnProperty('b_secret')){
                formData.append("b_secret", '');
            }
            if(!body.hasOwnProperty('b_reply')){
                formData.append("b_reply", '');
            }
            if(!body.hasOwnProperty('b_reply_lv')){
                formData.append("b_reply_lv", 0);
            }
            if(!body.hasOwnProperty('b_comment')){
                formData.append("b_comment", '');
            }
            if(!body.hasOwnProperty('b_comment_lv')){
                formData.append("b_comment_lv", 0);
            }
            if(!body.hasOwnProperty('b_write_alarm')){
                formData.append("b_write_alarm", '');
            }
            if(!body.hasOwnProperty('b_write_send')){
                formData.append("b_write_send", '');
            }
            if(!body.hasOwnProperty('b_alarm')){
                formData.append("b_alarm", '');
            }
            if(!body.hasOwnProperty('b_alarm_phone')){
                formData.append("b_alarm_phone", '');
            }
            if(!body.hasOwnProperty('b_top_html')){
                formData.append("b_top_html", '');
            }
            if(!body.hasOwnProperty('b_template')){
                formData.append("b_template", '');
            }
            if(!body.hasOwnProperty('b_template_text')){
                formData.append("b_template_text", '');
            }
            if(!body.hasOwnProperty('c_type')){
                formData.append("c_type", 1);
            }
            if(!body.hasOwnProperty('file_path')){
                formData.append("file_path", '');
            }
            if(!body.hasOwnProperty('admin_file_path')){
                formData.append("admin_file_path", '');
            }
            if(!body.hasOwnProperty('sms')){
                formData.append("sms", '');
            }
            if(!body.hasOwnProperty('email')){
                formData.append("email", '');
            }
            if(!body.hasOwnProperty('c_use_yn')){
                formData.append("c_use_yn", "Y");
            }
            if(!body.hasOwnProperty('c_lang')){
                formData.append("c_lang", popup.adminSubCategoryPopLang);
            }

            axios.put(menu_sub, formData, {
                headers: {
                    Authorization: `Bearer ${user.loginUser.accessToken}`,
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((res)=>{
                if(res.status === 200){
                    dispatch(adminSubCategoryPopModify(true));
                    closePopHandler();
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
        }
        //새로등록일때
        else{
            // 객체를 순회하며 모든 속성을 formData에 추가
            for (const key in body) {
                if (body.hasOwnProperty(key)) {
                    const value = body[key];
                    if (key !== 'c_main_banner_file') {
                        formData.append(key, value);
                    }
                }
            }

            if(titImgData){
                titImgData.forEach((file) => {
                    formData.append("c_main_banner_file", file);
                });
            }else{
                formData.append("c_main_banner_file", "");
            }


            // 제목이미지 삭제했으면 삭제
            if(titImgDelt){
                formData.append("c_main_banner_file_del", "Y");
            }

            
            if(!body.c_use_yn){
                formData.append("c_use_yn", "Y");
            }


            axios.post(menu_sub, formData, {
                headers: {
                    Authorization: `Bearer ${user.loginUser.accessToken}`,
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((res)=>{
                if(res.status === 200){
                    dispatch(adminSubCategoryPopModify(true));
                    closePopHandler();
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
        }
    };
    

    
    //삭제버튼 클릭시
    const deltBtnClickHandler = () => {
        dispatch(confirmPop({
            confirmPop:true,
            confirmPopTit:'알림',
            confirmPopTxt:'해당 카테고리를 삭제하시겠습니까?',
            confirmPopBtn:2,
        }));
        setDeltConfirm(true);
    };


    // 카테고리삭제하기
    const deltHandler = () => {
        const body = {
            id: popup.adminSubCategoryPopIdx,
        };
        axios.delete(menu_sub,
            {
                data: body,
                headers: {Authorization: `Bearer ${user.loginUser.accessToken}`}
            }
        )
        .then((res)=>{
            if(res.status === 200){
                closePopHandler();
                dispatch(adminSubCategoryPopModify(true));
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
        <div className="pop_display pop_reg_category">
            <div className="dimm"></div>
            <div className="popup_wrap">
                <div className="popup">
                    <div className="pop_tit">
                        <h3>하위 카테고리</h3>
                        <div className="tit_txt">
                            <p>※ 정보수정 시 저장 버튼을 눌러 변경된 정보를 꼭 저장해 주세요.</p>
                        </div>
                    </div>
                    <div className="pop_con">
                        <div className="con_box">
                            <div className="form_pop_inner">
                                <div className="form_inner">
                                    <div className="form_box">
                                        <div className="form_input">
                                            <h6>카테고리 명 <i>*</i></h6>
                                            <div className="input_wrap">
                                                <InputBox
                                                    className="input_box" 
                                                    type={`text`}
                                                    placeholder={`카테고리 명을 입력해주세요.`}
                                                    value={info && info.c_name ? info.c_name : ""}
                                                    onChangeHandler={onInputChangeHandler}
                                                    id={`c_name`}
                                                    inputClassName={error.c_name ? "wrong_input" : ""}
                                                />
                                                {error.c_name && <em className="txt_err">카테고리 명을 입력해주세요.</em>}
                                            </div>
                                        </div>
                                        <div className="form_input">
                                            <h6>카테고리 제목 이미지</h6>
                                            <div className="input_wrap">
                                                <div className="file_box1">
                                                    <div {...getRootProps1({className: 'dropzone'})}>
                                                        <div className="input_file">
                                                            <input {...getInputProps1({className: 'blind'})} />
                                                            <label>
                                                                {titImg == null && <b>파일을 마우스로 끌어 오세요.</b>}
                                                                <strong>파일선택</strong>
                                                            </label>
                                                        </div>
                                                    </div>
                                                    {titImg != null &&
                                                        <ul className="file_txt">
                                                            <li>
                                                                <span>{titImg}</span>
                                                                <button type="button" className="btn_file_remove" 
                                                                    onClick={()=>{
                                                                        setTitImg(null);
                                                                        setTitImgData(null);
                                                                        setTitImgDelt(true);
                                                                    }}
                                                                >파일삭제</button>
                                                            </li>
                                                        </ul>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>                            
                        </div>
                        <div className="category_con">
                            <h4>카테고리 종류 <i>*</i></h4>
                            <div className="tab_wrap">
                                <ul className="tab_type1">
                                    {tabList.map((cont,i)=>{
                                        return(
                                            <li key={i} className={tab === i+1? "on" : ""}>
                                                <button type="button" onClick={()=>tabClickHandler(i+1)}>{cont}</button>
                                            </li>
                                        );
                                    })}
                                </ul>
                                <div className="tab_con_wrap">
                                    {tab === 1 ? <SubCategoryPopCont1 info={info} />
                                        : tab === 2 ? <SubCategoryPopCont2 info={info} />
                                        : tab === 3 ? <SubCategoryPopCont3 info={info} />
                                        : tab === 4 ? <SubCategoryPopCont4 info={info} />
                                        : tab === 5 ? <SubCategoryPopCont5 info={info} />
                                        : tab === 6 ? <SubCategoryPopCont6 info={info} />
                                        : tab === 7 && <SubCategoryPopCont7 info={info} />
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="pop_btn_wrap">
                            <button type="button" className="btn_left" onClick={deltBtnClickHandler}>카테고리 삭제</button>
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

        {/* 삭제 confirm팝업 */}
        {deltConfirm && <ConfirmPop onClickHandler={deltHandler} />}

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default SubCategoryPop;