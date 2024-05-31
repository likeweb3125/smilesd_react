import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { enum_api_uri } from "../../config/enum";
import * as CF from "../../config/function";
import { confirmPop, adminPolicyPopWrite, adminPolicyPop, adminPolicyPopModify } from "../../store/popupSlice";
import { pageNoChange, checkedList } from "../../store/etcSlice";
import SelectBox from "../../components/component/SelectBox";
import SearchInput from "../../components/component/SearchInput";
import TableWrap from "../../components/component/admin/TableWrap";
import ConfirmPop from "../../components/popup/ConfirmPop";
import Pagination from "../../components/component/Pagination";


const SettingPolicy = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const etc = useSelector((state)=>state.etc);
    const common = useSelector((state)=>state.common);
    const site_policy = enum_api_uri.site_policy;
    const policy_use = enum_api_uri.policy_use;
    const [confirm, setConfirm] = useState(false);
    const [useConfirm, setUseConfirm] = useState(false);
    const [deltConfirm, setDeltConfirm] = useState(false);
    const [searchTxt, setSearchTxt] = useState("");
    const [boardData, setBoardData] = useState({});
    const [limit, setLimit] = useState(10);
    const [searchType, setSearchType] = useState("제목만");
    const [checkList, setCheckList] = useState([]);
    const [checkedNum, setCheckedNum] = useState(0);
    const [showBtn, setShowBtn] = useState(false);
    const [hideBtn, setHideBtn] = useState(false);
    const [use, setUse] = useState("");
    const [firstRender, setFirstRender] = useState(false);
    const [langTabList, setLangTabList] = useState([]);
    const [langTabOn, setLangTabOn] = useState(0);
    const [tabLang, setTabLang] = useState('');


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
            setUseConfirm(false);
            setDeltConfirm(false);
        }
    },[popup.confirmPop]);


    //사이트 언어리스트 가져오기
    useEffect(()=>{
        const list = common.siteLangList;
        setLangTabList(list);
    },[common.siteLangList]);


    //게시판정보 가져오기
    const getBoardData = (page) => {
        let lang = 'KR';
        if(langTabList.length > 1){
            lang = langTabList[langTabOn].site_lang;
        }

        let search;
        if(searchType == "제목만"){
            search = "title";
        }else if(searchType == "제목+내용"){
            search = "titlecontents";
        }

        axios.get(`${site_policy.replace(":limit",limit)}?page=${page ? page : 1}&p_lang=${lang}${searchTxt.length > 0 ? "&search="+search+"&searchtxt="+searchTxt : ""}`,
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


    //언어 탭변경시 운영정책리스트 가져오기
    useEffect(()=>{
        if(firstRender){
            getBoardData();
        }
    },[langTabOn]);


    //언어탭변경시 tabLang 값 변경
    useEffect(()=>{
        let lang = 'KR';
        if(langTabList.length > 0){
            lang = langTabList[langTabOn].site_lang;
        }
        setTabLang(lang);
    },[langTabOn, langTabList]);


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
        if(boardData.hasOwnProperty("policy_list")){
            const list = boardData.policy_list.map((item) => item.idx).filter(Boolean);
            setCheckList([...list]);
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
        const list = boardData.policy_list;
        const list2 = etc.checkedList;
        const num = etc.checkedList.length;
        setCheckedNum(num);

        //체크된 리스트에 따라 노출,중단 버튼 on,off
        if(list && list2){
            const newList = list.filter((item)=>list2.includes(item.idx));
            const hasYValue = newList.some(item => item.p_use_yn === "Y");
            const hasNValue = newList.some(item => item.p_use_yn === "N");
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
            confirmPopTxt: '해당 운영정책을 '+ txt +'하시겠습니까?',
            confirmPopBtn:2,
        }));
        setUseConfirm(true);
    };


    //운영정책 노출,중단하기
    const useHandler = () => {
        const body = {
            idx:etc.checkedList,
            p_use_yn:use
        };
        axios.post(policy_use, body, 
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                getBoardData();
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


    //운영정책 상세내용 변경시 게시판리스트정보 가져오기
    useEffect(()=>{
        if(popup.adminPolicyPopModify){
            dispatch(adminPolicyPopModify(false));
            getBoardData();
        }
    },[popup.adminPolicyPopModify]);


    //작성하기 버튼클릭시 작성팝업 띄우기
    const writeBtnClickHandler = () => {
        dispatch(adminPolicyPopWrite(true));
        dispatch(adminPolicyPop({adminPolicyPop:true,adminPolicyPopIdx:null,adminPolicyPopLang:tabLang}));
    };


    //삭제버튼 클릭시
    const deltBtnClickHandler = () => {
        if(checkedNum > 0){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'해당 운영정책을 삭제하시겠습니까?',
                confirmPopBtn:2,
            }));
            setDeltConfirm(true);
        }else if(checkedNum === 0){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'운영정책을 선택해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }
    };


    //팝업 삭제하기
    const deltHandler = () => {
        const body = {
            idx: etc.checkedList,
        };
        axios.delete(policy_use,
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
        <div className="page_admin_setting">
            <ul className="tab_type1">
                {langTabList.length > 1 && langTabList.map((cont,i)=>
                    <li key={i} className={langTabOn === i ? 'on' : ''}>
                        <button type="button" onClick={()=>setLangTabOn(i)}>{cont.site_lang_hangul}</button>
                    </li>
                )}
            </ul>
            <div className="content_box">
                <div className="tit tit2">
                    <h3>
                        <b>운영정책</b>
                    </h3>
                    <strong>총 {boardData.total_count ? CF.MakeIntComma(boardData.total_count) : 0}개</strong>
                </div>
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
                                <SelectBox 
                                    className="select_type3"
                                    list={["제목만","제목+내용"]}
                                    selected={searchType}
                                    onChangeHandler={(e)=>{
                                        const val = e.currentTarget.value;
                                        setSearchType(val);
                                    }}
                                    selHidden={true}
                                />
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
                            <span>선택한 운영정책</span>
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
                        colgroup={["80px","9%","auto","18%","12%"]}
                        thList={["","구분","제목","작성일시","사용여부"]}
                        tdList={boardData.policy_list}
                        type={"policy"}
                        popLang={tabLang}
                    />
                    {boardData.policy_list && boardData.policy_list.length > 0 &&
                        <Pagination 
                            currentPage={boardData.current_page} //현재페이지 번호
                            startPage={boardData.start_page} //시작페이지 번호 
                            endPage={boardData.end_page} //보이는 끝페이지 번호 
                            lastPage={boardData.last_page} //총페이지 끝
                        />
                    }
                    <div className="form_btn_wrap">
                        <button type="button" className="btn_type4" onClick={writeBtnClickHandler}>작성</button>                                        
                    </div>
                </div>
            </div>
        </div>

        {/* 노출,중단하기 confirm팝업 */}
        {useConfirm && <ConfirmPop onClickHandler={useHandler} />}

        {/* 운영정책 삭제 confirm팝업 */}
        {deltConfirm && <ConfirmPop onClickHandler={deltHandler} />}

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default SettingPolicy;