import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { enum_api_uri } from "../../config/enum";
import * as CF from "../../config/function";
import { confirmPop } from "../../store/popupSlice";
import { pageNoChange } from "../../store/etcSlice";
import { listPageData, detailPageBack } from "../../store/commonSlice";
import SelectBox from "../../components/component/SelectBox";
import SearchInput from "../../components/component/SearchInput";
import TableWrap from "../../components/component/admin/TableWrap";
import ConfirmPop from "../../components/popup/ConfirmPop";
import Pagination from "../../components/component/Pagination";


const Maint = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const maint_list = enum_api_uri.maint_list;
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const etc = useSelector((state)=>state.etc);
    const common = useSelector((state)=>state.common);
    const [confirm, setConfirm] = useState(false);
    const [searchTxt, setSearchTxt] = useState("");
    const [boardData, setBoardData] = useState({});
    const [limit, setLimit] = useState(10);
    const [searchType, setSearchType] = useState("제목만");
    const [process, setProcess] = useState("");
    const [processList, setProcessList] = useState(["접수완료","협의중","검토중","작업중","처리완료","무상처리","재요청","입금대기중"]);
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
        }
    },[popup.confirmPop]);


    //게시판정보 가져오기
    const getBoardData = (page) => {
        let processTxt;
        let limitNum;
        let pageNum;
        let search;
        let searchText = '';

        //상세페이지에서 뒤로가기시 저장된 리스트페이지 정보로 조회
        if(common.detailPageBack){
            processTxt = common.listPageData.process;
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

            setProcess(processTxt);
            setLimit(limitNum);
            setSearchType(type);
            setSearchTxt(searchText);
        }else{
            processTxt = process;
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

        axios.get(`${maint_list.replace(":category",user.maintName)}?page=${pageNum ? pageNum : 1}&getLimit=${limitNum}${searchText.length > 0 ? "&search="+search+"&searchtxt="+searchText : ""}${processTxt.length > 0 ? "&process="+processTxt : ""}`,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                let data = res.data.data;
                setBoardData(data);

                //리스트페이지 조회 데이터저장
                let pageData = {
                    process: process,
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



    return(<>
        <div className="page_admin_maint">
            <div className="content_box">
                <div className="maint_notice">
                    <div className="maint_box">
                        <img src="https://likeweb.co.kr/admin/banner2.jpg" alt="이미지" />
                        <button type="button" onClick={()=>{window.open("https://www.likeweb.co.kr/")}} className="btn_likeweb"><strong><b>LIKE</b>WEB</strong> 바로가기</button>
                    </div>
                </div>
                <div className="tit tit2">
                    <strong>총 {boardData.total_count ? CF.MakeIntComma(boardData.total_count) : 0}건</strong>
                </div>
                <div className="board_section">
                    <div className="form_search_wrap">
                        <div className="search_wrap">
                            <SelectBox 
                                className="select_type3 select_status"
                                list={processList}
                                selected={process}
                                onChangeHandler={(e)=>{
                                    const val = e.currentTarget.value;
                                    setProcess(val);
                                }}
                                required={true}
                                hiddenTxt={`진행상황 선택`}
                            />
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
                    <TableWrap 
                        className="tbl_wrap1"
                        colgroup={["12%","auto","12%","9%","15%"]}
                        thList={["번호","제목","작성자","진행상황","작성일"]}
                        tdList={boardData.board_list}
                        data={boardData}
                        type={"maint"}
                    />
                    {boardData.board_list && boardData.board_list.length > 0 &&
                        <Pagination   
                            currentPage={boardData.current_page} //현재페이지 번호
                            startPage={boardData.start_page} //시작페이지 번호 
                            endPage={boardData.end_page} //보이는 끝페이지 번호 
                            lastPage={boardData.last_page} //총페이지 끝
                        />
                    }
                    <div className={`board_btn_wrap${boardData.board_list && boardData.board_list.length > 0 ? "" : " none_list"}`}>
                        <Link to={`/console/maint/write`} className="btn_type4">작성</Link>                                       
                    </div>
                </div>
            </div>
        </div>

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default Maint;