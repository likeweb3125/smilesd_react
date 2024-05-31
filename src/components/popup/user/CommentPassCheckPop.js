import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import * as CF from "../../../config/function";
import { enum_api_uri } from "../../../config/enum";
import { confirmPop, commentPassCheckPop } from "../../../store/popupSlice";
import { commentPassCheck, commentDeltPassCheck } from "../../../store/etcSlice";
import InputBox from "../../component/InputBox";
import ConfirmPop from "../ConfirmPop";


const CommentPassCheckPop = () => {
    const dispatch = useDispatch();
    const popup = useSelector((state)=>state.popup);
    const comment_password = enum_api_uri.comment_password;
    const [confirm, setConfirm] = useState(false);
    const [password, setPassword] = useState("");
    const [passView, setPassView] = useState(false);
    const [error, setError] = useState({});

    useEffect(()=>{

    });


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);


    //팝업닫기
    const closePopHandler = () => {
        dispatch(commentPassCheckPop({commentPassCheckPop:false,commentPassCheckPopIdx:null,commentPassCheckPopTxt:'',commentPassCheckPopDelt:false}));
    };


    //비밀번호 확인하기버튼 클릭시
    const passwordCheckHandler = () => {
        let newError = {...error};

        if(!newError.password || newError.password.length === 0){
            passwordCheck();
        }
    };


    //비밀번호 확인하기
    const passwordCheck = () => {
        const body = {
            idx: popup.commentPassCheckPopIdx,
            password: password,
        };
        axios.post(comment_password, body)
        .then((res)=>{
            if(res.status === 200){
                //댓글 삭제일때
                if(popup.commentPassCheckPopDelt){
                    dispatch(commentDeltPassCheck(true));
                }
                //댓글 수정일때
                else{
                    dispatch(commentPassCheck({commentPassCheck:true,commentPassCheckIdx:popup.commentPassCheckPopIdx,commentPassCheckTxt:popup.commentPassCheckPopTxt}));
                }

                closePopHandler();
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
        <div className="pop_display pop_pwd">
            <div className="dimm"></div>
            <div className="popup_wrap">
                <div className="popup">
                    <div className="pop_tit">
                        <h3>알림</h3>
                    </div>
                    <div className="pop_con">
                        <div className="con_box">
                            <div className="txt_box">
                                댓글작성시 입력한
                                <br/>
                                <b>비밀번호</b>를 입력해 주세요.
                            </div>
                            <InputBox
                                className="input_box pwd_input"
                                type={passView ? "text" : "password"} 
                                placeholder="비밀번호를 입력해주세요." 
                                inputClassName={error.password && error.password.length > 0 ? "wrong_input" : ""}
                                value={password}
                                onChangeHandler={(e)=>{
                                    const val = e.currentTarget.value;
                                    setPassword(val);

                                    let newError = {...error};
                                    if(val.length > 0){
                                        newError.password = '';
                                    }else{
                                        newError.password = '비밀번호를 입력해주세요.';
                                    }
                                    setError(newError);
                                }} 
                                password={true}
                                passwordBtnClickHandler={()=>setPassView(!passView)}
                            />
                            {error.password && error.password.length > 0 && <em className="txt_err">{error.password}</em>}
                        </div>
                        <div className="pop_btn_wrap">
                            <div className="btn_box w_100">
                                <button type="button" className="btn_type3" onClick={closePopHandler}>취소</button>
                                <button type="button" className="btn_type4" onClick={passwordCheckHandler}>확인</button>
                            </div>
                        </div>
                    </div>
                    <button type="button" className="btn_pop_close" onClick={closePopHandler}>팝업닫기</button>
                </div>
            </div>
        </div>

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default CommentPassCheckPop;