import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { enum_api_uri } from "../../config/enum";
import * as CF from "../../config/function";
import { confirmPop } from "../../store/popupSlice";
import { pageNoChange, checkedList } from "../../store/etcSlice";
import SelectBox from "../../components/component/SelectBox";
import SearchInput from "../../components/component/SearchInput";
import TableWrap from "../../components/component/admin/TableWrap";
import ConfirmPop from "../../components/popup/ConfirmPop";
import Pagination from "../../components/component/Pagination";


const CommentAll = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const etc = useSelector((state)=>state.etc);
    const comment_list = enum_api_uri.comment_list;
    const comment_delt = enum_api_uri.comment_delt;
    const [confirm, setConfirm] = useState(false);
    const [deltConfirm, setDeltConfirm] = useState(false);
    const [searchTxt, setSearchTxt] = useState("");
    const [boardData, setBoardData] = useState({});
    const [limit, setLimit] = useState(10);
    const [searchType, setSearchType] = useState("댓글내용");
    const [checkList, setCheckList] = useState([]);
    const [checkedNum, setCheckedNum] = useState(0);



    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
            setDeltConfirm(false);
        }
    },[popup.confirmPop]);


     //게시판정보 가져오기
     const getBoardData = (page) => {
        let search;
        if(searchType == "댓글내용"){
            // search = "title";
        }else if(searchType == "제목만"){
            search = "title";
        }else if(searchType == "제목+내용"){
            search = "titlecontents";
        }else if(searchType == "작성자"){
            search = "name";
        } 

        axios.get(`${comment_list.replace(":limit",limit)}?page=${page ? page : 1}${searchTxt.length > 0 ? "&search="+search+"&searchtxt="+searchTxt : ""}`,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                let data = res.data.data;
                setBoardData(data);
                console.log(data)
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


    //맨처음 리스트 idx값만 배열로 (전체 체크박스리스트 만들기)
    useEffect(()=>{
        if(boardData.hasOwnProperty("comment_list")){
            const list = boardData.comment_list.map((item) => item.idx).filter(Boolean);
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


    //삭제버튼 클릭시
    const deltBtnClickHandler = () => {
        if(checkedNum > 0){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'해당 댓글을 삭제하시겠습니까?',
                confirmPopBtn:2,
            }));
            setDeltConfirm(true);
        }else if(checkedNum === 0){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'댓글을 선택해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }
    };


    //댓글 삭제하기
    const deltHandler = () => {
        const body = {
            idx: etc.checkedList,
        };
        axios.delete(comment_delt,
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
            <div className="content_box">
                <div className="tit tit2">
                    <h3>
                        <b>전체</b>
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
                                    list={["댓글내용","제목만","제목+내용","작성자"]}
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
                            <span>선택한 댓글</span>
                            <span>총 <b>{CF.MakeIntComma(checkedNum)}</b>개</span>
                        </div>
                        <div className="util_right">
                            <button type="button" className="btn_type9" onClick={deltBtnClickHandler}>삭제</button>
                        </div>
                    </div>
                    <TableWrap 
                        className="tbl_wrap1 tbl_wrap1_1"
                        colgroup={["80px","auto","9%","18%","9%","13%"]}
                        thList={["","댓글내용","게시판명","원문 제목","작성자","작성일시"]}
                        tdList={boardData.comment_list}
                        type={"comment"}
                    />
                    {boardData.comment_list && boardData.comment_list.length > 0 &&
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

        {/* 댓글 삭제 confirm팝업 */}
        {deltConfirm && <ConfirmPop onClickHandler={deltHandler} />}

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default CommentAll;