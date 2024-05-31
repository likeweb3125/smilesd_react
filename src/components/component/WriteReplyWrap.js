import TextareaBox from "./TextareaBox";
import InputBox from "./InputBox";

const WriteReplyWrap = (
    {
        name,
        login,
        depth,
        idx,
        replyComment,
        onReplyTextChangeHandler,
        onEnterHandler,
        onWriteReplyCancelHandler,
        onReplyNameChangeHandler,
        onReplyPasswordChangeHandler,
        replyName,
        replyPassword,
    }) => {

    return(<>
        <div className="write_reply_wrap">
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
                            value={replyName}
                            onChangeHandler={onReplyNameChangeHandler}
                        />
                    </div>
                    <div className="writer_info">
                        <strong>비밀번호</strong>
                        <InputBox
                            className="input_box" 
                            type={`text`}
                            placeholder={`비밀번호를 입력해주세요.`}
                            value={replyPassword}
                            onChangeHandler={onReplyPasswordChangeHandler}
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
                    count={replyComment.length}
                    value={replyComment}
                    onChangeHandler={onReplyTextChangeHandler}
                />
                <button type="button" className="btn_type14"  onClick={()=>onEnterHandler(true, depth, replyComment, idx)}>등록</button>
                <button type="button" className="btn_cancel" onClick={onWriteReplyCancelHandler}>답글 취소</button>
            </div>
        </div>
    </>);
};

export default WriteReplyWrap;