import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { enum_api_uri } from "../../config/enum";
import * as CF from "../../config/function";
import { confirmPop } from "../../store/popupSlice";
import { pageNoChange, checkedList } from "../../store/etcSlice";
import SelectBox from "../../components/component/SelectBox";
import TxtSelectBox from "../../components/component/admin/TxtSelectBox";
import InputDatepicker from "../../components/component/admin/InputDatepicker";
import SearchInput from "../../components/component/SearchInput";
import InputBox from "../../components/component/InputBox";
import TableWrap from "../../components/component/admin/TableWrap";
import ConfirmPop from "../../components/popup/ConfirmPop";
import Pagination from "../../components/component/Pagination";


const MemberCancel = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const etc = useSelector((state)=>state.etc);
    const member_cancel_list = enum_api_uri.member_cancel_list;
    const [confirm, setConfirm] = useState(false);
    const [deltConfirm, setDeltConfirm] = useState(false);
    const [boardData, setBoardData] = useState({});
    const [limit, setLimit] = useState(10);
    const [searchType, setSearchType] = useState("이메일");
    const [checkList, setCheckList] = useState([]);
    const [checkedNum, setCheckedNum] = useState(0);
    const [email, setEmail] = useState('');


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
        if(searchType == "이메일"){
            search = "m_email";
        }

        axios.get(`${member_cancel_list}?page=${page ? page : 1}&getLimit=${limit}${email.length > 0 ? "&search="+search+"&searchtxt="+email : ""}`,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                let data = res.data.data;
                setBoardData(data);
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
        if(boardData.hasOwnProperty("secession_list")){
            const list = boardData.secession_list.map((item) => item.id).filter(Boolean);
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


   


    return(<>
        <div className="page_admin_member">
            <div className="content_box">
                <div className="search_detail_wrap">
                    <div className="search_detail_box">
                        <div className="search_wrap">
                            <div className="search_box">
                                <div className="search_input">
                                    <InputBox
                                        className="input_box" 
                                        type={`text`}
                                        placeholder={`이메일을 입력해주세요.`}
                                        value={email}
                                        onChangeHandler={(e)=>{
                                            const val = e.currentTarget.value;
                                            setEmail(val);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="btn_wrap">
                        <button type="button" className="btn_type15" onClick={()=>getBoardData()}>검색</button>
                    </div>
                </div>
                <div className="tit tit2">
                    <h3>
                        <b>탈퇴 회원</b>
                    </h3>
                    <strong>총 {boardData.total_count ? CF.MakeIntComma(boardData.total_count) : 0}명</strong>
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
                                limitSel={`명씩`}
                            />
                        </div>
                    </div>
                    <div className="board_table_util flex_wrap">
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
                            <span>선택한 회원</span>
                            <span>총 <b>{CF.MakeIntComma(checkedNum)}</b>명</span>
                        </div>
                        <div className="util_right">
                            <button type="button" className="btn_type9">회원 정보 영구 삭제</button>
                        </div>
                    </div>
                    <TableWrap 
                        className="tbl_wrap1"
                        colgroup={["80px","auto"]}
                        thList={["","이메일"]}
                        tdList={boardData.secession_list}
                        type={"member_cancel"}
                    />
                    {boardData.secession_list && boardData.secession_list.length > 0 &&
                        <Pagination 
                            currentPage={boardData.current_page} //현재페이지 번호
                            startPage={boardData.start_page} //시작페이지 번호 
                            endPage={boardData.end_page} //보이는 끝페이지 번호 
                            lastPage={boardData.last_page} //총페이지 끝
                        />
                    }
                    <p className="txt">* 탈퇴 회원 이메일은 별도로 관리하여 일정기간 내에는 재가입이 불가하도록 자동으로 처리됩니다.</p>
                </div>
            </div>
        </div>

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default MemberCancel;