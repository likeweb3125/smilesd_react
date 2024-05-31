import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { enum_api_uri } from "../../../config/enum";
import * as CF from "../../../config/function";
import { confirmPop } from "../../../store/popupSlice";
import { pageNoChange, inquiryDetailIdx } from "../../../store/etcSlice";
import { boardSettingData, listPageData, detailPageBack } from "../../../store/commonSlice";
import { passOk } from "../../../config/constants";
import SearchInput from "../../../components/component/SearchInput";
import ListInquiry from "../../../components/component/user/ListInquiry";
import Pagination from "../../../components/component/Pagination";
import ConfirmPop from "../../../components/popup/ConfirmPop";


const MyInquiry = () => {
    const dispatch = useDispatch();
    const board_list = enum_api_uri.board_list;
    const board_detail = enum_api_uri.board_detail;
    const board_modify = enum_api_uri.board_modify;
    const popup = useSelector((state)=>state.popup);
    const etc = useSelector((state)=>state.etc);
    const common = useSelector((state)=>state.common);
    const user = useSelector((state)=>state.user);
    const [confirm, setConfirm] = useState(false);
    const [deltConfirm, setDeltConfirm] = useState(false);
    const [searchTxt, setSearchTxt] = useState("");
    const [boardData, setBoardData] = useState({});
    const [detailData, setDetailData] = useState({});
    const [scrollMove, setScrollMove] = useState(false);
    const [writeBtn, setWriteBtn] = useState(false);
    const [deltIdx, setDeltIdx] = useState(null);
    const [tabList, setTabList] = useState([]);
    const [tabOn, setTabOn] = useState(null);


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
            setDeltConfirm(false);
        }
    },[popup.confirmPop]);


    //헤더메뉴중 문의게시판 찾기
    useEffect(()=>{
        const data = common.headerMenuList;
        const filteredData = [];

        function findObjects(obj) {
            if (obj.c_content_type && obj.c_content_type[0] === 7) {
                filteredData.push(obj);
            }
            if (obj.submenu) {
                obj.submenu.forEach(subItem => findObjects(subItem));
            }
        }
        
        data.forEach(item => findObjects(item));

        setTabList(filteredData);

    },[common.headerMenuList]);


    //tabList 값 변경시
    useEffect(()=>{
        if(tabList.length > 0){
            const id = tabList[0].id;
            setTabOn(id);
        }else{
            setTabOn(null);
        }
    },[tabList]);


    //탭변경시 문의글상세 on 초기화
    useEffect(()=>{
        setDetailData({});
        dispatch(inquiryDetailIdx(null));
    },[tabOn])


    //게시판리스트정보 가져오기
    const getBoardData = (page) => {
        let pageNum;
        let searchText = '';

        //상세페이지에서 뒤로가기시 저장된 리스트페이지 정보로 조회
        if(common.detailPageBack){
            pageNum = common.listPageData.page;
            searchText = common.listPageData.searchTxt;
            setSearchTxt(searchText);
        }else{
            pageNum = page;
            searchText = searchTxt;
        }

        axios.get(`${board_list.replace(":category",tabOn).replace(":limit",10)}?page=${pageNum ? pageNum : 1}${searchText.length > 0 ? "&search=title&searchtxt="+searchText : ""}&group_id=&m_email=${user.loginUser.m_email}`,
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
                    page: page,
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
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt: err_msg,
                confirmPopBtn:1,
            }));
            setConfirm(true);
        });
    };


    //게시판리스트정보 가져오기
    useEffect(()=>{
        if(tabOn){
            getBoardData();
        }
    },[tabOn]);


    //페이지네이션 클릭으로 페이지변경시
    useEffect(()=>{
        if(etc.pageNoChange){
            getBoardData(etc.pageNo);

            dispatch(pageNoChange(false));
        }
    },[etc.pageNo,etc.pageNoChange]);


    //제목클릭시 내용토글
    const onDetailToggleHandler = (secret, idx, show) => {
        if(show){
            setDetailData({});
        }else{
            getDetailData(idx);
        }
    };


    //글상세정보 가져오기
    const getDetailData = (idx) => {
        axios.get(`${board_detail.replace(":category",tabOn).replace(":idx",idx)}${'?pass='+passOk}`)
        .then((res)=>{
            if(res.status === 200){
                const data = res.data.data;
                setDetailData(data);
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


    useEffect(()=>{
        if(etc.inquiryDetailIdx){
            getDetailData(etc.inquiryDetailIdx);
            
            dispatch(inquiryDetailIdx(null));
        }
    },[etc.inquiryDetailIdx]);


    //삭제버튼 클릭시
    const deltBtnClickHandler = (idx) => {
        setDeltIdx(idx);

        dispatch(confirmPop({
            confirmPop:true,
            confirmPopTit:'알림',
            confirmPopTxt:'해당 게시글을 삭제하시겠습니까?',
            confirmPopBtn:2,
        }));
        setDeltConfirm(true);
    };


    //게시글 삭제하기
    const deltHandler = () => {
        const body = {
            idx: deltIdx,
            category: tabOn,
            pass: passOk
        };
        axios.delete(`${board_modify}`,
            {
                data: body,
            }
        )
        .then((res)=>{
            if(res.status === 200){
                getBoardData();
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


    return(<>
        <div className="page_user_qna">
            <div className="section_inner">
                <div className="board_section">
                    {tabList.length > 0 &&
                        <div className="tab_wrap tm15">
                            <ul className="tab_type2">
                                {tabList.map((cont,i)=>{
                                    return(
                                        <li key={i} className={tabOn === cont.id ? 'on' : ''}>
                                            <button type="button" onClick={()=>setTabOn(cont.id)}>{cont.c_name}</button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    }
                    <div className="search_wrap tm24">
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
                    <div className="list_board_wrap">
                        <div className="board_util">
                            <em className="txt_total">전체 {boardData.total_count ? CF.MakeIntComma(boardData.total_count) : 0}건</em>
                        </div>
                        <ListInquiry
                            columnTitle={true}
                            columnDate={true}
                            columnView={true}
                            columnFile={true}
                            columnGroup={true}     //분류
                            list={boardData.board_list}
                            onDetailToggleHandler={onDetailToggleHandler}
                            detailData={detailData}
                            login={true}
                            onDeltHandler={deltBtnClickHandler}
                            category={tabOn}
                        />
                    </div>
                    {boardData.board_list && boardData.board_list.length > 0 &&
                        <Pagination 
                            currentPage={boardData.current_page} //현재페이지 번호
                            startPage={boardData.start_page} //시작페이지 번호 
                            endPage={boardData.end_page} //보이는 끝페이지 번호 
                            lastPage={boardData.last_page} //총페이지 끝
                        />
                    }
                </div>
            </div>
        </div>

        {/* 게시글삭제 confirm팝업 */}
        {deltConfirm && <ConfirmPop onClickHandler={deltHandler} />}

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default MyInquiry;