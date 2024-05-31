import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import axios from "axios";
import { confirmPop } from "../../store/popupSlice";
import util from "../../config/util";
import { enum_api_uri } from "../../config/enum";
import * as CF from "../../config/function";
import ConfirmPop from "../../components/popup/ConfirmPop";


const OpenPopup = () => {
    const dispatch = useDispatch();
    const { idx } = useParams();
    const popup_detail = enum_api_uri.popup_detail;
    const [confirm, setConfirm] = useState(false);
    const [data, setData] = useState({});


    //상세정보 가져오기
    const getPopupData = () => {
        axios.get(`${popup_detail.replace(":idx",idx)}`)
        .then((res)=>{
            if(res.status === 200){
                let data = res.data.data;
                setData(data);
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
        getPopupData();
    },[]);


    //링크있을때 클릭시
    const linkHandler = () => {
        const link = data.p_link_url;
        if(link){
            if(data.p_link_target[0] == 1){
                window.location.href = link;  
            }else{
                window.open(link);
            }
        }
    };


    //오늘하루열지않기
    const todayHideClosePop = () => {
        // 쿠키에서 기존 리스트 가져오기
        const existingList = util.getCookie("hidePopupList") || [];

        // 새로운 항목 추가
        const newList = [...existingList, data.idx];

        // 쿠키에 저장
        util.setCookie("hidePopupList", newList, 1);
        
        closePop();
    };

    //팝업닫기
    const closePop = () => {
        window.close();
    };

    return(<>
        <div className="user_pop_cont">
            <div className={`box${data.p_scroll == "Y" ? " scroll" : ""}${data.p_link_url ? " pointer" : ""}`} 
                style={{"width":data.p_width_size,"height":data.p_height_size}} 
                dangerouslySetInnerHTML={{ __html: data.p_content }}
                onClick={linkHandler}
            ></div>
            <div className={`btn_box${data.p_one_day == "Y" ? " btn_box2" : ""}`}>
                {data.p_one_day == "Y" &&
                    <button type="button" onClick={todayHideClosePop}>오늘 하루 열지 않기</button>
                }
                <button type="button" className="btn_close" onClick={closePop}>창닫기</button>
            </div>
        </div>

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default OpenPopup;