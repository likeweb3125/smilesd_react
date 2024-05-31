import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import 'moment/locale/ko';
import WriteReplyWrap from "../WriteReplyWrap";
import TextareaBox from "../TextareaBox";

const ReplyWrap = (
    {   
        name,
        login,
        admin,
        data, 
        onReplyToggleHandler,
        replyShow,
        replyComment,
        onReplyTextChangeHandler,
        writeReply,
        onWriteReplyHandler,
        onWriteReplyCancelHandler,
        editComment, 
        onEditTextChangeHandler,
        onEditEnterHandler,
        onEditBtnClickHandler,
        editShow,
        onEnterHandler,
        onDeltHandler,
        onReplyNameChangeHandler,
        onReplyPasswordChangeHandler,
        replyName,
        replyPassword,
        onMoEditBoxClickHandler,
        moCommentEditBox
    }
    ) => {
    const user = useSelector((state)=>state.user);
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


    return (
        <div className={`reply_wrap${(data.children.length > 0 || data.idx == writeReply) ? ' on' : ''}`}>
            {data.children.length > 0 && !replyShow[data.idx] ?
                <div className="btn_reply_more_wrap">
                    <button type="button" className="btn_reply_more" onClick={() => onReplyToggleHandler(data.idx, true)}>
                        댓글 더보기
                    </button>
                    <button type="button" className="btn_reply_more_txt" onClick={() => onReplyToggleHandler(data.idx, true)}>
                        댓글 더보기
                    </button>
                </div>
            :   (replyShow[data.idx] || data.idx == writeReply) &&
                <div className="reply_comment">
                    {data.children.length > 0 && <>
                        <button type="button" className="btn_reply_toggle on" onClick={() => onReplyToggleHandler(data.idx, false)}>
                            댓글 토글
                        </button>
                        {data.children.map((reply, i) => {
                            const time = moment(reply.c_reg_date).format('YYYY-MM-DD A hh:mm:ss');

                            //댓글수정,삭제 노출결정
                            let editBtnBox = false;
                            if(admin){ //관리자일때 노출
                                editBtnBox = true;
                            }else{
                                //로그인시
                                if(login){
                                    if(user.loginUser.m_email === reply.m_email){
                                        editBtnBox = true;
                                    }
                                }
                                //미로그인시
                                else{
                                    if(reply.m_email.length === 0){
                                        editBtnBox = true;
                                    }
                                }
                            }

                            //모바일일때 댓글 수정,삭제 부분
                            let editBtnBoxStyle = {};
                            if(width <= 1417 && moCommentEditBox === reply.idx){
                                editBtnBoxStyle = {'display':'block'};
                            }

                            let editBtnBoxShow = false;
                            if(moCommentEditBox === reply.idx){
                                editBtnBoxShow = true;
                            }

                            return(
                                <div className="comment" key={i}>
                                    <div className="comment_item">
                                        <div className="profile">
                                            <ul className="comment_info">
                                                <li>
                                                    <strong>{reply.m_name}</strong>
                                                </li>
                                                <li>
                                                    <em>{time}</em>
                                                </li>
                                                {reply.depth < 5 && //depth4 까지만 대댓글작성가능
                                                    writeReply != reply.idx && //답글작성시 버튼 미노출
                                                    <li>
                                                        <button type="button" className="btn_write_comment" onClick={()=>onWriteReplyHandler(reply.idx)} >답글쓰기</button>
                                                    </li>
                                                }
                                            </ul>
                                        </div>
                                        <div className="con_comment">
                                            {editShow == reply.idx ?
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
                                                    <button type="button" className="btn_type14" onClick={()=>onEditEnterHandler(reply.idx)}>등록</button>
                                                </div>
                                                :<p>{reply.c_contents}</p>
                                            }
                                        </div>
                                        {editBtnBox && <>
                                            <button type="button" className="btn_comment_util"
                                                onClick={()=>onMoEditBoxClickHandler(editBtnBoxShow, reply.idx)}
                                            ><span>수정/삭제 열기</span></button>
                                            <div className="comment_util" style={editBtnBoxStyle}>
                                                {editShow == reply.idx ? <button type="button" className="btn_type11" onClick={()=>onEditBtnClickHandler(null)}>취소</button>
                                                    :<button type="button" className="btn_type11" onClick={()=>onEditBtnClickHandler(reply.idx, reply.c_contents)}>수정</button>
                                                }
                                                <button type="button" className="btn_type12" onClick={()=>onDeltHandler(reply.idx)}>삭제</button>
                                            </div>
                                        </>}
                                    </div>
                                    {/* 대댓글 */}
                                    <ReplyWrap 
                                        name={name}
                                        login={login}
                                        admin={admin}
                                        data={reply} 
                                        onEnterHandler={onEnterHandler}
                                        onReplyToggleHandler={onReplyToggleHandler} 
                                        replyShow={replyShow} 
                                        replyComment={replyComment}
                                        onReplyTextChangeHandler={onReplyTextChangeHandler}
                                        writeReply={writeReply}
                                        onWriteReplyHandler={onWriteReplyHandler}
                                        onWriteReplyCancelHandler={onWriteReplyCancelHandler}
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
                                        //댓글삭제
                                        onDeltHandler={onDeltHandler}
                                    />
                                    {/* //대댓글 */}
                                </div>
                            );
                        })}
                    </>}
                    {data.idx == writeReply &&
                        <WriteReplyWrap 
                            replyComment={replyComment}
                            onReplyTextChangeHandler={onReplyTextChangeHandler}
                            onEnterHandler={onEnterHandler}
                            onWriteReplyCancelHandler={onWriteReplyCancelHandler}
                            depth={data.depth + 1}
                            idx={data.idx}
                            name={name}
                            login={login}
                            onReplyNameChangeHandler={onReplyNameChangeHandler}
                            onReplyPasswordChangeHandler={onReplyPasswordChangeHandler}
                            replyName={replyName}
                            replyPassword={replyPassword}
                        />
                    }
                </div>
            }
        </div>
    );
};
  
  export default ReplyWrap;