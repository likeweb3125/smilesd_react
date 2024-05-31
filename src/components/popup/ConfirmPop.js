import { useSelector, useDispatch } from "react-redux";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { confirmPop } from "../../store/popupSlice";

const ConfirmPop = (props) => {
    const popup = useSelector((state)=>state.popup);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    //팝업닫기
    const closePopHandler = () => {

        //팝업닫기 custom <ConfirmPop closePop="custom" onCloseHandler={팝업닫는함수} /> 형식으로 쓰면 원하는 팝업닫는함수사용 가능
        if(props.closePop == 'custom'){
            props.onCloseHandler();
        }

        //창 이동 <ConfirmPop goBack={1}/> 형식으로 쓰면 숫자만큼 확인후 뒤로감
        if(props.goBack){
            navigate(-props.goBack);
        }

        if(!props.goBack && !props.closePop){
            dispatch(confirmPop({confirmPop:false}));
        }
    };


    return createPortal(
        <>
            {popup.confirmPop &&
                <div className="confirm_pop">
                    <div className="dim"></div>
                    <div className="pop_cont">
                        <div className="pop_tit flex_between">
                            <p>{popup.confirmPopTit}</p>
                            <button type="button" className="btn_close" onClick={closePopHandler}>닫기버튼</button>
                        </div>
                        <p className="txt" dangerouslySetInnerHTML={{__html:popup.confirmPopTxt}}></p>
                        {popup.confirmPopBtn === 1 &&
                            <div className="btn_box">
                                <button type="button" className="btn_type4" onClick={closePopHandler}>확인</button>
                            </div>
                        }
                        {popup.confirmPopBtn === 2 &&
                            <div className="btn_box2">
                                <button type="button" className="btn_type4" onClick={()=>{
                                    props.onClickHandler();
                                    closePopHandler();
                                }}>확인</button>
                                <button type="button" className="btn_type3" onClick={closePopHandler}>취소</button>
                            </div>
                        }
                    </div>
                </div>
            }
        </>,
        document.getElementById('modal-root')
    );
};

export default ConfirmPop;