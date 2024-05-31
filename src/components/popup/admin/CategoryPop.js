import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useDropzone } from 'react-dropzone';
import axios from "axios";
import * as CF from "../../../config/function";
import { enum_api_uri } from "../../../config/enum";
import { adminCategoryPop, adminCategoryPopModify, confirmPop, adminCategoryPopDelt } from "../../../store/popupSlice";
import { checkedList, activeMenuId } from "../../../store/etcSlice";
import ConfirmPop from "../ConfirmPop";
import InputBox from "../../component/InputBox";
import TableWrap from "../../component/admin/TableWrap";


const CategoryPop = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const etc = useSelector((state)=>state.etc);
    const menu_detail = enum_api_uri.menu_detail;
    const menu_modify = enum_api_uri.menu_modify;
    const [confirm, setConfirm] = useState(false);
    const [closeConfirm, setCloseConfirm] = useState(false);
    const [saveConfirm, setSaveConfirm] = useState(false);
    const [deltConfirm, setDeltConfirm] = useState(false);
    const [info, setInfo] = useState({});
    const [error, setError] = useState({});
    const [bannerImg, setBannerImg] = useState(null);
    const [bannerImgData, setBannerImgData] = useState(null);
    const [firstRender, setFirstRender] = useState(false);
    const [sizeCheck, setSizeCheck] = useState("1");
    const [checkList, setCheckList] = useState([]);
    const [checkedNum, setCheckedNum] = useState(0);
    const [currentMenuDelt, setCurrentMenuDelt] = useState(false);
    

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
        dispatch(adminCategoryPop({adminCategoryPop:false, adminCategoryPopIdx:null, adminCategoryPopLang:''}));
        dispatch(checkedList([]));
    };


    //상세정보 가져오기
    const getData = () => {
        axios.get(`${menu_detail.replace(":id",popup.adminCategoryPopIdx)}`,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                const data = res.data.data;
                setInfo(data);

                if(data.c_main_banner_file){
                    setBannerImg(data.c_main_banner_file);
                }
                if(data.c_main_banner){
                    setSizeCheck(data.c_main_banner[0]);
                }
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


    //맨처음 
    useEffect(()=>{
        if(!firstRender){
            setFirstRender(true);
        }

        //1차카테고리 수정일때만 상세정보 가져오기
        if(popup.adminCategoryPopIdx){
            getData();
        }
    },[]);
    

    //인풋값 변경시
    const onInputChangeHandler = (e) => {
        const id = e.currentTarget.id;
        const val = e.currentTarget.value;

        let newInfo = {...info};
            newInfo[id] = val;
            
        setInfo(newInfo);
    };

    
    // 메인배너 등록
    const { getRootProps: getRootProps1, getInputProps: getInputProps1 } = useDropzone({
        accept: {
          'image/*': []
        },
        onDrop: acceptedFiles => {
            setBannerImg(acceptedFiles[0].name);
            setBannerImgData(acceptedFiles);
        }
    });


    //맨처음 리스트 id값만 배열로 (전체 체크박스리스트 만들기)
    useEffect(()=>{
        if(etc.cateMenuList.length > 0){
            const list = etc.cateMenuList.map((item) => item.id).filter(Boolean);
            setCheckList([...list]);
        }
    },[etc.cateMenuList]);


    //전체선택 체크박스 체크시
    const allCheckHandler = (checked) => {
        if(checked){
            dispatch(checkedList([...checkList]));
        }else{
            dispatch(checkedList([]));
        }
    };


    //체크박스 변경시 체크된 수 변경
    useEffect(()=>{
        const num = etc.checkedList.length;
        setCheckedNum(num);
    },[etc.checkedList]);


    //저장버튼 클릭시 필수입력 체크
    const saveBtnClickHandler = () => {
        //카테고리명 필수값 체크 --------------
        if(!info.c_name){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt: '카테고리 명을 입력해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }else{
            saveHandler();
        }
    };


    //저장하기
    const saveHandler = () => {
        const formData = new FormData();

        let c_main_banner_file = '';
        if(bannerImgData){
            c_main_banner_file = bannerImgData[0]
        }

        //수정일때
        if(popup.adminCategoryPopIdx){
            formData.append("id", info.id);
            formData.append("c_depth", info.c_depth);
            formData.append("c_depth_parent", info.c_depth_parent);
            formData.append("c_num", info.c_num);
            formData.append("c_name", info.c_name);
            formData.append("c_main_banner", sizeCheck);
            formData.append("c_main_banner_file", c_main_banner_file);
            formData.append("c_use_yn", 'Y');
            formData.append("c_lang", popup.adminCategoryPopLang);

            axios.put(menu_modify, formData, {
                headers: {
                    Authorization: `Bearer ${user.loginUser.accessToken}`,
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((res)=>{
                if(res.status === 200){
                    dispatch(adminCategoryPopModify(true));
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
            formData.append("c_depth", 1);        //새로등록시 고정값
            formData.append("c_depth_parent", 0); //새로등록시 고정값
            formData.append("c_num", '');         //새로등록시 고정값
            formData.append("c_name", info.c_name);
            formData.append("c_main_banner", sizeCheck);
            formData.append("c_main_banner_file", c_main_banner_file);
            formData.append("c_use_yn", 'Y');
            formData.append("c_lang", popup.adminCategoryPopLang);

            axios.post(menu_modify, formData, {
                headers: {
                    Authorization: `Bearer ${user.loginUser.accessToken}`,
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((res)=>{
                if(res.status === 200){
                    dispatch(adminCategoryPopModify(true));
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
    const deltBtnClickHandler = (id) => {
        const list = etc.cateMenuList;
        if(id){
            const findItem = list.find(item => item.id === id);
            //하위카테고리가 있는지 체크
            if(findItem.submenu && findItem.submenu.length > 0){
                dispatch(confirmPop({
                    confirmPop:true,
                    confirmPopTit:'알림',
                    confirmPopTxt:'하위 카테고리가 있는 경우 삭제할 수 없습니다.',
                    confirmPopBtn:1,
                }));
                setConfirm(true);
            }else{    
                dispatch(confirmPop({
                    confirmPop:true,
                    confirmPopTit:'알림',
                    confirmPopTxt:'해당 카테고리를 삭제하시겠습니까?',
                    confirmPopBtn:2,
                }));
                setDeltConfirm(true);
            }
        }else{
            if(checkedNum > 0){
                const filteredItems = list.filter(item => etc.checkedList.includes(item.id));
                const itemsWithSubMenu = filteredItems.filter(item => item.submenu && item.submenu.length > 0);
                //선택한 카테고리중 하위카테고리가 있는지 체크
                if(itemsWithSubMenu.length > 0){
                    dispatch(confirmPop({
                        confirmPop:true,
                        confirmPopTit:'알림',
                        confirmPopTxt:'하위 카테고리가 있는 경우 삭제할 수 없습니다.',
                        confirmPopBtn:1,
                    }));
                    setConfirm(true);
                }else{
                    dispatch(confirmPop({
                        confirmPop:true,
                        confirmPopTit:'알림',
                        confirmPopTxt:'해당 카테고리를 삭제하시겠습니까?',
                        confirmPopBtn:2,
                    }));
                    setDeltConfirm(true);
                }
            }else if(checkedNum === 0){
                dispatch(confirmPop({
                    confirmPop:true,
                    confirmPopTit:'알림',
                    confirmPopTxt:'카테고리를 선택해주세요.',
                    confirmPopBtn:1,
                }));
                setConfirm(true);
            }
        }
    };


    // 카테고리삭제하기
    const deltHandler = () => {
        let id = etc.checkedList;
        if(currentMenuDelt){
            id = info.id;
        }

        const body = {
            id: id,
        };
        axios.delete(menu_modify,
            {
                data: body,
                headers: {Authorization: `Bearer ${user.loginUser.accessToken}`}
            }
        )
        .then((res)=>{
            if(res.status === 200){
                dispatch(activeMenuId(null)); //현재선택된 activeMenuId 값 지우기
                dispatch(adminCategoryPopDelt(true));

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
    };



    return(<>
        <div className="pop_display pop_reg_category">
            <div className="dimm"></div>
            <div className="popup_wrap">
                <div className="popup">
                    <div className="pop_tit">
                        <h3>1차 카테고리</h3>
                        <div className="tit_txt">
                            <p>※ 정보수정 시 저장 버튼을 눌러 변경된 정보를 꼭 저장해 주세요.</p>
                        </div>
                    </div>
                    <div className="pop_con">
                        <div className="con_box">
                            <div className="form_pop_inner">
                                <div className="form_inner">
                                    <div className="form_box form_box2">
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
                                    </div>
                                    <div className="form_box">
                                        <div className="form_input">
                                            <h6>메인 배너 <b>권장 : 1800 * 320 px</b></h6>
                                            <div className="input_wrap">
                                                <div className="file_box1">
                                                    <div {...getRootProps1({className: 'dropzone'})}>
                                                        <div className="input_file">
                                                            <input {...getInputProps1({className: 'blind'})} />
                                                            <label>
                                                                {bannerImg == null && <b>파일을 마우스로 끌어 오세요.</b>}
                                                                <strong>파일선택</strong>
                                                            </label>
                                                        </div>
                                                    </div>
                                                    {bannerImg != null &&
                                                        <ul className="file_txt">
                                                            <li>
                                                                <span>{bannerImg}</span>
                                                                <button type="button" className="btn_file_remove" 
                                                                    onClick={()=>{
                                                                        setBannerImg(null);
                                                                        setBannerImgData(null);
                                                                    }}
                                                                >파일삭제</button>
                                                            </li>
                                                        </ul>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form_input">
                                            <h6> </h6>
                                            <div className="input_wrap">
                                                <div className="chk_rdo_wrap">
                                                    <div className="rdo_box1">
                                                        <input type="radio" id="check_size1" className="blind"
                                                            onChange={(e)=>{
                                                                const checked = e.currentTarget.checked;
                                                                if(checked){
                                                                    setSizeCheck("1");
                                                                }else{
                                                                    setSizeCheck("");
                                                                }
                                                            }}
                                                            checked={sizeCheck == "1" ? true : false}
                                                            name="check_size"
                                                        />
                                                        <label htmlFor="check_size1">커버</label>
                                                    </div>
                                                    <div className="rdo_box1">
                                                        <input type="radio" id="check_size2" className="blind"
                                                            onChange={(e)=>{
                                                                const checked = e.currentTarget.checked;
                                                                if(checked){
                                                                    setSizeCheck("2");
                                                                }else{
                                                                    setSizeCheck("");
                                                                }
                                                            }}
                                                            checked={sizeCheck == "2" ? true : false}
                                                            name="check_size"
                                                        />
                                                        <label htmlFor="check_size2">원본 사이즈 고정</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>                            
                        </div>
                        <div className="pop_btn_wrap">
                            <div className="btn_box bp5">
                                <button type="button" className="btn_left" 
                                    onClick={()=>{
                                        setCurrentMenuDelt(true);
                                        deltBtnClickHandler(info.id);
                                    }}
                                >카테고리 삭제</button>
                                <button type="button" className="btn_type3" onClick={closeBtnClickHandler}>취소</button>
                                <button type="button" className="btn_type4" onClick={saveBtnClickHandler}>저장</button>
                            </div>
                        </div>
                        <div className="con_box">
                            <div className="board_section tm15">
                                <div className="board_table_util">
                                    <div className="chk_area">
                                        <div className="chk_box2">
                                            <input type="checkbox" id="menuChkAll" className="blind"
                                                onChange={(e)=>{
                                                    allCheckHandler(e.currentTarget.checked)
                                                }} 
                                                checked={checkList.length > 0 && checkList.length === etc.checkedList.length && checkList.every(item => etc.checkedList.includes(item))}
                                            />
                                            <label htmlFor="menuChkAll">전체선택</label>
                                        </div>
                                    </div>
                                    <div className="util_wrap">
                                        <span>선택한 카테고리</span>
                                        <span>총 <b>{CF.MakeIntComma(checkedNum)}</b>개</span>
                                    </div>
                                    <div className="util_right">
                                        <button type="button" className="btn_type9" onClick={()=>deltBtnClickHandler()}>삭제</button>
                                    </div>
                                </div>
                                <TableWrap 
                                    className="tbl_wrap1 tbl_wrap1_1"
                                    colgroup={["6%","9%","65%","10%","10%"]}
                                    thList={["","순서","메뉴명","하위","순서"]}
                                    tdList={etc.cateMenuList}
                                    type={"menu"}
                                    menuDepth={1}
                                />
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

export default CategoryPop;