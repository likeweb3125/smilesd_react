import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { enum_api_uri } from "../../config/enum";
import * as CF from "../../config/function";
import history from "../../config/history";
import { confirmPop } from "../../store/popupSlice";
import { detailPageBack } from "../../store/commonSlice";
import { passOk } from "../../config/constants";
import CommentWrap2 from "../../components/component/CommentWrap2";
import ConfirmPop from "../../components/popup/ConfirmPop";
import InputBox from "../../components/component/InputBox";


const BoardDetail = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { board_category, board_idx } = useParams();
    const api_uri = enum_api_uri.api_uri;
    const board_detail = enum_api_uri.board_detail;
    const board_modify = enum_api_uri.board_modify;
    const board_file_down = enum_api_uri.board_file_down;
    const board_reply = enum_api_uri.board_reply;
    const board_comment_list = enum_api_uri.board_comment_list;
    const board_comment = enum_api_uri.board_comment;
    const user = useSelector((state)=>state.user);
    const popup = useSelector((state)=>state.popup);
    const common = useSelector((state)=>state.common);
    const [confirm, setConfirm] = useState(false);
    const [deltConfirm, setDeltConfirm] = useState(false);
    const [commentDeltConfirm, setCommentDeltConfirm] = useState(false);
    const [title, setTitle] = useState("");
    const [boardData, setBoardData] = useState({});
    const [boardSettingData, setBoardSettingData] = useState({});
    const [answerTxt, setAnswerTxt] = useState(null);
    const [commentList, setCommentList] = useState([]);
    const [comment, setComment] = useState("");
    const [replyComment, setReplyComment] = useState("");
    const [editComment, setEditComment] = useState("");
    const [editShow, setEditShow] = useState(null);
    const [replyEnterOk, setReplyEnterOk] = useState(false);
    const [deltCommentIdx, setDeltCommentIdx] = useState(null);
    const [name, setName] = useState('');


    //상세페이지 뒤로가기
    useEffect(() => {
        const listenBackEvent = () => {
            dispatch(detailPageBack(true));
        };
    
        const unlistenHistoryEvent = history.listen(({ action }) => {
            if (action === "POP") {
                listenBackEvent();
            }
        });

        return unlistenHistoryEvent;
    },[]);


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
            setDeltConfirm(false);
            setCommentDeltConfirm(false);
        }
    },[popup.confirmPop]);


    //댓글창 이름값 넣기
    useEffect(()=>{
        setName(user.loginUser.m_name);
    },[user.loginUser]);


    //게시판 제목
    useEffect(()=>{
        if(board_category){
            const idx = common.boardMenu.findIndex((item)=>item.category == board_category);
            const txt = common.boardMenu[idx].c_name;
            setTitle(txt);
        }
    },[board_category]);


    //게시글정보 가져오기
    const getBoardData = () => {
        axios.get(`${board_detail.replace(":category",board_category).replace(":idx",board_idx)}?pass=${passOk}`,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                let data = res.data.data;
                setBoardData(data);

                setAnswerTxt(data.b_reply);
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
        axios.get(`${board_comment_list.replace(":category",board_category).replace(":board_idx",board_idx)}`,
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

        //게시판설정정보 가져오기
        setBoardSettingData(common.boardSettingData);
    },[board_category,board_idx]);


    //인풋값 변경시
    const onInputChangeHandler = (e) => {
        const id = e.currentTarget.id;
        const val = e.currentTarget.value;

        let newData = {...boardData};
            newData[id] = val;
            
        setBoardData(newData);
    };


    //첨부파일 다운로드
    const fileDownHandler = (idx, name) => {
        axios.get(`${board_file_down.replace(":category",board_category).replace(":parent_idx",board_idx).replace(":idx",idx)}`,
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


    //삭제버튼 클릭시
    const deltBtnClickHandler = () => {
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
            idx: board_idx,
            category: board_category
        };
        axios.delete(`${board_modify}`,
            {
                data: body,
                headers: {Authorization: `Bearer ${user.loginUser.accessToken}`}
            }
        )
        .then((res)=>{
            if(res.status === 200){
                navigate(-1);
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


    //문의게시판일때 답변작성하기
    const replyHandler = () => {
        if(!answerTxt){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'답변을 작성해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }else{
            const body = {
                category: board_category,
                idx: board_idx,
                b_reply: answerTxt
            };
            axios.post(board_reply, body,
                {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
            )
            .then((res)=>{
                if(res.status === 200){
                    dispatch(confirmPop({
                        confirmPop:true,
                        confirmPopTit:'알림',
                        confirmPopTxt:'답변이 등록되었습니다.',
                        confirmPopBtn:1,
                    }));
                    setConfirm(true);
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
        }
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


    //대댓글 textarea 값 변경시
    const onReplyTextChangeHandler = (e) => {
        const val = e.currentTarget.value;
        setReplyComment(val);
    };


    //댓글등록버튼 클릭시
    const enterBtnClickHandler = (depth, txt, idx) => {
        console.log(depth)
        if(txt.length == 0){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'댓글을 입력해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }else{
            enterHandler(depth, txt, idx);
        }
    };


    //댓글등록하기
    const enterHandler = (depth, txt, idx) => {
        const body = {
            category: board_category,
            board_idx: board_idx,
            parent_idx: idx || 0,
            depth: depth,
            m_email: user.loginUser.m_email,
            m_name: user.loginUser.m_name,
            m_pwd: '',
            c_contents: txt,
        };
        axios.post(`${board_comment}`, body, 
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                getCommentList();

                //대댓글 등록시 대댓글영역 닫기 && 대댓글 textarea 값 비우기
                if(idx){
                    setReplyEnterOk(true);
                    setReplyComment('');
                }
                //댓글등록시 댓글 textarea 값 비우기
                else{
                    setComment('');
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


    //대댓글 등록시 replyEnterOk 값 다시 초기화 = false
    useEffect(()=>{
        if(replyEnterOk){
            setReplyEnterOk(false);
        }
    },[replyEnterOk]);


    //댓글수정버튼 클릭시
    const onEditBtnClickHandler = (idx, txt) => {
        setEditShow(idx);

        //댓글내용값 있을때 값넣기
        if(txt){
            setEditComment(txt);
        }else{//없을때 지우기
            setEditComment('');
        }
    };


    //댓글수정 textarea 값 변경시
    const onEditTextChangeHandler = (e) => {
        const val = e.currentTarget.value;
        setEditComment(val);
    };


    //댓글수정 등록버튼 클릭시
    const enterEditBtnClickHandler = (idx) => {
        if(editComment.length == 0){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'댓글을 입력해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }else{
            enterEditHandler(idx);
        }
    };


    //댓글 수정하기
    const enterEditHandler = (idx) => {
        const body = {
            category: board_category,
            idx: idx,
            c_contents: editComment,
        };
        axios.put(`${board_comment}`, body, 
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                getCommentList();
                setEditShow(null); //댓글수정 영역 미노출
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


    //댓글 삭제버튼 클릭시
    const commentDeltBtnClickHandler = (idx) => {
        setDeltCommentIdx(idx);//삭제할 댓글 idx 저장

        dispatch(confirmPop({
            confirmPop:true,
            confirmPopTit:'알림',
            confirmPopTxt:'해당 댓글을 삭제하시겠습니까?',
            confirmPopBtn:2,
        }));
        setCommentDeltConfirm(true);
    };

    //댓글 삭제하기
    const commentDeltHandler = () => {
        const body = {
            category: board_category,
            idx: deltCommentIdx,
        };
        axios.delete(`${board_comment}`,
            {
                data: body,
                headers: {Authorization: `Bearer ${user.loginUser.accessToken}`}
            }
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
                        <b>{title}</b>
                    </h3>
                </div>
                <div className="board_section">
                    <div className="board_view">
                        <div className="board_tit_box">
                            <div className="board_tit">
                                <h5>{boardData.b_title}</h5>
                                <ul className="board_info">
                                    <li>
                                        <strong>{boardData.m_name}</strong>
                                    </li>
                                    <li>
                                        <em>{boardData.b_reg_date}</em>
                                    </li>
                                    <li>
                                        <span className="view_cnt">{CF.MakeIntComma(boardData.b_view)}</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="btn_util">
                                <Link to={`/console/board/post/modify/${board_category}/${board_idx}`} className="btn_type11">수정</Link>
                                <button type="button" className="btn_type12" onClick={deltBtnClickHandler}>삭제</button>
                            </div>
                        </div>
                        <div className="board_con">
                            {/* 갤러리게시판일때만 썸네일이미지 보이기 */}
                            {boardSettingData.c_content_type == 5 &&
                                <div className="img_box"><img src={api_uri+boardData.b_img} alt="썸네일이미지"/></div>
                            }
                            <div className="con" dangerouslySetInnerHTML={{ __html: boardData.b_contents }}></div>
                            {boardData.b_file && boardData.b_file.length > 0 &&
                                <div className="file_section">
                                    <span>첨부파일</span>
                                    <div>
                                        {boardData.b_file.map((cont,i)=>{
                                            return(
                                                <button type="button" key={i}
                                                    onClick={()=>{
                                                        const name = cont.original_name;
                                                        fileDownHandler(cont.idx, name);
                                                    }}
                                                >{cont.original_name}</button>
                                            );
                                        })}
                                    </div>
                                </div>
                            }
                            {/* 문의게시판일때만 답변작성 보이기 */}
                            {boardSettingData.c_content_type == 7 &&
                                <ul className="answer_box">
                                    <li>
                                        <p>답변 작성</p>
                                        <textarea 
                                            value={answerTxt || ""}
                                            onChange={(e) => setAnswerTxt(e.target.value)}
                                            style={{minHeight:"150px"}}
                                        />
                                    </li>
                                    <li>
                                        <p>답변 알림 수신 정보</p>
                                        <ul>
                                            <li>
                                                <p>휴대폰번호</p>
                                                <InputBox
                                                    className="input_box" 
                                                    type={`text`}
                                                    value={boardData.b_sms_phone || ""}
                                                    onChangeHandler={onInputChangeHandler}
                                                    id={`b_sms_phone`}
                                                    phone={true}
                                                />
                                            </li>
                                            <li>
                                                <p>이메일</p>
                                                <InputBox
                                                    className="input_box" 
                                                    type={`text`}
                                                    value={boardData.b_email || ""}
                                                    onChangeHandler={onInputChangeHandler}
                                                    id={`b_email`}
                                                />
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            }
                            {boardSettingData.b_comment == 'Y' &&
                                <CommentWrap2 
                                    commentList={commentList}
                                    name={name}
                                    login={true}
                                    admin={true}
                                    // 댓글
                                    comment={comment}
                                    onTextChangeHandler={onTextChangeHandler}
                                    onEnterHandler={enterBtnClickHandler}
                                    // 대댓글
                                    replyComment={replyComment}
                                    onReplyTextChangeHandler={onReplyTextChangeHandler}
                                    replyEnterOk={replyEnterOk}
                                    //댓글수정
                                    editComment={editComment}
                                    onEditTextChangeHandler={onEditTextChangeHandler}
                                    onEditEnterHandler={enterEditBtnClickHandler}
                                    onEditBtnClickHandler={onEditBtnClickHandler}
                                    editShow={editShow}
                                    //댓글삭제
                                    onDeltHandler={commentDeltBtnClickHandler}
                                />
                            }
                        </div> 
                    </div>
                    {boardSettingData.c_content_type == 7 ?
                        <div className="form_btn_wrap">
                            <button type="button" className="btn_type3" onClick={()=>{navigate(-1)}}>목록</button>
                            <button type="button" className="btn_type4" onClick={replyHandler}>답변등록</button>
                        </div>
                        :
                        <div className="btn_list_wrap tm30">
                            <button type="button" className="btn_type3" onClick={()=>{navigate(-1)}}>목록</button>
                        </div>
                    }
                </div>
            </div>
        </div>

        {/* 게시글삭제 confirm팝업 */}
        {deltConfirm && <ConfirmPop onClickHandler={deltHandler} />}

        {/* 댓글삭제 confirm팝업 */}
        {commentDeltConfirm && <ConfirmPop onClickHandler={commentDeltHandler} />}

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default BoardDetail;