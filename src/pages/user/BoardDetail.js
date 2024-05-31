import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { enum_api_uri } from "../../config/enum";
import * as CF from "../../config/function";
import history from "../../config/history";
import { confirmPop, commentPassCheckPop } from "../../store/popupSlice";
import { detailPageBack, secretPassCheckOk } from "../../store/commonSlice";
import { commentPassCheck, commentDeltPassCheck } from "../../store/etcSlice";
import { passOk } from "../../config/constants";
import CommentWrap2 from "../../components/component/CommentWrap2";
import ConfirmPop from "../../components/popup/ConfirmPop";


const BoardDetail = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { menu_idx, board_idx } = useParams();
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
    const etc = useSelector((state)=>state.etc);
    const [confirm, setConfirm] = useState(false);
    const [deltConfirm, setDeltConfirm] = useState(false);
    const [commentDeltConfirm, setCommentDeltConfirm] = useState(false);
    const [boardData, setBoardData] = useState({});
    const [boardSettingData, setBoardSettingData] = useState({});
    const [answerTxt, setAnswerTxt] = useState(null);
    const [commentList, setCommentList] = useState([]);
    const [comment, setComment] = useState("");
    const [commentName, setCommentName] = useState('');
    const [commentPassword, setCommentPassword] = useState('');
    const [replyName, setReplyName] = useState('');
    const [replyPassword, setReplyPassword] = useState('');
    const [replyComment, setReplyComment] = useState("");
    const [editComment, setEditComment] = useState("");
    const [editCommentShow, setEditCommentShow] = useState(null);
    const [replyEnterOk, setReplyEnterOk] = useState(false);
    const [deltCommentIdx, setDeltCommentIdx] = useState(null);
    const [login, setLogin] = useState(false);
    const [myPost, setMyPost] = useState(false);
    const [name, setName] = useState('');
    const [moCommentEditBox, setMoCommentEditBox] = useState(null);


    //상세페이지 뒤로가기
    useEffect(() => {
        const listenBackEvent = () => {
            dispatch(detailPageBack(true));

            //비밀글 비밀번호체크값 초기화
            dispatch(secretPassCheckOk(false));
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


    //로그인했는지 체크
    useEffect(()=>{
        if(user.loginStatus){
            setLogin(true);
        }else{
            setLogin(false);
        }
    },[user.loginStatus]);


    //로그인시 댓글창 이름값 넣기
    useEffect(()=>{
        if(login){ 
            setName(user.loginUser.m_name);
        }else{
            setName('');
        }
    },[login]);


    //게시글정보 가져오기
    const getBoardData = () => {
        //비밀글일때 비밀번호체크했는지 확인
        let pass = false;
        if(common.secretPassCheckOk){
            pass = true;
        }

        axios.get(`${board_detail.replace(":category",menu_idx).replace(":idx",board_idx)}${pass ? '?pass='+passOk : ''}`)
        .then((res)=>{
            if(res.status === 200){
                let data = res.data.data;
                setBoardData(data);

                setAnswerTxt(data.b_reply);
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


    //게시글댓글리스트 가져오기
    const getCommentList = () => {
        axios.get(`${board_comment_list.replace(":category",menu_idx).replace(":board_idx",board_idx)}`)
        .then((res)=>{
            if(res.status === 200){
                let data = res.data.data;
                setCommentList(data);
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


    useEffect(()=>{
        getBoardData();
        getCommentList();
    },[menu_idx,board_idx,common.secretPassCheckOk]);


    useEffect(()=>{
        //게시판설정정보 가져오기
        setBoardSettingData(common.currentMenuData);
    },[common.currentMenuData]);


    useEffect(()=>{
        console.log(boardData);
    },[boardData]);


    //게시글 수정,삭제 버튼 노출체크하기
    useEffect(()=>{
        //로그인시
        if(login){
            //내가작성한글일때만 수정,삭제버튼 노출
            if(boardData.m_email === user.loginUser.m_email || common.secretPassCheckOk){
                setMyPost(true);
            }else{
                setMyPost(false);
            }
        }else{
            //비회원이 작성한비밀글일때만 수정,삭제버튼 노출
            if(common.secretPassCheckOk){
                setMyPost(true);
            }else{
                setMyPost(false);
            }
        }
    },[boardData, login, user.loginUser]);


    //첨부파일 다운로드
    const fileDownHandler = (idx, name) => {
        axios.get(`${board_file_down.replace(":category",menu_idx).replace(":parent_idx",board_idx).replace(":idx",idx)}`,
            {
                // headers:{Authorization: `Bearer ${user.loginUser.accessToken}`},
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
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt: err_msg,
                confirmPopBtn:1,
            }));
            setConfirm(true);
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
        //비밀글일때 비밀번호체크했는지 확인
        let pass = '';
        if(common.secretPassCheckOk){
            pass = passOk;
        }

        const body = {
            idx: board_idx,
            category: menu_idx,
            pass: pass
        };
        axios.delete(`${board_modify}`,
            {
                data: body,
            }
        )
        .then((res)=>{
            if(res.status === 200){
                navigate(-1);
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


    //------------------------------------- 댓글 -------------------------------------
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

    //댓글 미로그인시 작성자 값 변경시
    const onCommentNameChangeHandler = (e) => {
        const val = e.currentTarget.value;
        setCommentName(val);
    };

    //댓글 미로그인시 비밀번호 값 변경시
    const onCommentPasswordChangeHandler = (e) => {
        const val = e.currentTarget.value;
        setCommentPassword(val);
    };

    //대댓글 textarea 값 변경시
    const onReplyTextChangeHandler = (e) => {
        const val = e.currentTarget.value;
        setReplyComment(val);
    };

    //대댓글 미로그인시 작성자 값 변경시
    const onReplyNameChangeHandler = (e) => {
        const val = e.currentTarget.value;
        setReplyName(val);
    };

    //대댓글 미로그인시 비밀번호 값 변경시
    const onReplyPasswordChangeHandler = (e) => {
        const val = e.currentTarget.value;
        setReplyPassword(val);
    };


    //댓글등록버튼 클릭시
    const enterBtnClickHandler = (reply, depth, txt, idx) => {
        //로그인시
        if(login){
            if(txt.length === 0){
                dispatch(confirmPop({
                    confirmPop:true,
                    confirmPopTit:'알림',
                    confirmPopTxt:'댓글을 입력해주세요.',
                    confirmPopBtn:1,
                }));
                setConfirm(true);
            }else{
                enterHandler(reply, depth, txt, idx);
            }
        }
        //미로그인시
        else{
            //대댓글일때
            if(reply){
                if(replyName.length === 0){
                    dispatch(confirmPop({
                        confirmPop:true,
                        confirmPopTit:'알림',
                        confirmPopTxt:'작성자를 입력해주세요.',
                        confirmPopBtn:1,
                    }));
                    setConfirm(true);
                }else if(replyPassword.length === 0){
                    dispatch(confirmPop({
                        confirmPop:true,
                        confirmPopTit:'알림',
                        confirmPopTxt:'비밀번호를 입력해주세요.',
                        confirmPopBtn:1,
                    }));
                    setConfirm(true);
                }else if(txt.length === 0){
                    dispatch(confirmPop({
                        confirmPop:true,
                        confirmPopTit:'알림',
                        confirmPopTxt:'댓글을 입력해주세요.',
                        confirmPopBtn:1,
                    }));
                    setConfirm(true);
                }else{
                    enterHandler(reply, depth, txt, idx);
                }
            }
            //댓글일때
            else{
                if(commentName.length === 0){
                    dispatch(confirmPop({
                        confirmPop:true,
                        confirmPopTit:'알림',
                        confirmPopTxt:'작성자를 입력해주세요.',
                        confirmPopBtn:1,
                    }));
                    setConfirm(true);
                }else if(commentPassword.length === 0){
                    dispatch(confirmPop({
                        confirmPop:true,
                        confirmPopTit:'알림',
                        confirmPopTxt:'비밀번호를 입력해주세요.',
                        confirmPopBtn:1,
                    }));
                    setConfirm(true);
                }else if(txt.length === 0){
                    dispatch(confirmPop({
                        confirmPop:true,
                        confirmPopTit:'알림',
                        confirmPopTxt:'댓글을 입력해주세요.',
                        confirmPopBtn:1,
                    }));
                    setConfirm(true);
                }else{
                    enterHandler(reply, depth, txt, idx);
                }
            }
        }
    };


    //댓글등록하기
    const enterHandler = (reply, depth, txt, idx) => {

        let m_email = '';
        let m_name = commentName;
        let m_pwd = commentPassword;

        //로그인시
        if(login){
            m_email = user.loginUser.m_email;
            m_name = user.loginUser.m_name;
            m_pwd = '';
        }
        //미로그인시
        else{
            //대댓글일때
            if(reply){
                m_name = replyName;
                m_pwd = replyPassword;
            }
        }

        const body = {
            category: menu_idx,
            board_idx: board_idx,
            parent_idx: idx || 0,
            depth: depth,
            m_email: m_email,
            m_name: m_name,
            m_pwd: m_pwd,
            c_contents: txt,
        };

        axios.post(`${board_comment}`, body, 
            // {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
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
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt: err_msg,
                confirmPopBtn:1,
            }));
            setConfirm(true);
        });
    };


    //대댓글 등록시 replyEnterOk 값 다시 초기화 = false
    useEffect(()=>{
        if(replyEnterOk){
            setReplyEnterOk(false);
        }
    },[replyEnterOk]);


    //댓글수정,수정취소 버튼 클릭시
    const onEditBtnClickHandler = (idx, txt) => {
        //수정일때
        if(idx){
            //로그인시
            if(login){
                setEditCommentShow(idx);

                //댓글내용값 있을때 값넣기
                if(txt){
                    setEditComment(txt);
                }else{//없을때 지우기
                    setEditComment('');
                }
            }
            //미로그인시
            else{
                //비밀번호 체크팝업 열기
                dispatch(commentPassCheckPop({commentPassCheckPop:true,commentPassCheckPopIdx:idx,commentPassCheckPopTxt:txt,commentPassCheckPopDelt:false}));

                //다른 댓글수정 열려있을수있으니 commentPassCheck값 초기화
                dispatch(commentPassCheck({commentPassCheck:false, commentPassCheckIdx:null, commentPassCheckTxt:''}));
            }
        }
        //수정취소일때
        else{
            setEditCommentShow(null);
        }
    };


    //비회원댓글 비밀번호체크후 수정가능
    useEffect(()=>{
        if(etc.commentPassCheck){
            //댓글내용값 있을때 값넣기
            if(etc.commentPassCheckTxt){
                setEditComment(etc.commentPassCheckTxt);
            }else{//없을때 지우기
                setEditComment('');
            }
            setEditCommentShow(etc.commentPassCheckIdx);
        }
    },[etc.commentPassCheck]);


    //댓글 수정하는값 null일때 commentPassCheck 값 초기화
    useEffect(()=>{
        if(editCommentShow === null){
            dispatch(commentPassCheck({commentPassCheck:false, commentPassCheckIdx:null, commentPassCheckTxt:''}));
        }
    },[editCommentShow]);


    //댓글수정 textarea 값 변경시
    const onEditTextChangeHandler = (e) => {
        const val = e.currentTarget.value;
        setEditComment(val);
    };


    //댓글수정 등록버튼 클릭시
    const enterEditBtnClickHandler = (idx) => {
        if(editComment.length === 0){
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
        //비회원댓글 비밀번호체크했는지 확인
        let pass = '';
        if(etc.commentPassCheck){
            pass = passOk;
        }

        const body = {
            category: menu_idx,
            idx: idx,
            c_contents: editComment,
            pass: pass
        };
        axios.put(`${board_comment}`, body)
        .then((res)=>{
            if(res.status === 200){
                getCommentList();
                setEditCommentShow(null); //댓글수정 영역 미노출

                //비회원 비밀번호체크후 댓글수정일때 commentPassCheck값 초기화
                dispatch(commentPassCheck({commentPassCheck:false, commentPassCheckIdx:null, commentPassCheckTxt:''}));
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


    //댓글 삭제버튼 클릭시
    const commentDeltBtnClickHandler = (idx) => {
        setDeltCommentIdx(idx);//삭제할 댓글 idx 저장

        //로그인시
        if(login){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'해당 댓글을 삭제하시겠습니까?',
                confirmPopBtn:2,
            }));
            setCommentDeltConfirm(true);
        }
        //미로그인시
        else{
            dispatch(commentPassCheckPop({commentPassCheckPop:true,commentPassCheckPopIdx:idx,commentPassCheckPopTxt:'',commentPassCheckPopDelt:true}));
        }
    };


    //비회원댓글 비밀번호체크후 삭제가능
    useEffect(()=>{
        if(etc.commentDeltPassCheck){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'해당 댓글을 삭제하시겠습니까?',
                confirmPopBtn:2,
            }));
            setCommentDeltConfirm(true);
        }
    },[etc.commentDeltPassCheck]);


    //댓글 삭제하기
    const commentDeltHandler = () => {
        //비회원댓글 비밀번호체크했는지 확인
        let pass = '';
        if(etc.commentDeltPassCheck){
            pass = passOk;
        }

        const body = {
            category: menu_idx,
            idx: deltCommentIdx,
            pass: pass
        };
        axios.delete(`${board_comment}`,
            {
                data: body,
            }
        )
        .then((res)=>{
            if(res.status === 200){
                getCommentList();

                //비회원 비밀번호체크후 댓글삭제일때 commentDeltPassCheck값 초기화
                dispatch(commentDeltPassCheck(false));
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
        <div className="page_user_board">
            <div className="section_inner">
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
                            {/* 내가 작성한글일때 수정,삭제버튼 노출 */}
                            {myPost &&
                                <div className="btn_util">
                                    <Link to={`/sub/board/modify/${menu_idx}/${boardData.idx}`} className="btn_type11">수정</Link>
                                    <button type="button" className="btn_type12" onClick={deltBtnClickHandler}>삭제</button>
                                </div>
                            }
                        </div>
                        <div className="board_con">
                            {/* 갤러리게시판일때만 썸네일이미지 보이기 */}
                            {boardSettingData.c_content_type && boardSettingData.c_content_type[0] == 5 &&
                                <div className="img_box"><img src={api_uri+boardData.b_img} alt="썸네일이미지"/></div>
                            }
                            <div className="con" dangerouslySetInnerHTML={{ __html: boardData.b_contents }}></div>
                            {/* <div className="write_btn_wrap">
                                <a href="#" className="btn_type13">답글</a>
                            </div> */}
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
                            {boardSettingData.b_comment == 'Y' &&
                                <CommentWrap2 
                                    commentList={commentList}
                                    name={name}
                                    login={login}
                                    // 댓글
                                    comment={comment}
                                    onTextChangeHandler={onTextChangeHandler}
                                    onEnterHandler={enterBtnClickHandler}
                                    onNameChangeHandler={onCommentNameChangeHandler}               //미로그인시 작성자이름
                                    onPasswordChangeHandler={onCommentPasswordChangeHandler}       //미로그인시 비밀번호
                                    commentName={commentName}
                                    commentPassword={commentPassword}
                                    // 대댓글
                                    replyComment={replyComment}
                                    onReplyTextChangeHandler={onReplyTextChangeHandler}
                                    replyEnterOk={replyEnterOk}
                                    onReplyNameChangeHandler={onReplyNameChangeHandler}            //미로그인시 작성자이름
                                    onReplyPasswordChangeHandler={onReplyPasswordChangeHandler}    //미로그인시 비밀번호
                                    replyName={replyName}
                                    replyPassword={replyPassword}
                                    //댓글수정
                                    editComment={editComment}
                                    onEditTextChangeHandler={onEditTextChangeHandler}
                                    onEditEnterHandler={enterEditBtnClickHandler}
                                    onEditBtnClickHandler={onEditBtnClickHandler}
                                    editShow={editCommentShow}
                                    onMoEditBoxClickHandler={(show,idx)=>{
                                        if(show){
                                            setMoCommentEditBox(null);
                                        }else{
                                            setMoCommentEditBox(idx);
                                        }
                                    }}
                                    moCommentEditBox={moCommentEditBox}
                                    //댓글삭제
                                    onDeltHandler={commentDeltBtnClickHandler}
                                />
                            }
                        </div>
                    </div>
                    <div className="btn_center_wrap">
                        <button type="button" className="btn_list" onClick={()=>{navigate(-1)}}>목록으로</button>
                    </div>
                    {boardData && (boardData.prev_board || boardData.next_board) &&
                        <div className="board_pagination">
                            {boardData.prev_board && 
                                <div className="pagination_box board_prev">
                                    <b>PREV</b>
                                    <span>
                                        <Link to={`/board/detail/${menu_idx}/${boardData.prev_board.idx}`}>{boardData.prev_board.b_title}</Link>
                                    </span>
                                </div>
                            }
                            {boardData.next_board &&
                                <div className="pagination_box board_next">
                                    <b>NEXT</b>
                                    <span>
                                        <Link to={`/board/detail/${menu_idx}/${boardData.next_board.idx}`}>{boardData.next_board.b_title}</Link>
                                    </span>
                                </div>
                            }
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