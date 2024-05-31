import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import 'moment/locale/ko';
import * as CF from "../../config/function";
import TextareaBox from "./TextareaBox";
import InputBox from "./InputBox";
import ReplyWrap from "./admin/ReplyWrap";
import ConfirmPop from "../popup/ConfirmPop";


const CommentWrap2 = (
    {
        commentList,
        name,
        login,
        admin,
        comment,
        onTextChangeHandler,
        onEnterHandler,
        replyComment,
        onReplyTextChangeHandler,
        replyEnterOk,
        editComment,
        onEditTextChangeHandler,
        onEditEnterHandler,
        onEditBtnClickHandler,
        editShow,
        onDeltHandler,
        onNameChangeHandler,
        onPasswordChangeHandler,
        commentName,
        commentPassword,
        onReplyNameChangeHandler,
        onReplyPasswordChangeHandler,
        replyName,
        replyPassword,
        onMoEditBoxClickHandler,
        moCommentEditBox
    }) => {
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const [confirm, setConfirm] = useState(false);
    const [list, setList] = useState([]);
    const [listCount, setListCount] = useState(0);
    const [replyShow, setReplyShow] = useState({});
    const [writeReply, setWriteReply] = useState(null);
    const [firstTime, setFirstTime] = useState(false);
    const [width, setWidth] = useState(window.innerWidth);


    useEffect(() => {
        // 창 크기 변경 이벤트 핸들러
        const handleResize = () => {
          setWidth(window.innerWidth);
        };
    
        // 컴포넌트가 마운트될 때 이벤트 리스너 등록
        window.addEventListener('resize', handleResize);
    
        // 컴포넌트가 언마운트될 때 이벤트 리스너 해제
        return () => {
          window.removeEventListener('resize', handleResize);
        };
    }, []);


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);


    useEffect(()=>{
        setList(commentList);
    },[commentList]);


    //대댓글보이기 토글
    const onReplyToggleHandler = (idx, val) => {
        let newReplyShow = {...replyShow};
        newReplyShow[idx] = val;
        setReplyShow(newReplyShow);
    };

    //답글달기
    const onWriteReplyHandler = (idx) => {
        setWriteReply(idx);

        let newReplyShow = {...replyShow};
        newReplyShow[idx] = true;
        setReplyShow(newReplyShow);
    };

    //답글달기 완료시 답글달기 영역 미노출
    useEffect(()=>{
        if(replyEnterOk){
            setWriteReply(null);
        }
    },[replyEnterOk]);


    //댓글개수 구하기
    useEffect(()=>{
        function countList(tree) {
            let count = 0;
          
            function dfs(node) {
                count++; // 각 노드 방문 시 개수 증가
            
                if (node.children && node.children.length > 0) {
                    for (let childNode of node.children) {
                        dfs(childNode); // 자식 노드에 대해 재귀 호출
                    }
                }
            }
          
            for (let rootNode of tree) {
                dfs(rootNode); // 각 루트 노드에 대해 DFS 시작
            }
          
            return count;
        }
          
        const total = countList(list);
        setListCount(total);

        //댓글이 있고 맨처음 랜더링일때
        if(list.length > 0 && !firstTime){
            setFirstTime(true);
        }
    },[list]);


    //맨처음 랜더링될때만 댓글 2depth 까지는 기본으로 노출
    useEffect(()=>{
        if(firstTime){
            //depth 가 2보다 작은 댓글 idx값 리스트 구하기
            const filterObjectsByDepth = (objects, depthLimit) => {
                let filteredIdxArray = [];

                const traverse = (object) => {
                    if (object.depth < depthLimit) {
                        filteredIdxArray.push(object.idx);
                    }
                
                    if (object.children && object.children.length > 0) {
                        object.children.forEach(child => traverse(child));
                    }
                };

                objects.forEach(item => traverse(item));

                return filteredIdxArray;
            };

            const result = filterObjectsByDepth(list, 2);
            const transformedObject = result.reduce((acc, idx) => {
                acc[idx] = true;
                return acc;
            }, {});

            setReplyShow(transformedObject);
        }
    },[firstTime]);



    return(<>
        <div className="comment_section">
            <div className="txt">
                <span>댓글</span>
                <span className="cnt">{CF.MakeIntComma(listCount)}</span>
            </div>
            <div className="comment_wrap">
                <div className="comment_box">
                    {list.map((cont,i)=>{
                        const time = moment(cont.c_reg_date).format('YYYY-MM-DD A hh:mm:ss');

                        //댓글 수정/삭제 버튼 노출결정
                        let editBtnBox = false;
                        if(admin){ //관리자일때 노출
                            editBtnBox = true;
                        }else{
                            //로그인시
                            if(login){
                                if(user.loginUser.m_email === cont.m_email){
                                    editBtnBox = true;
                                }
                            }
                            //미로그인시
                            else{
                                if(cont.m_email.length === 0){
                                    editBtnBox = true;
                                }
                            }
                        }

                        //모바일일때 댓글 수정,삭제 부분
                        let editBtnBoxStyle = {};
                        if(width <= 1417 && moCommentEditBox === cont.idx){
                            editBtnBoxStyle = {'display':'block'};
                        }

                        let editBtnBoxShow = false;
                        if(moCommentEditBox === cont.idx){
                            editBtnBoxShow = true;
                        }

                        return(
                            <div className="comment" key={i}>
                                <div className="comment_item">
                                    <div className="profile">
                                        <ul className="comment_info">
                                            <li>
                                                <strong>{cont.m_name}</strong>
                                            </li>
                                            <li>
                                                <em>{time}</em>
                                            </li>
                                            {writeReply != cont.idx && //답글작성시 버튼 미노출
                                                <li>
                                                    <button type="button" className="btn_write_comment" onClick={()=>onWriteReplyHandler(cont.idx)}>답글쓰기</button>
                                                </li>
                                            }
                                        </ul>
                                    </div>
                                    <div className="con_comment">
                                        {editShow == cont.idx ?
                                            <div className="write_comment">
                                                <TextareaBox 
                                                    cols={30}
                                                    rows={4}
                                                    placeholder="댓글을 입력해주세요."
                                                    countShow={true}
                                                    countMax={300}
                                                    count={editComment.length}
                                                    value={editComment}
                                                    onChangeHandler={onEditTextChangeHandler}
                                                />
                                                <button type="button" className="btn_type14" onClick={()=>onEditEnterHandler(cont.idx)}>등록</button>
                                            </div>
                                            :<p>{cont.c_contents}</p>
                                        }
                                    </div>
                                    {editBtnBox &&  <>
                                        <button type="button" className="btn_comment_util"
                                            onClick={()=>onMoEditBoxClickHandler(editBtnBoxShow, cont.idx)}
                                        ><span>수정/삭제 열기</span></button>
                                        <div className="comment_util" style={editBtnBoxStyle}>
                                            {editShow == cont.idx ? <button type="button" className="btn_type11" onClick={()=>onEditBtnClickHandler(null)}>취소</button>
                                                :<button type="button" className="btn_type11" onClick={()=>onEditBtnClickHandler(cont.idx, cont.c_contents)}>수정</button>
                                            }
                                            <button type="button" className="btn_type12" onClick={()=>onDeltHandler(cont.idx)}>삭제</button>
                                        </div>
                                    </>}
                                </div>
                                {/* 대댓글 */}
                                <ReplyWrap 
                                    name={name}
                                    login={login}
                                    admin={admin}
                                    data={cont} 
                                    onEnterHandler={onEnterHandler}
                                    onReplyToggleHandler={onReplyToggleHandler} 
                                    replyShow={replyShow} 
                                    replyComment={replyComment}
                                    onReplyTextChangeHandler={onReplyTextChangeHandler}
                                    writeReply={writeReply}
                                    onWriteReplyHandler={onWriteReplyHandler}
                                    onWriteReplyCancelHandler={()=>setWriteReply(null)}
                                    onReplyNameChangeHandler={onReplyNameChangeHandler}
                                    onReplyPasswordChangeHandler={onReplyPasswordChangeHandler}
                                    replyName={replyName}
                                    replyPassword={replyPassword}
                                    //댓글수정
                                    editComment={editComment}
                                    onEditTextChangeHandler={onEditTextChangeHandler}
                                    onEditEnterHandler={onEditEnterHandler}
                                    onEditBtnClickHandler={onEditBtnClickHandler}
                                    editShow={editShow}
                                    onMoEditBoxClickHandler={onMoEditBoxClickHandler}
                                    moCommentEditBox={moCommentEditBox}
                                    //댓글삭제
                                    onDeltHandler={onDeltHandler}
                                />
                                {/* //대댓글 */}
                            </div>  
                        );
                    })}
                </div>
                <div className="write_comment_wrap">
                    {login ? //로그인시
                        <div className="writer_wrap">
                            <div className="writer_info">
                                <strong className="user_name">{name}</strong>
                            </div>
                        </div>
                        :   //미로그인시
                        <div className="writer_wrap">
                            <div className="writer_info">
                                <strong>작성자</strong>
                                <InputBox
                                    className="input_box" 
                                    type={`text`}
                                    placeholder={`작성자를 입력해주세요.`}
                                    value={commentName}
                                    onChangeHandler={onNameChangeHandler}
                                />
                            </div>
                            <div className="writer_info">
                                <strong>비밀번호</strong>
                                <InputBox
                                    className="input_box" 
                                    type={`text`}
                                    placeholder={`비밀번호를 입력해주세요.`}
                                    value={commentPassword}
                                    onChangeHandler={onPasswordChangeHandler}
                                />
                            </div>
                        </div>
                    }
                    <div className="write_comment">
                        <TextareaBox 
                            cols={30}
                            rows={4}
                            placeholder="댓글을 입력해주세요."
                            countShow={true}
                            countMax={300}
                            count={comment.length}
                            value={comment}
                            onChangeHandler={onTextChangeHandler}
                        />
                        <button type="button" className="btn_type14" onClick={()=>onEnterHandler(false, 0, comment)}>등록</button>
                    </div>
                </div>
            </div>
        </div>

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default CommentWrap2;