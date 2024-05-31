import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { enum_api_uri } from "../../config/enum";
import * as CF from "../../config/function";
import { confirmPop } from "../../store/popupSlice";
import { pageNoChange, checkedList } from "../../store/etcSlice";
import { boardSettingData, listPageData, detailPageBack } from "../../store/commonSlice";
import SelectBox from "../../components/component/SelectBox";
import SearchInput from "../../components/component/SearchInput";
import TableWrap from "../../components/component/admin/TableWrap";
import ConfirmPop from "../../components/popup/ConfirmPop";
import Pagination from "../../components/component/Pagination";


const Board = () => {
    const dispatch = useDispatch();
    const board_list = enum_api_uri.board_list;
    const board_move = enum_api_uri.board_move;
    const board_modify = enum_api_uri.board_modify;
    const notice_setting = enum_api_uri.notice_setting;
    const { board_category } = useParams();
    const common = useSelector((state)=>state.common);
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const etc = useSelector((state)=>state.etc);
    const [confirm, setConfirm] = useState(false);
    const [notiSettingConfirm, setNotiSettingConfirm] = useState(false);
    const [moveConfirm, setMoveConfirm] = useState(false);
    const [deltConfirm, setDeltConfirm] = useState(false);
    const [boardTit, setBoardTit] = useState("");
    const [searchTxt, setSearchTxt] = useState("");
    const [boardData, setBoardData] = useState({});
    const [limit, setLimit] = useState(10);
    const [searchType, setSearchType] = useState("제목만");
    const [moveSelect, setMoveSelect] = useState("");
    const [notiSetData, setNotiSetData] = useState({});
    const [checkList, setCheckList] = useState([]);
    const [checkedNum, setCheckedNum] = useState(0);
    const navigate = useNavigate();
    const [scrollMove, setScrollMove] = useState(false);


    //상세->목록으로 뒤로가기시 저장되었던 스크롤위치로 이동
    useEffect(()=>{
        if(scrollMove){
            const y = common.scrollY;
            window.scrollTo(0,y); 
        }
    },[scrollMove]);


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
            setNotiSettingConfirm(false);
            setMoveConfirm(false);
            setDeltConfirm(false);
        }
    },[popup.confirmPop]);


    //페이지 제목 가져오기
    useEffect(()=>{
        if(board_category){
            const idx = common.boardMenu.findIndex((item)=>item.category == board_category);
            const txt = common.boardMenu[idx].c_name;
            setBoardTit(txt);
        }
    },[board_category, common.boardMenu]);


    //게시판정보 가져오기
    const getBoardData = (page) => {
        let limitNum;
        let pageNum;
        let search;
        let searchText = '';

        //상세페이지에서 뒤로가기시 저장된 리스트페이지 정보로 조회
        if(common.detailPageBack){
            limitNum = common.listPageData.limit;
            pageNum = common.listPageData.page;
            search = common.listPageData.search;
            searchText = common.listPageData.searchTxt;

            let type;
            if(search == "title"){
                type = "제목만";
            }else if(search == "titlecontents"){
                type = "제목+내용";
            }else if(search == "name"){
                type = "작성자";
            }

            setLimit(limitNum);
            setSearchType(type);
            setSearchTxt(searchText);
        }else{
            limitNum = limit;
            pageNum = page;

            if(searchType == "제목만"){
                search = "title";
            }else if(searchType == "제목+내용"){
                search = "titlecontents";
            }else if(searchType == "작성자"){
                search = "name";
            }

            searchText = searchTxt;
        }

        axios.get(`${board_list.replace(":category",board_category).replace(":limit",limitNum)}?page=${pageNum ? pageNum : 1}${searchText.length > 0 ? "&search="+search+"&searchtxt="+searchText : ""}&group_id=`,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                let data = res.data.data;
                setBoardData(data);

                //게시판설정정보 store 에 저장
                const newData = {...data};
                delete newData.board_list;
                dispatch(boardSettingData(newData));

                //리스트페이지 조회 데이터저장
                let pageData = {
                    limit: limit,
                    page: page,
                    search: search,
                    searchTxt: searchTxt
                };
                dispatch(listPageData(pageData));

                //상세페이지에서 뒤로가기시
                if(common.detailPageBack){
                    setScrollMove(true);
                    dispatch(detailPageBack(false));
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

    
    //제목 셀렉트박스 변경시, limit 값 변경시 게시판정보 가져오기
    useEffect(()=>{
        if(board_category != null){
            getBoardData();
        }
    },[board_category,limit]);


    //제목 셀렉트박스 변경시 페이지변경
    const titSelectChangeHandler = (e) => {
        const val = e.currentTarget.value;
        setBoardTit(val);

        const category = e.target.options[e.target.selectedIndex].getAttribute("data-category");
        navigate(`/console/board/post/${category}`);
    };


    //페이지네이션 클릭으로 페이지변경시
    useEffect(()=>{
        if(etc.pageNoChange){
            getBoardData(etc.pageNo);

            dispatch(pageNoChange(false));
        }
    },[etc.pageNo,etc.pageNoChange]);



    //공지설정 or 해제하기버튼 클릭시
    const notiSettingBtnClickHandler = (data) => {
        setNotiSetData(data);
        const notice = data.b_notice;
        let txt;
        if(notice == "1"){
            txt = '해제';
        }else{
            txt = '설정';
        }
        dispatch(confirmPop({
            confirmPop:true,
            confirmPopTit:'알림',
            confirmPopTxt:'해당 게시글을 공지 '+txt+'하시겠습니까?',
            confirmPopBtn:2,
        }));
        setNotiSettingConfirm(true);
    };


    //공지설정 or 해제하기
    const notiSettingHandler = () => {
        let set;
        if(notiSetData.b_notice == "1"){
            set = "0";
        }else{
            set = "1";
        }

        const body = {
            notice: set, // 1 설정 , 0 해제
            idx: notiSetData.idx,
            category: notiSetData.category
        };
        axios.put(`${notice_setting}`, body,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                //현재페이지 게시판정보 가져오기 
                getBoardData(etc.pageNo);
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


    //맨처음 리스트 idx값만 배열로 (전체 체크박스리스트 만들기)
    useEffect(()=>{
        if(boardData.hasOwnProperty("board_list")){
            const list = boardData.board_list.map((item) => item.idx).filter(Boolean);
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


    //체크박스 변경시 체크된 수 변경
    useEffect(()=>{
        const num = etc.checkedList.length;
        setCheckedNum(num);
    },[etc.checkedList]);
    

    //게시글 이동버튼 클릭시
    const moveBtnClickHandler = () => {
        if(checkedNum > 0 && moveSelect){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'해당 게시글을 '+moveSelect+' 게시판으로 이동하시겠습니까?',
                confirmPopBtn:2,
            }));
            setMoveConfirm(true);
        }else if(checkedNum === 0){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'게시글을 선택해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }else if(!moveSelect){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'이동할 게시판을 선택해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }
    };


    //게시글 이동하기
    const moveHandler = () => {
        const body = {
            idx: etc.checkedList,
            category: board_category
        };
        axios.put(`${board_move}`, body,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                //현재페이지 게시판정보 가져오기 
                getBoardData(etc.pageNo);
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
    }


    //게시글 삭제버튼 클릭시
    const deltBtnClickHandler = () => {
        if(checkedNum > 0){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'해당 게시글을 삭제하시겠습니까?',
                confirmPopBtn:2,
            }));
            setDeltConfirm(true);
        }else if(checkedNum === 0){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'게시글을 선택해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }
    };


    // 게시글 삭제하기
    const deltHandler = () => {
        const body = {
            idx: etc.checkedList,
            category: board_category
        };
        axios.delete(`${board_modify}`,
            {
                data: body,
                headers: {Authorization: `Bearer ${user.loginUser.accessToken}`}
            }
        )
        .then((res)=>{
            if(res.status === 200){
                //현재페이지 게시판정보 가져오기 
                getBoardData(etc.pageNo);
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
        console.log(boardData);
    },[boardData]);


    return(<>
        <div className="page_admin_board">
            <div className="content_box">
                <div className="tit">
                    <h3>
                        <b>{boardTit}</b>
                        <SelectBox 
                            className="tit_select"
                            list={common.boardMenu}
                            selected={boardTit}
                            onChangeHandler={(e)=>{
                                titSelectChangeHandler(e);
                            }}
                            selHidden={true}
                            objectSel={`board_title`}
                        />
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
                                    list={["제목만","제목+내용","작성자"]}
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
                            <span>선택한 게시글</span>
                            <span>총 <b>{CF.MakeIntComma(checkedNum)}</b>개</span>
                            {/* 동일한 게시판유형이있을때만 노출 */}
                            {boardData.board_Name && boardData.board_Name.length > 0 && <>
                                <SelectBox 
                                    className="select_type3"
                                    list={boardData.board_Name}
                                    selected={moveSelect}
                                    onChangeHandler={(e)=>{
                                        const val = e.currentTarget.value;
                                        setMoveSelect(val);
                                    }}
                                    selHidden={true}
                                    objectSel={`board_title`}
                                />
                                <span>(으)로</span>
                                <button type="button" className="btn_type8" onClick={moveBtnClickHandler}>이동</button>
                                <em>※ 게시판 유형이 동일할 시에만 게시글 이동이 가능합니다.</em>
                            </>}
                        </div>
                        <div className="util_right">
                            <button type="button" className="btn_type9" onClick={deltBtnClickHandler}>삭제</button>
                        </div>
                    </div>
                    <TableWrap 
                        className="tbl_wrap1"
                        colgroup={["80px","10%","auto","12%","9%","13%","13%"]}
                        thList={["","번호","제목","게시판 유형","작성자","작성일시","공지 설정"]}
                        tdList={boardData.board_list}
                        data={boardData}
                        type={"board"}
                        onNotiSettingHandler={notiSettingBtnClickHandler}
                    />
                    {boardData.board_list && boardData.board_list.length > 0 &&
                        <Pagination   
                            currentPage={boardData.current_page} //현재페이지 번호
                            startPage={boardData.start_page} //시작페이지 번호 
                            endPage={boardData.end_page} //보이는 끝페이지 번호 
                            lastPage={boardData.last_page} //총페이지 끝
                        />
                    }
                    {board_category != 50 && //제휴문의 일때만 작성하기 버튼없애기
                        <div className={`board_btn_wrap${boardData.board_list && boardData.board_list.length > 0 ? "" : " none_list"}`}>
                            <Link to={`/console/board/post/write/${board_category}`} className="btn_type4">작성하기</Link>                                        
                        </div>
                    }
                </div>
            </div>
        </div>

        {/* 게시글 이동 confirm팝업 */}
        {moveConfirm && <ConfirmPop onClickHandler={moveHandler} />}

        {/* 게시글 삭제 confirm팝업 */}
        {deltConfirm && <ConfirmPop onClickHandler={deltHandler} />}

        {/* 게시글 공지설정 or 해제 confirm팝업 */}
        {notiSettingConfirm && <ConfirmPop onClickHandler={notiSettingHandler} />}

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default Board;