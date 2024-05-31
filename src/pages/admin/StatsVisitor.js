import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { enum_api_uri } from "../../config/enum";
import * as CF from "../../config/function";
import { confirmPop, adminVisitorHistoryPop } from "../../store/popupSlice";
import SelectBox from "../../components/component/SelectBox";
import InputDatepicker from "../../components/component/admin/InputDatepicker";
import InputBox from "../../components/component/InputBox";
import TableWrap from "../../components/component/admin/TableWrap";
import ConfirmPop from "../../components/popup/ConfirmPop";


const StatsVisitor = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const stat_history = enum_api_uri.stat_history;
    const [confirm, setConfirm] = useState(false);
    const [searchTxt, setSearchTxt] = useState("");
    const [boardData, setBoardData] = useState({});
    const [searchType, setSearchType] = useState("");
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    

    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);


    //게시판정보 가져오기
    const getBoardData = (sDate, eDate) => {
        let start_date;
        if(sDate){
            start_date = moment(sDate).format('YYYY.MM.DD');
        }
        let end_date;
        if(eDate){
            end_date = moment(eDate).format('YYYY.MM.DD');
        }

        axios.get(`${stat_history}${searchTxt.length > 0 ? "?searchTxt="+searchTxt : "?searchTxt="}${sDate ? "&start="+start_date : ""}${eDate ? "&end="+end_date : ""}`,
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


    //게시판정보 가져오기
    useEffect(()=>{
        getBoardData();
    },[]);


    //날짜 셀렉트박스 값 변경시 datepicker 값 변경
    useEffect(()=>{
        let sDate = '';
        let eDate = new Date();

        if (searchType === '최근 1주') {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            sDate = oneWeekAgo;

        } else if (searchType === '1개월') {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            sDate = oneMonthAgo;

        } else if (searchType === '3개월') {
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            sDate = threeMonthsAgo;

        } else if (searchType === '6개월') {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            sDate = sixMonthsAgo;

        } else if (searchType === '직접 입력') {
            eDate = '';
        }else{
            eDate = '';
        }

        setStartDate(sDate);
        setEndDate(eDate);
    },[searchType]);


    //접속자 이력조회 검색하기
    const onSearchHandler = () => {
        if(searchType){
            if(searchType === '직접 입력' && (!startDate || !endDate)){
                dispatch(confirmPop({
                    confirmPop:true,
                    confirmPopTit:'알림',
                    confirmPopTxt:'직접입력시 날짜를 선택해주세요.',
                    confirmPopBtn:1,
                }));
                setConfirm(true);
            }
            getBoardData(startDate, endDate);
        }else{
            getBoardData();
        }
    };


    //입력 초기화
    const onResetHandler = () => {
        setSearchType('');
        setSearchTxt('');
    };


    return(<>
        <div className="page_admin_charts">
            <div className="content_box">
                <div className="tit">
                    <h3>
                        <b>접속자 이력 조회</b>
                    </h3>
                </div>
                <div className="search_detail_wrap">
                    <div className="search_detail_box">
                        <div className="search_wrap">
                            <div className="search_box">
                                <SelectBox 
                                    className="select_type3"
                                    list={["최근 1주","1개월","3개월","6개월","직접 입력"]}
                                    selected={searchType}
                                    onChangeHandler={(e)=>{
                                        const val = e.currentTarget.value;
                                        setSearchType(val);
                                    }}
                                    selHidden={true}
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
                        <InputBox
                            className="input_box" 
                            type={`text`}
                            placeholder={`접속자를 입력해주세요.`}
                            value={searchTxt}
                            onChangeHandler={(e)=>{
                                const val = e.currentTarget.value;
                                setSearchTxt(val);
                            }}
                        />
                    </div>
                    <div className="btn_wrap">
                        <button type="button" className="btn_type17" onClick={onResetHandler}>입력 초기화</button>
                        <button type="button" className="btn_type15" onClick={onSearchHandler}>검색</button>
                    </div>
                </div>
                <div className="most_box">
                    <div className="most_item">
                        <span>최다 접속 경로</span>
                        {boardData.logsTopUrl && <>
                            <strong>{boardData.logsTopUrl.previousUrl}</strong>
                            <button type="button" className="btn_type12" onClick={()=>dispatch(adminVisitorHistoryPop({adminVisitorHistoryPop:true, adminVisitorHistoryPopType:1}))}>상세보기</button>
                        </>}
                    </div>
                    <div className="most_item">
                        <span>최다 브라우저</span>
                        {boardData.logsTopAgent && <>
                            <strong>{boardData.logsTopAgent.userAgent}</strong>
                            <button type="button" className="btn_type12" onClick={()=>dispatch(adminVisitorHistoryPop({adminVisitorHistoryPop:true, adminVisitorHistoryPopType:2}))}>상세보기</button>
                        </>}
                    </div>
                </div>
                <div className="board_section">
                    <div className="tit">
                        {boardData.logs_list && <strong>총 {CF.MakeIntComma(boardData.logs_list.length)}개</strong>}
                    </div>
                    <TableWrap 
                        className="tbl_wrap1"
                        colgroup={["80px","12%","18%","auto","auto","20%"]}
                        thList={["번호","접속자","접속 IP","접속 경로","접속 브라우저","접근일시"]}
                        tdList={boardData.logs_list}
                        type={"visitor"}
                    />
                </div>
            </div>
        </div>

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default StatsVisitor;