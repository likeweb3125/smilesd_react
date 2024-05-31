import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { enum_api_uri } from "../../config/enum";
import * as CF from "../../config/function";
import { confirmPop } from "../../store/popupSlice";
import { pageNoChange } from "../../store/etcSlice";
import { boardSettingData, listPageData, detailPageBack } from "../../store/commonSlice";
import SearchInput from "../../components/component/SearchInput";
import ListBoard from "../../components/component/user/ListBoard";
import ListGallery from "../../components/component/user/ListGallery";
import Pagination from "../../components/component/Pagination";
import ConfirmPop from "../../components/popup/ConfirmPop";


const Board = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const board_list = enum_api_uri.board_list;
    const popup = useSelector((state)=>state.popup);
    const etc = useSelector((state)=>state.etc);
    const common = useSelector((state)=>state.common);
    const user = useSelector((state)=>state.user);
    const { menu_idx } = useParams();
    const [confirm, setConfirm] = useState(false);
    const [searchTxt, setSearchTxt] = useState("");
    const [menuData, setMenuData] = useState({});
    const [boardData, setBoardData] = useState({});
    const [limit, setLimit] = useState(null);
    const [scrollMove, setScrollMove] = useState(false);
    const [writeBtn, setWriteBtn] = useState(false);


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
        }
    },[popup.confirmPop]);


    //현재선택된 헤더메뉴데이터값 변경시
    useEffect(()=>{
        setMenuData(common.currentMenuData);
    },[common.currentMenuData]);


    //현재게시판 목록설정값 적용
    useEffect(()=>{
        if(menuData && menuData.b_list_cnt){
            setLimit(menuData.b_list_cnt);
        }
    },[menuData]);


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

        axios.get(`${board_list.replace(":category",menu_idx).replace(":limit",limit)}?page=${pageNum ? pageNum : 1}${searchText.length > 0 ? "&search=title&searchtxt="+searchText : ""}&group_id=`)
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

    //게시판 상세정보 값 가져오고, limit 값이 변경되면 게시판리스트정보 가져오기
    useEffect(()=>{
        if(limit){
            getBoardData();
        }
    },[limit, menu_idx]);


    //페이지네이션 클릭으로 페이지변경시
    useEffect(()=>{
        if(etc.pageNoChange){
            getBoardData(etc.pageNo);

            dispatch(pageNoChange(false));
        }
    },[etc.pageNo,etc.pageNoChange]);


    //글작성 권한 체크하기
    useEffect(()=>{
        const level = boardData.b_write_lv;
        const login = user.loginStatus;

        //전체이용가능일때 작성가능
        if(level === 0){
            setWriteBtn(true);
        }else{
            //회원일때
            if(login){
                const mLevel = user.loginUser.m_level;

                //관리자레벨 권한일때
                if(level === 9){
                    if(mLevel == 9){
                        setWriteBtn(true);
                    }else{
                        setWriteBtn(false);
                    }
                }
                //다른레벨 권한일때
                else{
                    if(mLevel >= level){
                        setWriteBtn(true);
                    }else{
                        setWriteBtn(false);
                    }
                }
            }
            //비회원일때 작성불가능
            else{
                setWriteBtn(false);
            }
        }
    },[boardData]);



    return(<>
        <div className="page_user_board">
            <div className="section_inner">
                <div className="board_section">
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
                    {menuData.c_content_type && menuData.c_content_type[0] === 4 ? //일반게시판일때
                        <div className="list_board_wrap">
                            <div className="board_util">
                                <em className="txt_total">전체 {boardData.total_count ? CF.MakeIntComma(boardData.total_count) : 0}건</em>
                            </div>
                            <ListBoard
                                columnTitle={boardData.b_column_title == 'Y' ? true : false}
                                columnDate={boardData.b_column_date == 'Y' ? true : false}
                                columnView={boardData.b_column_view == 'Y' ? true : false}
                                columnFile={boardData.b_column_file == 'Y' ? true : false}
                                list={boardData.board_list}
                            />
                        </div>
                        :menuData.c_content_type && menuData.c_content_type[0] === 5 && //갤러리게시판일때
                        <div className="gallery_board">
                            <ListGallery
                                columnTitle={boardData.b_column_title == 'Y' ? true : false}
                                columnDate={boardData.b_column_date == 'Y' ? true : false}
                                columnView={boardData.b_column_view == 'Y' ? true : false}
                                columnFile={boardData.b_column_file == 'Y' ? true : false}
                                list={boardData.board_list}
                            />
                        </div>
                    }
                    {writeBtn &&
                        <div className={`board_btn_wrap${boardData.board_list && boardData.board_list.length > 0 ? "" : " none_list"}`}>
                            <Link to={`/sub/board/write/${menu_idx}`} className="btn_type21">글 작성하기</Link>
                        </div>
                    }
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

export default Board;