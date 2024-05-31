import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { enum_api_uri } from "../../config/enum";
import * as CF from "../../config/function";
import { confirmPop, adminMemberInfoPopModify, adminMsgPop } from "../../store/popupSlice";
import { pageNoChange, checkedList } from "../../store/etcSlice";
import SelectBox from "../../components/component/SelectBox";
import InputDatepicker from "../../components/component/admin/InputDatepicker";
import SearchInput from "../../components/component/SearchInput";
import TableWrap from "../../components/component/admin/TableWrap";
import ConfirmPop from "../../components/popup/ConfirmPop";
import Pagination from "../../components/component/Pagination";


const MemberManager = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const etc = useSelector((state)=>state.etc);
    const member_list = enum_api_uri.member_list;
    const level_list = enum_api_uri.level_list;
    const member_level = enum_api_uri.member_level;
    const member_modify = enum_api_uri.member_modify;
    const [confirm, setConfirm] = useState(false);
    const [changeConfirm, setChangeConfirm] = useState(false);
    const [cancelConfirm, setCancelConfirm] = useState(false);
    const [searchTxt, setSearchTxt] = useState("");
    const [boardData, setBoardData] = useState({});
    const [limit, setLimit] = useState(10);
    const [searchType, setSearchType] = useState("이메일");
    const [checkList, setCheckList] = useState([]);
    const [checkedNum, setCheckedNum] = useState(0);
    const [levelList, setLevelList] = useState([]);
    const [allLevelList, setAllLevelList] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [changeLevelNameSelect, setChangeLevelNameSelect] = useState('');
    const [changeLevelSelect, setChangeLevelSelect] = useState(null);
    const [smsMember, setSmsMember] = useState(0);


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
            setChangeConfirm(false);
            setCancelConfirm(false);
        }
    },[popup.confirmPop]);


    //회원등급리스트 가져오기
    const getLevelList = () => {
        axios.get(level_list,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                let data = res.data.data;
                //관리자제외 회원등급리스트
                const list = data
                .filter((item)=>item.l_name !== null)    //미등록등급 제외
                .filter((item)=>item.l_name.length > 0)  //미등록등급 제외
                .filter((item)=>item.l_level !== 9)      //관리자회원 제외
                
                setLevelList(list);

                //모든 회원등급리스트
                const allList = data
                .filter((item)=>item.l_name !== null)    //미등록등급 제외
                .filter((item)=>item.l_name.length > 0)  //미등록등급 제외

                setAllLevelList(allList);
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


    //맨처음 회원등급리스트 가져오기
    useEffect(()=>{
        getLevelList();
    },[]);


    //게시판정보 가져오기
    const getBoardData = (page) => {
        let search;
        if(searchType == "이메일"){
            search = "m_email";
        }else if(searchType == "회원명"){
            search = "m_name";
        }else if(searchType == "휴대폰"){
            search = "m_mobile";
        }

        let sdate;
        if(startDate){
            sdate = moment(startDate).format('YYYY.MM.DD');
        }
        let edate;
        if(endDate){
            edate = moment(endDate).format('YYYY.MM.DD');
        }

        axios.get(`${member_list}?page=${page ? page : 1}&getLimit=${limit}&m_level=${9}${searchTxt.length > 0 ? "&search="+search+"&searchtxt="+searchTxt : ""}${startDate ? "&sdate="+sdate : ""}${endDate ? "&edate="+edate : ""}`,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                let data = res.data.data;
                setBoardData(data);

                //단체문자 회원수
                setSmsMember(data.total_count);
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
        if(boardData.hasOwnProperty("member_list")){
            const list = boardData.member_list.map((item) => item.idx).filter(Boolean);
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

        //단체문자 회원수
        let memberNum = num;
        if(num > 0){
            setSmsMember(memberNum);
        }else{
            memberNum = boardData.total_count;
            setSmsMember(memberNum);
        }
    },[etc.checkedList]);


    //회원정보 변경시 게시판리스트정보 가져오기
    useEffect(()=>{
        if(popup.adminMemberInfoPopModify){
            dispatch(adminMemberInfoPopModify(false));
            getBoardData();
        }
    },[popup.adminMemberInfoPopModify]);


    //회원등급 변경버튼 클릭시
    const onLevelChangeBtnClickHandler = () => {
        if(checkedNum > 0){
            if(changeLevelSelect){
                dispatch(confirmPop({
                    confirmPop:true,
                    confirmPopTit:'알림',
                    confirmPopTxt:'해당 회원의 등급을 '+changeLevelNameSelect+' 등급으로 변경하시겠습니까?',
                    confirmPopBtn:2,
                }));
                setChangeConfirm(true);
            }else{
                dispatch(confirmPop({
                    confirmPop:true,
                    confirmPopTit:'알림',
                    confirmPopTxt:'변경할 회원등급을 선택해주세요.',
                    confirmPopBtn:1,
                }));
                setConfirm(true);
            }
        }else{
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'회원을 선택해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }
    };

    
    //회원등급 변경하기
    const onLevelChangeHandler = () => {
        const body = {
            idx: etc.checkedList,
            m_level: changeLevelSelect
        };

        axios.put(member_level, body,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
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


    //회원탈퇴 버튼 클릭시
    const onMemberCancelBtnClickHandler = () => {
        if(checkedNum > 0){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'해당 회원을 탈퇴 처리하시겠습니까? <br/><br/>탈퇴한 회원은 복구가 되지 않으며, <br/>ㅇㅇ일간 등록한 이메일 정보로 재가입이 불가합니다. <br/>또한 탈퇴 회원 목록에서 ㅇㅇ일간 등록한 이메일 정보가 기록됩니다.',
                confirmPopBtn:2,
            }));
            setCancelConfirm(true);
        }else{
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'회원을 선택해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }
    };


    //회원탈퇴하기
    const onMemberCancelHandler = () => {
        const body = {
            idx: etc.checkedList,
        };
        axios.delete(member_modify,
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
        <div className="page_admin_member">
            <div className="content_box">
                <div className="search_detail_wrap search_detail_wrap2">
                    <div className="search_detail_box">
                        <div className="search_wrap">
                            <div className="search_box">
                                <SelectBox 
                                    className="select_type3"
                                    list={["이메일","회원명","휴대폰번호"]}
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
                        <div className="search_date">
                            <InputDatepicker 
                                selectedDate={startDate} 
                                ChangeHandler={(date)=>setStartDate(date)} 
                                txt={`시작일`}
                            />
                            <em>~</em>
                            <InputDatepicker 
                                selectedDate={endDate} 
                                ChangeHandler={(date)=>setEndDate(date)} 
                                txt={`종료일`}
                            />
                        </div>
                    </div>
                    <div className="btn_wrap">
                        <button type="button" className="btn_type15" onClick={()=>getBoardData()}>검색</button>
                    </div>
                </div>
                <div className="tit tit2">
                    <h3>
                        <b>전체 관리자</b>
                    </h3>
                    {boardData.member_list && <strong>총 {CF.MakeIntComma(boardData.member_list.length)}명</strong>}
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
                            <SelectBox 
                                className="select_type3"
                                list={allLevelList}
                                selected={changeLevelNameSelect}
                                onChangeHandler={(e)=>{
                                    const val = e.currentTarget.value;
                                    const level = e.target.options[e.target.selectedIndex].getAttribute("data-level");
                                    setChangeLevelNameSelect(val);
                                    setChangeLevelSelect(level);
                                }}
                                selHidden={true}
                                objectSel={`level`}
                            />
                            <span>(으)로</span>
                            <button type="button" className="btn_type8" onClick={onLevelChangeBtnClickHandler}>변경</button>
                            <button type="button" className="btn_type9" onClick={onMemberCancelBtnClickHandler}>회원 탈퇴</button>
                        </div>
                        <div className="util_right">
                            <div className="send_msg_wrap">
                                <div className="txt">
                                    <strong>단체문자</strong>
                                    <span>해당 회원 총 <b>{CF.MakeIntComma(smsMember)}</b>명</span>
                                </div>
                                <button type="button" className="btn_type8" onClick={()=>dispatch(adminMsgPop(true))}>전송</button>
                            </div>
                        </div>
                    </div>
                    <TableWrap 
                        className="tbl_wrap1"
                        colgroup={["80px","auto","9%","12%","9%","15%","9%","9%","9%"]}
                        thList={["","이메일","회원명","회원등급","가입일자","휴대폰번호","로그인수","게시글","댓글"]}
                        tdList={boardData.member_list}
                        type={"member"}
                    />
                    {boardData.member_list && boardData.member_list.length > 0 &&
                        <Pagination 
                            currentPage={boardData.current_page} //현재페이지 번호
                            startPage={boardData.start_page} //시작페이지 번호 
                            endPage={boardData.end_page} //보이는 끝페이지 번호 
                            lastPage={boardData.last_page} //총페이지 끝
                        />
                    }
                    <Link to="/console/member/cancel" className="btn_type17">탈퇴 회원 목록</Link>
                </div>
            </div>
        </div>

        {/* 회원등급변경 confirm팝업 */}
        {changeConfirm && <ConfirmPop onClickHandler={onLevelChangeHandler} />}

        {/* 회원탈퇴 confirm팝업 */}
        {cancelConfirm && <ConfirmPop onClickHandler={onMemberCancelHandler} />}

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default MemberManager;