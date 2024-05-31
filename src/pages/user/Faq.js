import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { enum_api_uri } from "../../config/enum";
import * as CF from "../../config/function";
import { confirmPop } from "../../store/popupSlice";
import { pageNoChange } from "../../store/etcSlice";
import { listPageData, detailPageBack } from "../../store/commonSlice";
import SearchInput from "../../components/component/SearchInput";
import ListFaq from "../../components/component/user/ListFaq";
import Pagination from "../../components/component/Pagination";
import ConfirmPop from "../../components/popup/ConfirmPop";


const Faq = () => {
    const dispatch = useDispatch();
    const board_group_list = enum_api_uri.board_group_list;
    const board_list = enum_api_uri.board_list;
    const board_detail = enum_api_uri.board_detail;
    const popup = useSelector((state)=>state.popup);
    const etc = useSelector((state)=>state.etc);
    const common = useSelector((state)=>state.common);
    const { menu_idx } = useParams();
    const [confirm, setConfirm] = useState(false);
    const [searchTxt, setSearchTxt] = useState("");
    const [menuData, setMenuData] = useState({});
    const [boardData, setBoardData] = useState({});
    const [limit, setLimit] = useState(null);
    const [detailData, setDetailData] = useState({});
    const [tabList, setTabList] = useState([]);
    const [tabOn, setTabOn] = useState(0);
    const [firstTime, setFirstTime] = useState(true);
    

    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);


    useEffect(()=>{
        setMenuData(common.currentMenuData);
    },[common.currentMenuData]);


    useEffect(()=>{
        if(menuData && menuData.b_list_cnt){
            setLimit(menuData.b_list_cnt);
        }
    },[menuData]);


    //게시판분류리스트 가져오기
    const getGroupList = () => {
        axios.get(`${board_group_list.replace(":parent_id",menu_idx)}`)
        .then((res)=>{
            if(res.status === 200){
                const data = res.data.data;
                const newList = data.filter((item)=>item.g_num !== "0"); //숨긴분류 제외
                setTabList(newList);
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


    //맨처음 게시판분류리스트 가져오기
    useEffect(()=>{
        getGroupList();
    },[menu_idx]);



    //게시판리스트정보 가져오기
    const getBoardData = (page) => {
        let tab = '';
        if(tabOn > 0){
            tab = tabOn;
        }

        axios.get(`${board_list.replace(":category",menu_idx).replace(":limit",limit)}?page=${page ? page : 1}${searchTxt.length > 0 ? "&search=title&searchtxt="+searchTxt : ""}&group_id=${tab}`)
        .then((res)=>{
            if(res.status === 200){
                let data = res.data.data;
                setBoardData(data);
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

    //게시판 상세정보 값 가져오고, limit 값이 변경되면 게시판리스트정보 가져오기
    useEffect(()=>{
        if(limit){
            getBoardData();

            if(firstTime){
                setFirstTime(false);
            }
        }
    },[limit]);


    //페이지네이션 클릭으로 페이지변경시
    useEffect(()=>{
        if(etc.pageNoChange){
            getBoardData(etc.pageNo);

            dispatch(pageNoChange(false));
        }
    },[etc.pageNo,etc.pageNoChange]);



    useEffect(()=>{
        if(!firstTime){
            getBoardData();
            setDetailData({});
        }
    },[tabOn]);


    //제목클릭시 내용토글
    const onDetailToggleHandler = (idx, show) => {
        if(show){
            setDetailData({});
        }else{
            getDetailData(idx);
        }
    };


    //글상세정보 가져오기
    const getDetailData = (idx) => {
        axios.get(`${board_detail.replace(":category",menu_idx).replace(":idx",idx)}`)
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



    return(<>
        <div className="page_user_board page_user_faq">
            <div className="section_inner">
                <div className="board_section">
                    {tabList.length > 0 &&
                        <ul className="tab_type4">
                            <li className={tabOn === 0 ? 'on' : ''}>
                                <button type="button" 
                                    onClick={()=>setTabOn(0)}
                                >전체</button>
                            </li>
                            {tabList.map((cont,i)=>{
                                return(
                                    <li key={i} className={tabOn === cont.id ? 'on' : ''}>
                                        <button type="button" onClick={()=>setTabOn(cont.id)}>{cont.g_name}</button>
                                    </li>
                                );
                            })}
                        </ul>
                    }
                    <div className="search_wrap">
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
                        <ListFaq
                            columnGroup={boardData.b_group == 'Y' ? true : false}     //분류
                            list={boardData.board_list}
                            onDetailToggleHandler={onDetailToggleHandler}
                            detailData={detailData}
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

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default Faq;