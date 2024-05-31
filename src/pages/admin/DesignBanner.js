import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { enum_api_uri } from "../../config/enum";
import * as CF from "../../config/function";
import { confirmPop, adminBannerPop ,adminBannerPopWrite, adminBannerPopModify } from "../../store/popupSlice";
import { pageNoChange, checkedList } from "../../store/etcSlice";
import SelectBox from "../../components/component/SelectBox";
import SearchInput from "../../components/component/SearchInput";
import TableWrap from "../../components/component/admin/TableWrap";
import ConfirmPop from "../../components/popup/ConfirmPop";
import Pagination from "../../components/component/Pagination";


const DesignBanner = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const banner_list = enum_api_uri.banner_list;
    const banner_open = enum_api_uri.banner_open;
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const etc = useSelector((state)=>state.etc);
    const [confirm, setConfirm] = useState(false);
    const [useConfirm, setUseConfirm] = useState(false);
    const [deltConfirm, setDeltConfirm] = useState(false);
    const [searchTxt, setSearchTxt] = useState("");
    const [boardData, setBoardData] = useState({});
    const [limit, setLimit] = useState(10);
    const [checkList, setCheckList] = useState([]);
    const [checkedNum, setCheckedNum] = useState(0);
    const [tab, setTab] = useState("P");
    const [showBtn, setShowBtn] = useState(false);
    const [hideBtn, setHideBtn] = useState(false);
    const [use, setUse] = useState("");
    const [firstRender, setFirstRender] = useState(false);


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
            setUseConfirm(false);
            setDeltConfirm(false);
        }
    },[popup.confirmPop]);


    //게시판정보 가져오기
    const getBoardData = (page, search) => {
        let txt
        if(search){
            txt = "";
        }else{
            txt = searchTxt;
        }

        axios.get(`${banner_list}?b_type=${tab}&page=${page ? page : 1}&getLimit=${limit}${txt.length > 0 ? "&searchtxt="+txt : ""}`,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                let data = res.data.data;
                setBoardData(data);

                //store 에 저장된 checkedList 값 삭제
                dispatch(checkedList([]));
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


    useEffect(()=>{
        if(!firstRender){
            setFirstRender(true);
        }
    },[]);


    //탭 변경시 PC배너 리스트, MO배너 리스트 변경
    useEffect(()=>{
        if(firstRender){
            setSearchTxt("");
            getBoardData(1,true);
        }
    },[tab]);


    //limit 값 변경시 게시판정보 가져오기
    useEffect(()=>{
        getBoardData();
    },[limit]);


    //페이지네이션 클릭으로 페이지변경시
    useEffect(()=>{
        if(etc.pageNoChange){
            getBoardData(etc.pageNo);

            dispatch(pageNoChange(false));
        }
    },[etc.pageNo,etc.pageNoChange]);


    //맨처음 리스트 idx값만 배열로 (전체 체크박스리스트 만들기)
    useEffect(()=>{
        if(boardData.hasOwnProperty("banner_list")){
            const idxList = boardData.banner_list.map((item) => item.idx).filter(Boolean);
            setCheckList([...idxList]);
        }
    },[boardData]);


    //전체선택 체크박스 체크시
    const allCheckHandler = (checked) => {
        if(checked){
            dispatch(checkedList([...checkList]));
        }else{
            dispatch(checkedList([]));
        }
    };


    //체크박스 변경시 
    useEffect(()=>{
        //체크된 수 변경
        const list = boardData.banner_list;
        const list2 = etc.checkedList;
        const num = etc.checkedList.length;
        setCheckedNum(num);

        //체크된 리스트에 따라 노출,중단 버튼 on,off
        if(list && list2){
            const newList = list.filter((item)=>list2.includes(item.idx));
            const hasYValue = newList.some(item => item.b_open[0] === "Y");
            const hasNValue = newList.some(item => item.b_open[0] === "N");
            if(hasYValue){
                setHideBtn(true);
            }else{
                setHideBtn(false);
            }
            if(hasNValue){
                setShowBtn(true);
            }else{
                setShowBtn(false);
            }
        }
    },[etc.checkedList]);


    //노출,중단버튼 클릭시
    const btnClickHandler = (use) => {
        let txt = "";
        if(use){
            txt = "노출";
            setUse("Y");
        }else{
            txt = "중단";
            setUse("N");
        }
        dispatch(confirmPop({
            confirmPop:true,
            confirmPopTit:'알림',
            confirmPopTxt: '해당 배너를 '+ txt +'하시겠습니까?',
            confirmPopBtn:2,
        }));
        setUseConfirm(true);
    };


    //배너 노출,중단하기
    const useHandler = () => {
        const body = {
            idx:etc.checkedList,
            b_open:use
        };
        axios.post(banner_open, body, 
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                getBoardData();
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


    //배너 변경시 게시판리스트정보 가져오기
    useEffect(()=>{
        if(popup.adminBannerPopModify){
            dispatch(adminBannerPopModify(false));
            getBoardData();
        }
    },[popup.adminBannerPopModify]);


    //배너등록 버튼클릭시
    const writeBtnClickHandler = () => {
        dispatch(adminBannerPopWrite(true));
        dispatch(adminBannerPop({adminBannerPop:true,adminBannerPopIdx:null,adminBannerPopType:tab}));
    };


    //삭제버튼 클릭시
    const deltBtnClickHandler = () => {
        if(checkedNum > 0){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'해당 배너를 삭제하시겠습니까?',
                confirmPopBtn:2,
            }));
            setDeltConfirm(true);
        }else if(checkedNum === 0){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'배너를 선택해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }
    };


    //배너 삭제하기
    const deltHandler = () => {
        const body = {
            idx: etc.checkedList,
        };
        axios.delete(banner_list,
            {
                data: body,
                headers: {Authorization: `Bearer ${user.loginUser.accessToken}`}
            }
        )
        .then((res)=>{
            if(res.status === 200){
                getBoardData();
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


    return(<>
        <div className="page_admin_design">
            <div className="top_txt">
                <strong>배너 등록시 노출될 기기와 이미지 사이즈, 배너 이미지가 들어갈 자리를 고려하여 등록해주세요.</strong>
                <button type="button" className="btn_type15" onClick={writeBtnClickHandler}>메인 배너 등록</button>
            </div>
            <div className="content_box">
                <ul className="tab_type3">
                    <li className={tab === "P" ? "on" : ""}>
                        <button type="button" onClick={()=>setTab("P")}>
                            <span>PC</span>
                        </button>
                    </li>
                    <li className={tab === "M" ? "on" : ""}>
                        <button type="button" onClick={()=>setTab("M")}>
                            <span>Mobile</span>
                        </button>
                    </li>
                </ul>
                <div className="board_section">
                    <div className="form_search_wrap">
                        <div className="search_wrap">
                            <SelectBox 
                                className="select_type3 search_row_select"
                                list={[10,15,30,50]}
                                selected={limit}
                                onChangeHandler={(e)=>{
                                    const val = e.currentTarget.value;
                                    setLimit(val);
                                }}
                                selHidden={true}
                                limitSel={`개씩`}
                            />
                            <div className="search_box">
                                <SearchInput 
                                    placeholder="검색어를 입력해주세요."
                                    onChangeHandler={(e)=>{
                                        const val = e.currentTarget.value;
                                        setSearchTxt(val);
                                    }}
                                    value={searchTxt}
                                    onSearchHandler={()=>getBoardData()}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="board_table_util">
                        <div className="chk_area">
                            <div className="chk_box2">
                                <input type="checkbox" id="chkAll" className="blind"
                                    onChange={(e)=>{allCheckHandler(e.currentTarget.checked)}} 
                                    checked={checkList.length > 0 && checkList.length === etc.checkedList.length && checkList.every(item => etc.checkedList.includes(item))}
                                />
                                <label htmlFor="chkAll">전체선택</label>
                            </div>
                        </div>
                        <div className="util_wrap">
                            <span>선택한 팝업</span>
                            <span>총 <b>{CF.MakeIntComma(checkedNum)}</b>개</span>
                            <div className="btn_box">
                                <button type="button" disabled={showBtn ? false : true} className={`btn_type18${showBtn ? " on" : ""}`} 
                                    onClick={()=>{
                                        btnClickHandler(true);
                                    }}
                                >노출</button>
                                <button type="button" disabled={hideBtn ? false : true} className={`btn_type19${hideBtn ? " on" : ""}`} 
                                    onClick={()=>{
                                        btnClickHandler(false);
                                    }}
                                >중단</button>
                            </div>
                        </div>
                        <div className="util_right">
                            <button type="button" className="btn_type9" onClick={deltBtnClickHandler}>삭제</button>
                        </div>
                    </div>
                    <TableWrap 
                        className="tbl_wrap1 tbl_wrap1_1"
                        colgroup={["80px","15%","calc(36% - 80px)","15%","15%","12%","7%"]}
                        thList={["","썸네일","제목","기간","배너 노출 사이즈","사용여부","순서"]}
                        tdList={boardData.banner_list}
                        type={"banner"}
                        popType={tab}
                    />
                    {boardData.banner_list && boardData.banner_list.length > 0 &&
                        <Pagination 
                            currentPage={boardData.current_page} //현재페이지 번호
                            startPage={boardData.start_page} //시작페이지 번호 
                            endPage={boardData.end_page} //보이는 끝페이지 번호 
                            lastPage={boardData.last_page} //총페이지 끝
                        />
                    }
                    <div className={`board_btn_wrap${boardData.banner_list && boardData.banner_list.length > 0 ? "" : " none_list"}`}>
                        <button type="button" className="btn_type20" onClick={writeBtnClickHandler}>메인 배너 등록</button>                                        
                    </div>
                </div>
            </div>
        </div>

        {/* 노출,중단하기 confirm팝업 */}
        {useConfirm && <ConfirmPop onClickHandler={useHandler} />}

        {/* 게시글 삭제 confirm팝업 */}
        {deltConfirm && <ConfirmPop onClickHandler={deltHandler} />}

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default DesignBanner;