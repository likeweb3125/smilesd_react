import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as CF from "../../../config/function";
import TextareaBox from "../TextareaBox";
import ConfirmPop from "../../popup/ConfirmPop";


const CommentWrap = (props) => {
    const popup = useSelector((state)=>state.popup);
    const [confirm, setConfirm] = useState(false);
    const [list, setList] = useState([]);


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);


    useEffect(()=>{
        setList(props.list);
    },[props.list]);


    return(<>
        <div className="comment_section">
            <div className="txt">
                <span>댓글</span>
                <span className="cnt">{CF.MakeIntComma(list.length)}</span>
            </div>
            <div className="comment_wrap">
                <div className="comment_box">
                    {list.map((cont,i)=>{
                        return(
                            <div key={i} className="comment">
                                <div className="comment_item">
                                    <div className="profile">
                                        <ul className="comment_info">
                                            <li>
                                                <strong>{cont.c_name}</strong>
                                            </li>
                                            <li>
                                                <em>{cont.c_wdate}</em>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="con_comment">
                                        <p>{cont.c_content}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="write_comment_wrap">
                    <div className="writer_wrap">
                        <div className="writer_info">
                            <strong className="user_name">{props.name}</strong>
                        </div>
                    </div>
                    <div className="write_comment">
                        <TextareaBox 
                            cols={30}
                            rows={4}
                            placeholder="댓글을 입력해주세요."
                            countShow={true}
                            countMax={300}
                            count={props.comment.length}
                            value={props.comment}
                            onChangeHandler={props.onTextChangeHandler}
                        />
                        <button type="button" className="btn_type14" onClick={props.onEnterHandler}>등록</button>
                    </div>
                </div>
            </div>
        </div>

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default CommentWrap;