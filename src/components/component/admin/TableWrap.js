import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import 'moment/locale/ko'; 
import * as CF from "../../../config/function";
import { enum_api_uri } from "../../../config/enum";
import { checkedList, menuCheckList, unMenuCheckList } from "../../../store/etcSlice";
import { confirmPop, adminPolicyPop, adminPopupPop, adminMemberInfoPop, adminCategoryPopModify } from "../../../store/popupSlice";
import { scrollY } from "../../../store/commonSlice";
import DndTr from "./DndTr";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    MouseSensor,
    useSensor,
    useSensors,
  } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import ConfirmPop from "../../popup/ConfirmPop";


const TableWrap = (props) => {
    const dispatch = useDispatch();
    const etc = useSelector((state)=>state.etc);
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const common = useSelector((state)=>state.common);
    const api_uri = enum_api_uri.api_uri;
    const banner_move = enum_api_uri.banner_move;
    const menu_move = enum_api_uri.menu_move;
    const [confirm, setConfirm] = useState(false);
    const [colgroup, setColgroup] = useState([]);
    const [thList, setThList] = useState([]);
    const [tdList, setTdList] = useState([]);
    const [levelList, setLevelList] = useState([]);


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);


    
    //체크박스 체크시
    const checkHandler = (checked, value) => {
        const val = parseInt(value, 10); //input의 value 가 문자열로 처리됨으로 숫자로 변경해줌

        let newList;
        
        //메뉴관리 - 카테고리관리일때
        if(props.type === 'menu'){
            if(props.unMenu){ //미설정목록일때  
                newList = etc.unMenuCheckList;
            }else if(props.menuDepth === 1){ //1차카테고리일때  
                newList = etc.checkedList;
            }else{
                newList = etc.menuCheckList;
            }
        }else{
            newList = etc.checkedList;
        }

        if(checked){
            newList = newList.concat(val);
        }else if(!checked && newList.includes(val)){
            newList = newList.filter((el)=>el !== val);
        }

        //메뉴관리 - 카테고리관리일때
        if(props.type === 'menu'){ 
            if(props.unMenu){ //미설정목록일때     
                dispatch(unMenuCheckList(newList));
            }else if(props.menuDepth === 1){ //1차카테고리일때  
                dispatch(checkedList(newList));
            }else{
                dispatch(menuCheckList(newList));
            }
        }else{
            dispatch(checkedList(newList));
        }
    };


    //테이블 colgroup
    useEffect(()=>{
        const list = props.colgroup;
        
        //문의게시판일때 colgroup 추가 (답변상태)
        if(props.type === "board" && props.data.c_content_type === 7){
            list.splice(2,0,"100px");
        }

        //게시판분류 사용시 colgroup 추가 (분류유형)
        if(props.type === "board" && props.data.b_group == "Y"){
            const index = list.length - 3; //뒤에서 3번째에 추가
            list.splice(index,0,"12%");
        }

        setColgroup(list);
    },[props.colgroup]);


    //테이블 th
    useEffect(()=>{
        const list = props.thList;

        //문의게시판일때 th 추가 (답변상태)
        if(props.type === "board" && props.data.c_content_type === 7){
            list.splice(2,0,"답변상태");
        }

        //게시판분류 사용시 th 추가 (분류유형)
        if(props.type === "board" && props.data.b_group == "Y"){
            const index = list.length - 3; //뒤에서 3번째에 추가
            list.splice(index,0,"분류유형");
        }

        setThList(list);
    },[props.thList]);


    //테이블 td
    useEffect(()=>{
        setTdList(props.tdList);
    },[props.tdList]);


    //회원등급리스트 가져오기
    useEffect(()=>{
        const list = common.userLevelList;
        setLevelList(list);
    },[common.userLevelList]);


    //메인배너 드래그앤드롭---------------------
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
              distance: 5,
            },
        }),
        useSensor(MouseSensor, {
            activationConstraint: {
              distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );


    const handleDragEnd = (event) => {
        const {active, over} = event;

        if (active.id !== over.id) {
            const list = tdList;

            //디자인관리 - 메인배너관리 일때
            if(props.type === "banner"){
                const moveTd = list.find((item) => item.idx === over.id);
                const moveNum = moveTd.b_moveNum;

                const body = {
                    idx:active.id,
                    moveNum:moveNum,
                };

                axios.put(banner_move, body,
                    {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
                )
                .then((res)=>{
                    if(res.status === 200){
                        setTdList((items) => {
                            const oldIndex = items.findIndex((item) => item.idx === active.id);
                            const newIndex = items.findIndex((item) => item.idx === over.id);
            
                            return arrayMove(items, oldIndex, newIndex);
                        });
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
            }
            //메뉴관리 - 카테고리관리일때
            if(props.type === "menu"){
                const c_depth = active.data.current.c_depth;
                const c_depth_parent = active.data.current.c_depth_parent;
                // const moveTd = list.find((item) => item.id === over.id);
                // const moveNum = moveTd.c_num;
                const moveNum = over.data.current.order;

                const body = {
                    id: active.id,
                    c_depth: c_depth,
                    c_depth_parent: c_depth_parent,
                    c_num: moveNum,
                };

                axios.put(menu_move, body,
                    {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
                )
                .then((res)=>{
                    if(res.status === 200){
                        setTdList((items) => {
                            const oldIndex = items.findIndex((item) => item.id === active.id);
                            const newIndex = items.findIndex((item) => item.id === over.id);
            
                            return arrayMove(items, oldIndex, newIndex);
                        });

                        //1차카테고리관리일때
                        if(props.menuDepth === 1){
                            dispatch(adminCategoryPopModify(true));
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
            }
        }
    }
    


    return(<>
        <div className={props.className}>
            {tdList && tdList.length > 0 ?
                //디자인관리 - 메인배너관리 일때
                props.type === "banner" ?
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <table>
                            <colgroup>
                                {colgroup.map((cont,i)=>{
                                    return(<col key={i} style={{width: cont}}/>);
                                })}
                            </colgroup>
                            <thead>
                                <tr>
                                    {props.thList.map((cont,i)=>{
                                        return(<th key={i}>{cont}</th>);
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                <SortableContext
                                    items={tdList.map(({idx}) => idx)}
                                    strategy={rectSortingStrategy}
                                >
                                        {tdList.map((cont,i)=>(
                                            <tr key={i}
                                                className={cont.b_open[0] == "Y" ? "" : "disabled"}
                                            >
                                                <DndTr 
                                                    data={cont} 
                                                    id={cont.idx}
                                                    onCheckHandler={checkHandler}
                                                    colgroup={colgroup}
                                                    popType={props.popType}
                                                    type={props.type}
                                                />  
                                            </tr>                                                                                                                                                                            
                                        ))}
                                </SortableContext>
                            </tbody>
                        </table>
                    </DndContext>
                :props.type === "menu" ? //메뉴관리 - 카테고리관리일때
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <table>
                            <colgroup>
                                {colgroup.map((cont,i)=>{
                                    return(<col key={i} style={{width: cont}}/>);
                                })}
                            </colgroup>
                            <thead>
                                <tr>
                                    {props.thList.map((cont,i)=>{
                                        return(<th key={i}>{cont}</th>);
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                <SortableContext
                                    items={tdList.map(({id}) => id)}
                                    strategy={rectSortingStrategy}
                                >
                                        {tdList.map((cont,i)=>(
                                            <tr key={i}>
                                                <DndTr 
                                                    order={i+1}
                                                    data={cont} 
                                                    id={cont.id}
                                                    onCheckHandler={checkHandler}
                                                    colgroup={colgroup}
                                                    type={props.type}
                                                    unMenu={props.unMenu}
                                                    menuDepth={props.menuDepth}
                                                    onMappingHandler={props.onMappingHandler}
                                                    onMenuClickHandler={props.onMenuClickHandler}
                                                />  
                                            </tr>                                                                                                                                                                            
                                        ))}
                                </SortableContext>
                            </tbody>
                        </table>
                    </DndContext>   
                :
                    <table>
                        <colgroup>
                            {colgroup.map((cont,i)=>{
                                return(<col key={i} style={{width: cont}}/>);
                            })}
                        </colgroup>
                        <thead>
                            <tr>
                                {props.thList.map((cont,i)=>{
                                    return(<th key={i}>{cont}</th>);
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {tdList && tdList.map((cont,i)=>{
                                //이벤트 - 이벤트 내역 일때
                                if(props.type === "event_list"){
                                    return(
                                        <tr key={i}>
                                            <td>{cont.company}</td>
                                            <td>{cont.position}</td>
                                            <td>{cont.name}</td>
                                            <td>{cont.flg == null ? '-' : cont.flg}</td>
                                            <td>{cont.reg_date}</td>
                                        </tr>
                                    );
                                }

                                //메인페이지 최근게시판조회 일때
                                if(props.type === "main_board"){
                                    return(
                                        <tr key={i}>
                                            <td>{cont.idx}</td>
                                            <td>{cont.c_name}</td>
                                            <td>
                                                <div className="txt_left">
                                                    <span>
                                                        <Link to={`/console/board/post/detail/${cont.category}/${cont.idx}`}>{cont.b_title}</Link>
                                                    </span>
                                                </div>
                                            </td>
                                            <td>{cont.month}</td>
                                        </tr>
                                    );
                                }
                                //메인페이지 접속자이력조회 일때
                                if(props.type === "main_connector"){
                                    return(
                                        <tr key={i}>
                                            <td>{cont.user}</td>
                                            <td>{cont.clientIp}</td>
                                            <td>
                                                <div className="txt_left">
                                                    <span>{cont.userAgent}</span>
                                                </div>
                                            </td>
                                            <td>{cont.reg_date}</td>
                                        </tr>
                                    );
                                }
                                //게시판관리 - 게시글관리 일때
                                if(props.type === "board"){
                                    let type;
                                    if(cont.c_content_type === 4){
                                        type = "일반";
                                    }else if(cont.c_content_type === 5){
                                        type = "갤러리";
                                    }else if(cont.c_content_type === 6){
                                        type = "FAQ";
                                    }else if(cont.c_content_type === 7){
                                        type = "문의";
                                    }
                                    return(
                                        <tr key={i}>
                                            <td>
                                                <div className="chk_box2">
                                                    <input type="checkbox" id={`check_${cont.idx}`} className="blind"
                                                        value={cont.idx}
                                                        onChange={(e) => {
                                                            const isChecked = e.currentTarget.checked;
                                                            const value = e.currentTarget.value;
                                                            checkHandler(isChecked, value);
                                                        }}
                                                        checked={etc.checkedList.includes(cont.idx)}
                                                    />
                                                    <label htmlFor={`check_${cont.idx}`}>선택</label>
                                                </div>
                                            </td>
                                            <td>{cont.num}</td>
                                            {type == "문의" && 
                                                <td><em className={`answer_status${cont.g_status == "답변완료" ? " on" : ""}`}>{cont.g_status}</em></td>
                                            }
                                            <td>
                                                <div className="txt_left">
                                                    <span onClick={()=>{dispatch(scrollY(window.scrollY))}}>
                                                        <Link to={`/console/board/post/detail/${cont.category}/${cont.idx}`}>{cont.b_title}</Link>
                                                    </span>
                                                    {cont.comment_count > 0 && <b>({CF.MakeIntComma(cont.comment_count)})</b>}
                                                </div>
                                            </td>
                                            <td>{type}</td>
                                            {props.data.b_group == "Y"  &&
                                                <td>{cont.g_name}</td>
                                            }
                                            <td>
                                                <button className="link">{cont.m_name}</button>
                                            </td>
                                            <td>
                                                <span className="txt_light">{cont.b_reg_date}</span>
                                            </td>
                                            <td>
                                                <button type="button" 
                                                    className={`btn_type10${cont.b_notice == '1' ? " on" : ""}`}
                                                    onClick={()=>props.onNotiSettingHandler(cont)}
                                                >{`공지${cont.b_notice == '1' ? " 해제" : " 설정"}`}</button>
                                            </td>
                                        </tr>
                                    );
                                }
                                //게시판관리 - 댓글관리 일때
                                if(props.type === "comment"){
                                    const time = moment(cont.c_reg_date).format('YYYY-MM-DD A hh:mm:ss');

                                    return(
                                        <tr key={i}>
                                            <td>
                                                <div className="chk_box2">
                                                    <input type="checkbox" id={`check_${cont.idx}`} className="blind"
                                                        value={cont.idx}
                                                        onChange={(e) => {
                                                            const isChecked = e.currentTarget.checked;
                                                            const value = e.currentTarget.value;
                                                            checkHandler(isChecked, value);
                                                        }}
                                                        checked={etc.checkedList.includes(cont.idx)}
                                                    />
                                                    <label htmlFor={`check_${cont.idx}`}>선택</label>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="txt_left">
                                                    <span onClick={()=>{dispatch(scrollY(window.scrollY))}}>
                                                        <Link to={`/console/board/post/detail/${cont.category}/${cont.board_idx}`}>{cont.c_contents}</Link> 
                                                    </span>
                                                </div>
                                            </td>
                                            <td>{cont.boardName}</td>
                                            <td>{cont.boardTitle}</td>
                                            <td>{cont.m_name}</td>
                                            <td>
                                                <span className="txt_light">{time}</span>
                                            </td>
                                        </tr>
                                    );
                                }
                                //회원관리 - 회원관리, 관리자관리 일때
                                if(props.type === "member"){
                                    //회원등급 이름
                                    let level;
                                    let l_name;
                                    if(levelList.length > 0){
                                        level = levelList.find((item) => item.l_level == cont.m_level);
                                        l_name = level.l_name;
                                    }

                                    return(
                                        <tr key={i}>
                                            <td>
                                                <div className="chk_box2">
                                                    <input type="checkbox" id={`check_${cont.idx}`} className="blind"
                                                        value={cont.idx}
                                                        onChange={(e) => {
                                                            const isChecked = e.currentTarget.checked;
                                                            const value = e.currentTarget.value;
                                                            checkHandler(isChecked, value);
                                                        }}
                                                        checked={etc.checkedList.includes(cont.idx)}
                                                    />
                                                    <label htmlFor={`check_${cont.idx}`}>선택</label>
                                                </div>
                                            </td>
                                            <td>
                                                <button type="button" className="link" 
                                                    onClick={()=>{
                                                        dispatch(adminMemberInfoPop({adminMemberInfoPop:true,adminMemberInfoPopIdx:cont.idx}));
                                                    }}>
                                                    <span>{cont.m_email}</span>
                                                </button>
                                            </td>
                                            <td>
                                                <button type="button" className="link" 
                                                    onClick={()=>{
                                                        dispatch(adminMemberInfoPop({adminMemberInfoPop:true,adminMemberInfoPopIdx:cont.idx}));
                                                    }}>
                                                    <span>{cont.m_name}</span>
                                                </button>
                                            </td>
                                            <td>
                                                <div className="user_level">
                                                    <strong>{l_name}</strong>
                                                    <em>lv.{cont.m_level}</em>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="txt_light">{cont.reg_date}</span>
                                            </td>
                                            <td>{cont.m_mobile}</td>
                                            <td>{CF.MakeIntComma(cont.log_cnt)}</td>
                                            <td>{CF.MakeIntComma(cont.board_cnt)}</td>
                                            <td>{CF.MakeIntComma(cont.comment_cnt)}</td>
                                        </tr>
                                    );
                                }
                                //회원관리 - 탈퇴회원 일때
                                if(props.type === "member_cancel"){
                                    return(
                                        <tr key={i}>
                                            <td>
                                                <div className="chk_box2">
                                                    <input type="checkbox" id={`check_${cont.id}`} className="blind"
                                                        value={cont.id}
                                                        onChange={(e) => {
                                                            const isChecked = e.currentTarget.checked;
                                                            const value = e.currentTarget.value;
                                                            checkHandler(isChecked, value);
                                                        }}
                                                        checked={etc.checkedList.includes(cont.id)}
                                                    />
                                                    <label htmlFor={`check_${cont.id}`}>선택</label>
                                                </div>
                                            </td>
                                            <td>{cont.m_email}</td>
                                        </tr>
                                    );
                                }
                                //디자인관리 - 팝업관리 일때
                                if(props.type === "popup"){
                                    return(
                                        <tr key={i} className={cont.p_open[0] == "Y" ? "" : "disabled"}>
                                            <td>
                                                <div className="chk_box2">
                                                    <input type="checkbox" id={`check_${cont.idx}`} className="blind"
                                                        value={cont.idx}
                                                        onChange={(e) => {
                                                            const isChecked = e.currentTarget.checked;
                                                            const value = e.currentTarget.value;
                                                            checkHandler(isChecked, value);
                                                        }}
                                                        checked={etc.checkedList.includes(cont.idx)}
                                                    />
                                                    <label htmlFor={`check_${cont.idx}`}>선택</label>
                                                </div>
                                            </td>
                                            <td>{cont.idx}</td>
                                            <td>
                                                <button type="button" className="link" 
                                                    onClick={()=>{
                                                        dispatch(adminPopupPop({adminPopupPop:true,adminPopupPopIdx:cont.idx,adminPopupPopType:props.popType,adminPopupPopLang:props.popLang}));
                                                    }}>{cont.p_title}</button>
                                            </td>
                                            <td>{cont.p_s_date}{cont.p_e_date && " ~ "+cont.p_e_date}</td>
                                            <td>{`${cont.p_width_size} X ${cont.p_height_size}`} / {cont.p_one_day == "Y" ? "사용" : "미사용"}</td>
                                            <td>{props.popType == "P" && `${cont.p_left_point} X ${cont.p_top_point}`}</td>
                                            <td>
                                                <em className={cont.p_open[0] == "Y" ? "txt_color1" : "txt_color2"}>{cont.p_open[1]}</em>
                                            </td>
                                            <td>{cont.p_layer_pop[1]}</td>
                                        </tr>
                                    );
                                }
                                //환경설정 - 운영정책설정 일때
                                if(props.type === "policy"){
                                    return(
                                        <tr key={i} className={cont.p_use_yn == "Y" ? "" : "disabled"}>
                                            <td>
                                                <div className="chk_box2">
                                                    <input type="checkbox" id={`check_${cont.idx}`} className="blind"
                                                        value={cont.idx}
                                                        onChange={(e) => {
                                                            const isChecked = e.currentTarget.checked;
                                                            const value = e.currentTarget.value;
                                                            checkHandler(isChecked, value);
                                                        }}
                                                        checked={etc.checkedList.includes(cont.idx)}
                                                    />
                                                    <label htmlFor={`check_${cont.idx}`}>선택</label>
                                                </div>
                                            </td>
                                            <td>{cont.num}</td>
                                            <td className="tx_l">
                                                <button type="button" className="link" 
                                                    onClick={()=>{
                                                        dispatch(adminPolicyPop({adminPolicyPop:true,adminPolicyPopIdx:cont.idx,adminPolicyPopLang:props.popLang}));
                                                    }}>
                                                    <span className="ellipsis">{cont.p_title}</span>
                                                </button>
                                            </td>
                                            <td>
                                                <span className="txt_light">{cont.p_reg_date}</span>
                                            </td>
                                            <td>
                                                {cont.p_use_yn == "Y" ? <em className="txt_color1">노출</em>
                                                    :   <em className="txt_color2">중단</em>
                                                }
                                            </td>
                                        </tr>
                                    );
                                }
                                //통계관리 - 전체통계 - 기간별현황통계 일때
                                if(props.type === "stats"){
                                    return(
                                        <tr key={i}>
                                            <td><em className="tbl_bold">{cont.date}</em></td>
                                            <td>{CF.MakeIntComma(cont.logsCnt)}</td>
                                            <td>{CF.MakeIntComma(cont.userCnt)}</td>
                                            <td>{CF.MakeIntComma(cont.boardCnt)}</td>
                                            <td>{CF.MakeIntComma(cont.commentCnt)}</td>
                                        </tr>
                                    );
                                }
                                //통계관리 - 접속자이력통계 일때
                                if(props.type === "visitor"){
                                    return(
                                        <tr key={i}>
                                            <td></td>
                                            <td>{cont.user}</td>
                                            <td>{cont.clientIp}</td>
                                            <td>{cont.previousUrl}</td>
                                            <td>{cont.userAgent}</td>
                                            <td>{cont.reg_date}</td>
                                        </tr>
                                    );
                                }
                                //통계관리 - 최다접속경로, 최다브라우저 팝업 일때
                                if(props.type === "visitor_history"){
                                    return(
                                        <tr key={i}>
                                            <td>{cont.row_number}</td>
                                            <td>{cont.previousUrl ? cont.previousUrl : cont.userAgent }</td>
                                            <td>{cont.cnt}</td>
                                        </tr>
                                    );
                                }
                                //유지보수게시판 일때
                                if(props.type === "maint"){
                                    let color ="";
                                    if(cont.process == "처리완료"){
                                        color = " txt_color1";
                                    }
                                    if(cont.process == "접수완료"){
                                        color = " txt_color3";
                                    }
                                    if(cont.process == "재요청"){
                                        color = " txt_color2";
                                    }
                                    if(cont.process == "검토중"){
                                        color = " txt_color4";
                                    }

                                    return(
                                        <tr key={i}>
                                            <td>1</td>
                                            <td>
                                                <div className="txt_left">
                                                    <span onClick={()=>{dispatch(scrollY(window.scrollY))}}>
                                                        <Link to={`/console/maint/detail/${cont.list_no}`}>{cont.subject}</Link>
                                                        {cont.comment_count > 0 && <b>({CF.MakeIntComma(cont.comment_count)})</b>}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>{cont.name}</td>
                                            <td>
                                                <em className={`maint_status${color}`}>{cont.process}</em>
                                            </td>
                                            <td>
                                                <span className="txt_light">{cont.w_date}</span>
                                            </td>
                                        </tr>
                                    );
                                }
                            })}
                        </tbody>
                    </table>
            : tdList && tdList.length === 0 && <div className="none_data">데이터가 없습니다.</div>
            }
        </div>

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default TableWrap;