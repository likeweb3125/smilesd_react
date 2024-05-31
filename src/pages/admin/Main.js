import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { enum_api_uri } from "../../config/enum";
import * as CF from "../../config/function";
import { confirmPop } from "../../store/popupSlice";
import TableWrap from "../../components/component/admin/TableWrap";
import ConfirmPop from "../../components/popup/ConfirmPop";


const Main = () => {
    const main_board_cnt = enum_api_uri.main_board_cnt;
    const main_board_list = enum_api_uri.main_board_list;
    const main_connector_cnt = enum_api_uri.main_connector_cnt;
    const main_connector_list = enum_api_uri.main_connector_list;
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const common = useSelector((state)=>state.common);
    const [confirm, setConfirm] = useState(false);
    const [boardCount, setBoardCount] = useState({});
    const [boardList, setBoardList] = useState([]);
    const [connectorCount, setConnectorCount] = useState({});
    const [connectorList, setConnectorList] = useState([]);
    const [boardMore, setBoardMore] = useState(null);


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);


    //최근게시글정보 가져오기
    const getBoardCount = () => {
        axios.get(`${main_board_cnt}`,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                let data = res.data.data;
                setBoardCount(data);
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


    //최근게시판 리스트 가져오기
    const getBoardList = () => {
        axios.get(`${main_board_list.replace(":limit",5)}`,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                let data = res.data.data;
                setBoardList(data);
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


    //최근접속자정보 가져오기
    const getConnectorCount = () => {
        axios.get(`${main_connector_cnt}`,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                let data = res.data.data;
                setConnectorCount(data);
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


    //접속자이력 리스트 가져오기
    const getConnectorList = () => {
        axios.get(`${main_connector_list.replace(":limit",5)}`,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                let data = res.data.data;
                setConnectorList(data);
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

    
    //맨처음 
    useEffect(()=>{
        getBoardCount();
        getBoardList();
        getConnectorCount();
        getConnectorList();
    },[]);

    
    useEffect(()=>{
        //게시판 리스트있으면 최근게시판조회 더보기 버튼 보이기
        if(common.boardMenu.length > 0){
            const cate = common.boardMenu[0].category;
            setBoardMore(cate);
        }else{
            setBoardMore(null);
        }
    },[common.boardMenu]);


    return(<>
        <div className="page_admin_main">
            <div className="main_con_wrap">
                <div className="main_con">
                    <div className="tit">
                        <h3>최근 게시글 정보</h3>
                    </div>
                    <div className="total_num_box">
                        <ul>
                            <li>
                                <span>총 게시글</span>
                                <strong><b>{boardCount.boardTotalCnt ? CF.MakeIntComma(boardCount.boardTotalCnt) : 0}</b> 개</strong>
                            </li>
                            <li>
                                <span>금일 게시글</span>
                                <strong><b>{boardCount.boardTodayCnt ? CF.MakeIntComma(boardCount.boardTodayCnt) : 0}</b> 개</strong>
                            </li>
                            <li>
                                <span>총 댓글</span>
                                <strong><b>{boardCount.commentTotalCnt ? CF.MakeIntComma(boardCount.commentTotalCnt) : 0}</b> 개</strong>
                            </li>
                            <li>
                                <span>금일 댓글</span>
                                <strong><b>{boardCount.commentTodayCnt ? CF.MakeIntComma(boardCount.commentTodayCnt) : 0}</b> 개</strong>
                            </li>
                        </ul>
                    </div>
                    <div className="board_box">
                        <h4>최근 게시판 조회</h4>
                        <TableWrap 
                            className="tbl_wrap1"
                            colgroup={["12%","18%","auto","30%"]}
                            thList={["번호","게시판명","제목","작성일시"]}
                            tdList={boardList}
                            type={"main_board"}
                        />
                        {boardMore !== null && <Link to={`/console/board/post/${boardMore}`} className="btn_more">더보기</Link>}
                    </div>
                </div>
                <div className="main_con">
                        <div className="tit">
                            <h3>최근 접속자 정보</h3>
                        </div>
                        <div className="total_num_box">
                            <ul>
                                <li>
                                    <span>총 가입회원</span>
                                    <strong><b>{connectorCount.memberTotalCnt ? CF.MakeIntComma(connectorCount.memberTotalCnt) : 0}</b> 명</strong>
                                </li>
                                <li>
                                    <span>금일 가입회원</span>
                                    <strong><b>{connectorCount.memberTodayCnt ? CF.MakeIntComma(connectorCount.memberTodayCnt) : 0}</b> 명</strong>
                                </li>
                                <li>
                                    <span>총 방문</span>
                                    <strong><b>{connectorCount.logsTotalCnt ? CF.MakeIntComma(connectorCount.logsTotalCnt) : 0}</b> 명</strong>
                                </li>
                                <li>
                                    <span>금일 방문</span>
                                    <strong><b>{connectorCount.logsTodayCnt ? CF.MakeIntComma(connectorCount.logsTodayCnt) : 0}</b> 명</strong>
                                </li>
                            </ul>
                        </div>
                        <div className="board_box">
                            <h4>접속자 이력 조회</h4>
                            <div className="tbl_wrap1">
                                <TableWrap 
                                    className="tbl_wrap1"
                                    colgroup={["12.12%","27.27%","auto","30.30%"]}
                                    thList={["접속자","접속 IP","접속 브라우저","접속일시"]}
                                    tdList={connectorList}
                                    type={"main_connector"}
                                />
                            </div>
                            {/* <a href="#" rel="noopener noreferrer" className="btn_more">더보기</a> */}
                        </div>
                    </div>
            </div>
        </div>

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default Main;