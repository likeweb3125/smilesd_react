import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { enum_api_uri } from "../../config/enum";
import * as CF from "../../config/function";
import { confirmPop } from "../../store/popupSlice";
import CommentWrap from "../../components/component/admin/CommentWrap";
import ConfirmPop from "../../components/popup/ConfirmPop";
import InputBox from "../../components/component/InputBox";


const MaintDetail = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { list_no } = useParams();
    const maint_detail = enum_api_uri.maint_detail;
    const maint_comment_list = enum_api_uri.maint_comment_list;
    const maint_comment = enum_api_uri.maint_comment;
    const maint_file_down = enum_api_uri.maint_file_down;
    const user = useSelector((state)=>state.user);
    const popup = useSelector((state)=>state.popup);
    const [confirm, setConfirm] = useState(false);
    const [boardData, setBoardData] = useState({});
    const [commentList, setCommentList] = useState([]);
    const [comment, setComment] = useState("");


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);


    //게시글정보 가져오기
    const getBoardData = () => {
        axios.get(`${maint_detail.replace(":category",user.maintName).replace(":list_no",list_no)}`,
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


    //게시글댓글리스트 가져오기
    const getCommentList = () => {
        axios.get(`${maint_comment_list.replace(":list_no",list_no)}`,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                let data = res.data.data;
                setCommentList(data);
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
        getBoardData();
        getCommentList();
    },[list_no]);


    
    //첨부파일 다운로드
    const fileDownHandler = (name) => {
        axios.get(`${maint_file_down.replace(":list_no",list_no)}`,
            {
                headers:{Authorization: `Bearer ${user.loginUser.accessToken}`},
                responseType: 'blob' // 요청 데이터 형식을 blob으로 설정
            }
        )
        .then((res)=>{
            if(res.status === 200){
                const blob = new Blob([res.data], { type: 'application/octet-stream' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = name; // 파일명 설정
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
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


    //댓글 300자초과시 알림팝업 띄우기
    useEffect(()=>{
        if(comment.length === 300){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'300 자 초과하였습니다.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }
    },[comment]);


    //댓글 textarea 값 변경시
    const onTextChangeHandler = (e) => {
        const val = e.currentTarget.value;
        setComment(val);
    };


    //댓글등록버튼 클릭시
    const enterBtnClickHandler = () => {
        if(comment.length == 0){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'댓글을 입력해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }else{
            enterHandler();
        }
    };


    //댓글등록하기
    const enterHandler = () => {
        const body = {
            list_no: list_no,
            c_name: user.maintName,
            c_content: comment,
            m_id: "",
            c_password: "",
            c_table: "admin",
        };
        axios.post(`${maint_comment}`, body, 
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                getCommentList();
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
        <div className="page_admin_board">
            <div className="content_box">
                <div className="tit">
                    <h3>
                        <b>서비스 관리 및 유지보수 시스템</b>
                    </h3>
                </div>
                <div className="board_section">
                    <div className="board_view">
                        <div className="board_tit_box">
                            <div className="board_tit">
                                <h5>{boardData.subject}</h5>
                                <ul className="board_info">
                                    <li>
                                        <strong>{boardData.name}</strong>
                                    </li>
                                    <li>
                                        <em>{boardData.w_date}</em>
                                    </li>
                                    <li>
                                        <span className="view_cnt">{CF.MakeIntComma(boardData.counter)}</span>
                                    </li>
                                </ul>
                            </div>
                            <p className={`txt_process${boardData.process == "처리완료" ? " txt_color1" : boardData.process == "접수완료" ? " txt_color3" : boardData.process == "재요청" ? " txt_color2" : boardData.process == "검토중" ? " txt_color4" : ""}`}>{boardData.process}</p>
                        </div>
                        <div className="board_con">
                            <div className="con" dangerouslySetInnerHTML={{ __html: boardData.contents }}></div>
                            {boardData.b_file && boardData.b_file.length > 0 &&
                                <div className="file_section">
                                    <span>첨부파일</span>
                                    <div>
                                        {boardData.b_file && 
                                            <button type="button"
                                                onClick={()=>{
                                                    fileDownHandler(boardData.b_file);
                                                }}
                                            >{boardData.b_file.replace("upload/board/","")}</button>
                                        }
                                    </div>
                                </div>
                            }
                            <CommentWrap 
                                list={commentList}
                                name={user.maintName}
                                comment={comment}
                                onTextChangeHandler={onTextChangeHandler}
                                onEnterHandler={enterBtnClickHandler}
                            />
                        </div> 
                    </div>
                    <div className="btn_list_wrap tm30">
                        <button type="button" className="btn_type3" onClick={()=>{navigate(-1)}}>목록</button>
                    </div>
                </div>
            </div>
        </div>


        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default MaintDetail;