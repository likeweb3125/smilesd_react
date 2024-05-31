import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closePopIdx } from "../../../store/etcSlice";
import util from "../../../config/util";


const PopCont = ({data}) => {
    const dispatch = useDispatch();

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
        dispatch(closePopIdx(data.idx));
    };


    return(<>
        <div className="pop_cont user_pop_cont" 
            style={{"top":data.p_top_point,"left":data.p_left_point}}
        >
            <div className={`box${data.p_scroll == "Y" ? " scroll" : ""}${data.p_link_url ? " pointer" : ""}`} 
                style={{"width":data.p_width_size,"height":data.p_height_size,}} 
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
    </>);
};


const UserPop = (props) => {
    const [list, setList] = useState([]);
    const etc = useSelector((state)=>state.etc);


    useEffect(()=>{
        const list = props.list.reverse(); //최신순으로나오게 순서거꾸로변경
        const hideList = util.getCookie("hidePopupList") || [];

        //쿠키에 저장된 오늘은그만보기 팝업제외하고 노출
        const newList = list.filter(item => !hideList.includes(item.idx));
        setList(newList);
    },[props.list]);


    //닫은팝업제외하고 팝업리스트 다시 정렬
    useEffect(()=>{
        const prevList = [...list];
        if(etc.closePopIdx !== null){
            const newList = prevList.filter((item)=>item.idx !== etc.closePopIdx);
            setList(newList)
        }
    },[etc.closePopIdx]);


    return(<>
        {list.length > 0 &&
            <div className={`user_pop_wrap${props.mo ? " mo_pop" : ""}`}>
                <div className="dim"></div>
                {list.map((data,i)=>{
                    return(
                        <PopCont 
                            key={i}
                            data={data}
                        />
                    );
                })}
            </div>
        }
    </>);
};

export default UserPop;