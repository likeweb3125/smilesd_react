import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import * as CF from "../../../config/function";
import { enum_api_uri } from "../../../config/enum";
import { boardMenu } from "../../../store/commonSlice";
import { confirmPop } from "../../../store/popupSlice";
import ConfirmPop from "../../popup/ConfirmPop";


const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { board_category } = useParams();
    const { board_idx } = useParams();
    const board_menu_list = enum_api_uri.board_menu_list;
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const [menuOn, setMenuOn] = useState(null);
    const [eventHeight, setEventHeight] = useState(0);
    const [eventList, setEventList] = useState(['론첼 갤러리','론첼 갤러리_B2B','뉴트렉스']);
    const [confirm, setConfirm] = useState(false);
    const eventRef = useRef();
    const event1Ref = useRef();
    const location = useLocation();


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);


    //url 변경될때마다 헤더메뉴 on값 변경
    useEffect(()=>{
        const path = location.pathname;

        //이벤트
        if(path === "/console/event/event/event1"){
            setMenuOn("event1_1");
        }
        if(path === "/console/event/event/event2"){
            setMenuOn("event1_2");
        }
        if(path === "/console/event/event/event3"){
            setMenuOn("event1_3");
        }
    },[location.pathname]);


    //이벤트 - 이벤트리스트 값 변경될때마다 이벤트 높이값 구하기
    useEffect(()=>{
        setEventHeight(eventRef.current.scrollHeight);
    },[eventList]);


    //메뉴 on 변경시 슬라이드애니메이션 
    useEffect(() => {
        if(menuOn){
            //이벤트
            if(menuOn === "event" || menuOn.includes("event1")) {
                let eventH = eventHeight;

                if(eventList.length > 0){
                    if (menuOn.includes("event1")) {
                        eventH = eventH + event1Ref.current.scrollHeight;
                        event1Ref.current.style.height = `${event1Ref.current.scrollHeight}px`;
                    }else{
                        event1Ref.current.style.height = "0";
                    }
                }

                eventRef.current.style.height = `${eventH}px`;
            }else{
                eventRef.current.style.height = "0";
            }
        }else{
            if(eventRef.current){
                eventRef.current.style.height = "0";
            }
            if(event1Ref.current){
                event1Ref.current.style.height = "0";
            }
        }
    }, [menuOn, eventHeight]);



    return(<>
        <header id="header" className="header">
            <div className="menu_header">
                <div className="logo_wrap">
                    <h1 className="logo">
                        <Link to="#">관리자</Link>
                    </h1>
                </div>
                <div className="menu_wrap">
                    <nav>
                        <ul className="admin_gnb">
                            <li className={menuOn && menuOn.includes("event") ? "on" : ""}>
                                <button type="button" className="btn_menu admin_board" onClick={()=>{setMenuOn("event")}}><span>이벤트</span></button>
                                <ul className="depth2" ref={eventRef}>
                                    {eventList.length > 0 &&
                                        <li className={`is_depth${menuOn && menuOn.includes("event1") ? " on" : ""}`}>
                                            <button type="button" className="menu" onClick={()=>setMenuOn('event1')} >이벤트</button>
                                            <ul className="depth3" ref={event1Ref}>
                                                {eventList.map((cont,i)=>{
                                                    const idx = i+1;
                                                    return(
                                                        <li key={i}
                                                            className={menuOn === `event1_${idx}` ? "on" : ""} 
                                                        >
                                                            <Link to={`/console/event/event/event${idx}`}>{cont}</Link>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </li>
                                    }

                                </ul>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </header>

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default Header;