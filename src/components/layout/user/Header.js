import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from "axios";
import * as CF from "../../../config/function";
import { enum_api_uri } from "../../../config/enum";
import { confirmPop } from "../../../store/popupSlice";
import { headerMenuList, siteLang } from "../../../store/commonSlice";
import { loginStatus, loginUser, siteId, maintName } from "../../../store/userSlice";
import SelectBox from "../../component/SelectBox";
import ConfirmPop from "../../popup/ConfirmPop";
import logo from "../../../images/logo.png";


const Header = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const popup = useSelector((state)=>state.popup);
    const common = useSelector((state)=>state.common);
    const user = useSelector((state)=>state.user);
    const menu_list = enum_api_uri.menu_list;
    const { menu_idx } = useParams();
    const [confirm, setConfirm] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMoMenuOpen, setIsMoMenuOpen] = useState(false);
    const [siteInfo, setSiteInfo] = useState({});
    const [menuList, setMenuList] = useState([]);
    const [menuOn, setMenuOn] = useState(null);
    const [menu1On, setMenu1On] = useState(null);
    const [menu2On, setMenu2On] = useState(null);
    const [menu3On, setMenu3On] = useState(null);
    const [moMenu1On, setMoMenu1On] = useState(null);
    const [moMenu2On, setMoMenu2On] = useState(null);
    const [moMenu3On, setMoMenu3On] = useState(null);
    const [login, setLogin] = useState(false);
    const [langList, setLangList] = useState([]);
    const [lang, setLang] = useState('');
    const [firstRender, setFirstRender] = useState(false);


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);


    //사이트 정보
    useEffect(()=>{
        setSiteInfo(common.siteInfo);
    },[common.siteInfo]);


    useEffect(()=>{
        setLangList(common.siteLangList);
    },[common.siteLangList]);

    useEffect(()=>{
        setLang(common.siteLang);
    },[common.siteLang]);


    //헤더메뉴 토글
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };


    //모바일헤더메뉴 토글
    const toggleMoMenu = () => {
        setIsMoMenuOpen(!isMoMenuOpen);
    };


    //페이지이동시 메뉴닫기
    useEffect(()=>{
        setIsMenuOpen(false);
        setIsMoMenuOpen(false);
    },[location]);


    //메뉴리스트중에 원하는 id 메뉴 찾기
    function findObjectById(dataArray, targetId) {
        for (const item of dataArray) {
            // 현재 객체의 id를 비교하여 찾는다
            if (item.id == targetId) {
                return item;
            }
            
            // 현재 객체에 submenu가 있는지 확인하고, 있을 경우 재귀적으로 검색한다
            if (item.submenu) {
                const result = findObjectById(item.submenu, targetId);
                if (result) {
                    return result;
                }
            }
        }
        
        // 찾지 못한 경우 null 반환
        return null;
    }


    //서브페이지 이동시 헤더매뉴 on (부모까지 찾아서 on)
    useEffect(()=>{
        if(menu_idx && menuList.length > 0){
            const targetObject = findObjectById(menuList, menu_idx);
            const depth = targetObject.c_depth;

            if(depth === 2){
                setMenuOn(targetObject.c_depth_parent);
                setMenu2On(targetObject.id);
            }
            if(depth === 3){
                setMenu2On(targetObject.c_depth_parent);
                setMenu3On(targetObject.id);

                const menu2Data = findObjectById(menuList, targetObject.c_depth_parent);
                const menu1Id = menu2Data.c_depth_parent;
                setMenuOn(menu1Id);
            }
        }else{
            setMenuOn(null);
            setMenu1On(null);
            setMenu2On(null);
            setMenu3On(null);
        }
    },[menu_idx, menuList]);


    // 전체메뉴 가져오기
    const getMenuList = () => {
        let lang = 'KR';
        if(common.siteLang){
            lang = common.siteLang;
        }

        axios.get(`${menu_list}?c_lang=${lang}`)
        .then((res)=>{
            if(res.status === 200){
                const data = res.data.data;
                const list = data.filter(item => item.id != 0);
                setMenuList(list);
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


    //맨처음 전체메뉴 가져오기
    useEffect(()=>{
        getMenuList();

        if(!firstRender){
            setFirstRender(true);
        }
    },[]);


    //사이트언어변경시 전체메뉴 가져오기
    useEffect(()=>{
        if(firstRender){
            navigate('/');
            getMenuList();
        }
    },[common.siteLang]);


    //전체메뉴값 변경시 store에 저장
    useEffect(()=>{
        dispatch(headerMenuList(menuList));
    },[menuList]);


    //로그인인지 체크
    useEffect(()=>{
        if(user.loginStatus){
            setLogin(true);
        }else{
            setLogin(false);
        }
    },[user.loginStatus]);


    //하위메뉴들중 빈메뉴아닌메뉴 찾기
    const findSubMenu = (data) => {
        if (data.submenu && data.submenu.length > 0) {
            for (const item of data.submenu) {
                if (item.c_content_type && item.c_content_type[0] !== 2) {
                    return item;
                }
                if (item.submenu && item.submenu.length > 0) {
                    const subItem = findSubMenu(item);
                    if (subItem && subItem.c_content_type && subItem.c_content_type[0] !== 2) {
                        return subItem;
                    }
                }
            }
        }
        return null;
    };


    //메뉴 클릭시
    const menuClickHandler = (depth, data) => {
        console.log(data);
        const id = data.id;

        let url;

        //1차메뉴일때
        if(depth === 1){
            setMenu1On(id);
            //하위메뉴가 빈메뉴아닐때
            if(data.submenu && data.submenu[0].c_content_type[0] !== 2){
                const type = data.submenu[0].c_content_type[0];
                //카테고리종류 HTML 일때
                if(type === 1){
                    url = '/sub/html/'+data.submenu[0].id;
                }
                //카테고리종류 빈메뉴 일때
                if(type === 2){
                    dispatch(confirmPop({
                        confirmPop:true,
                        confirmPopTit:'알림',
                        confirmPopTxt:'빈 메뉴 입니다.',
                        confirmPopBtn:1,
                    }));
                    setConfirm(true);
                }
                //카테고리종류 고객맞춤 일때
                if(type === 3){
                    url = '/sub/custom/'+data.submenu[0].id;
                }
                //카테고리종류 일반게시판 or 갤러리게시판 일때
                if(type === 4 || type === 5){
                    url = '/sub/board/'+data.submenu[0].id;
                }
                //카테고리종류 FAQ 일때
                if(type === 6){
                    url = '/sub/faq/'+data.submenu[0].id;
                }
                //카테고리종류 문의게시판 일때
                if(type === 7){
                    url = '/sub/inquiry/'+data.submenu[0].id;
                }
                navigate(url);
            }
            //하위메뉴가 빈메뉴일때
            else if(data.submenu && data.submenu[0].c_content_type[0] === 2){
                const foundSubMenu = findSubMenu(data);
                if(foundSubMenu){
                    const type = foundSubMenu.c_content_type[0];

                    //카테고리종류 HTML 일때
                    if(type === 1){
                        url = '/sub/html/'+foundSubMenu.id;
                    }
                    //카테고리종류 빈메뉴 일때
                    if(type === 2){
                        dispatch(confirmPop({
                            confirmPop:true,
                            confirmPopTit:'알림',
                            confirmPopTxt:'빈 메뉴 입니다.',
                            confirmPopBtn:1,
                        }));
                        setConfirm(true);
                    }
                    //카테고리종류 고객맞춤 일때
                    if(type === 3){
                        url = '/sub/custom/'+foundSubMenu.id;
                    }
                    //카테고리종류 일반게시판 or 갤러리게시판 일때
                    if(type === 4 || type === 5){
                        url = '/sub/board/'+foundSubMenu.id;
                    }
                    //카테고리종류 FAQ 일때
                    if(type === 6){
                        url = '/sub/faq/'+foundSubMenu.id;
                    }
                    //카테고리종류 문의게시판 일때
                    if(type === 7){
                        url = '/sub/inquiry/'+foundSubMenu.id;
                    }
                    navigate(url);
                }
            }else{
                dispatch(confirmPop({
                    confirmPop:true,
                    confirmPopTit:'알림',
                    confirmPopTxt:'하위메뉴가 없습니다.',
                    confirmPopBtn:1,
                }));
                setConfirm(true);
            }
        }


        //2차메뉴일때
        if(depth === 2){
            //하위메뉴가 빈메뉴아닐때
            if(data.c_content_type[0] !== 2){
                const type = data.c_content_type[0];
                //카테고리종류 HTML 일때
                if(type === 1){
                    url = '/sub/html/'+data.id;
                }
                //카테고리종류 빈메뉴 일때
                if(type === 2){
                    dispatch(confirmPop({
                        confirmPop:true,
                        confirmPopTit:'알림',
                        confirmPopTxt:'빈 메뉴 입니다.',
                        confirmPopBtn:1,
                    }));
                    setConfirm(true);
                }
                //카테고리종류 고객맞춤 일때
                if(type === 3){
                    url = '/sub/custom/'+data.id;
                }
                //카테고리종류 일반게시판 or 갤러리게시판 일때
                if(type === 4 || type === 5){
                    url = '/sub/board/'+data.id;
                }
                //카테고리종류 FAQ 일때
                if(type === 6){
                    url = '/sub/faq/'+data.id;
                }
                //카테고리종류 문의게시판 일때
                if(type === 7){
                    url = '/sub/inquiry/'+data.id;
                }
                navigate(url);

                setMenu2On(id);
            }
            //하위메뉴가 빈메뉴일때
            else if(data.c_content_type[0] === 2){
                const foundSubMenu = findSubMenu(data);
                if(foundSubMenu){
                    const type = foundSubMenu.c_content_type[0];

                    //카테고리종류 HTML 일때
                    if(type === 1){
                        url = '/sub/html/'+foundSubMenu.id;
                    }
                    //카테고리종류 빈메뉴 일때
                    if(type === 2){
                        dispatch(confirmPop({
                            confirmPop:true,
                            confirmPopTit:'알림',
                            confirmPopTxt:'빈 메뉴 입니다.',
                            confirmPopBtn:1,
                        }));
                        setConfirm(true);
                    }
                    //카테고리종류 고객맞춤 일때
                    if(type === 3){
                        url = '/sub/custom/'+foundSubMenu.id;
                    }
                    //카테고리종류 일반게시판 or 갤러리게시판 일때
                    if(type === 4 || type === 5){
                        url = '/sub/board/'+foundSubMenu.id;
                    }
                    //카테고리종류 FAQ 일때
                    if(type === 6){
                        url = '/sub/faq/'+foundSubMenu.id;
                    }
                    //카테고리종류 문의게시판 일때
                    if(type === 7){
                        url = '/sub/inquiry/'+foundSubMenu.id;
                    }
                    navigate(url);

                    setMenu2On(id);
                }else{
                    dispatch(confirmPop({
                        confirmPop:true,
                        confirmPopTit:'알림',
                        confirmPopTxt:'빈 메뉴 입니다.',
                        confirmPopBtn:1,
                    }));
                    setConfirm(true); 
                }
            }
        }

        //3차메뉴일때
        if(depth === 3){
            const type = data.c_content_type[0];

            if(type !== 2){
                setMenu3On(id);
            }

            //카테고리종류 HTML 일때
            if(type === 1){
                url = '/sub/html/'+id;
            }
            //카테고리종류 빈메뉴 일때
            if(type === 2){
                dispatch(confirmPop({
                    confirmPop:true,
                    confirmPopTit:'알림',
                    confirmPopTxt:'빈 메뉴 입니다.',
                    confirmPopBtn:1,
                }));
                setConfirm(true);
            }
            //카테고리종류 고객맞춤 일때
            if(type === 3){
                url = '/sub/custom/'+id;
            }
            //카테고리종류 일반게시판 or 갤러리게시판 일때
            if(type === 4 || type === 5){
                url = '/sub/board/'+id;
            }
            //카테고리종류 FAQ 일때
            if(type === 6){
                url = '/sub/faq/'+id;
            }
            //카테고리종류 문의게시판 일때
            if(type === 7){
                url = '/sub/inquiry/'+id;
            }

            navigate(url);
        }
    };


    //모바일메뉴 클릭시
    const moMenuClickHandler = (depth, data) => {
        const id = data.id;
        let url;

        //1차 메뉴일때
        if(depth === 1){
            if(!data.submenu){
                dispatch(confirmPop({
                    confirmPop:true,
                    confirmPopTit:'알림',
                    confirmPopTxt:'하위메뉴가 없습니다.',
                    confirmPopBtn:1,
                }));
                setConfirm(true);
            }else{
                if(moMenu1On === id){
                    setMoMenu1On(null);
                }else{
                    setMoMenu1On(id);
                }
                setMoMenu2On(null);
                setMoMenu3On(null);
            }
        }
        //2차 메뉴일때
        if(depth === 2){
            const type = data.c_content_type[0];
            
            //빈메뉴아닐때
            if(type !== 2){
                //카테고리종류 HTML 일때
                if(type === 1){
                    url = '/sub/html/'+id;
                }
                //카테고리종류 고객맞춤 일때
                if(type === 3){

                }
                //카테고리종류 일반게시판 or 갤러리게시판 일때
                if(type === 4 || type === 5){
                    url = '/sub/board/'+id;
                }
                //카테고리종류 FAQ 일때
                if(type === 6){
                    url = '/sub/faq/'+id;
                }
                //카테고리종류 문의게시판 일때
                if(type === 7){
                    url = '/sub/inquiry/'+id;
                }

                navigate(url);
            }else if(!data.submenu && type === 2){
                dispatch(confirmPop({
                    confirmPop:true,
                    confirmPopTit:'알림',
                    confirmPopTxt:'빈 메뉴 입니다.',
                    confirmPopBtn:1,
                }));
                setConfirm(true);
            }

            //메뉴 on
            if(moMenu2On === id){
                setMoMenu2On(null);
            }else{
                setMoMenu2On(id);
            }
            setMoMenu3On(null);
        }
        //3차 메뉴일때
        if(depth === 3){
            const type = data.c_content_type[0];

            //빈메뉴아닐때
            if(type !== 2){
                //카테고리종류 HTML 일때
                if(type === 1){
                    url = '/sub/html/'+id;
                }
                //카테고리종류 고객맞춤 일때
                if(type === 3){

                }
                //카테고리종류 일반게시판 or 갤러리게시판 일때
                if(type === 4 || type === 5){
                    url = '/sub/board/'+id;
                }
                //카테고리종류 FAQ 일때
                if(type === 6){
                    url = '/sub/faq/'+id;
                }
                //카테고리종류 문의게시판 일때
                if(type === 7){
                    url = '/sub/inquiry/'+id;
                }

                navigate(url);

                //메뉴 on
                if(moMenu3On === id){
                    setMoMenu3On(null);
                }else{
                    setMoMenu3On(id);
                }
            }else if(!data.submenu && type === 2){
                dispatch(confirmPop({
                    confirmPop:true,
                    confirmPopTit:'알림',
                    confirmPopTxt:'빈 메뉴 입니다.',
                    confirmPopBtn:1,
                }));
                setConfirm(true);
            }
        }
    };


    //로그아웃하기
    const logoutHandler = () => {

        //로그인했을때 저장된 정보들 지우기
        dispatch(loginStatus(false));
        dispatch(loginUser({}));
        dispatch(siteId(""));
        dispatch(maintName(""));

        //메인 페이지이동
        navigate('/');
    };

    

    return(<>
        <header id="header" className="header">
            <div className="header_inner">
                <h1 className="logo">
                    <Link to="/">
                        <img src={logo} alt="로고"/>
                    </Link>
                </h1>
                <div className="menu_wrap">
                    <nav>
                        <ul className="gnb">
                            {menuList.map((cont,i)=>{
                                return(
                                    <li key={i}
                                        onMouseEnter={()=>setMenu1On(cont.id)}
                                        onMouseLeave={()=>setMenu1On(null)}
                                        className={`${cont.submenu ? 'is_depth' : ''}${menuOn === cont.id ? ' on' : ''}`}
                                    >
                                        <button type="button"
                                            onClick={()=>{menuClickHandler(1, cont)}}
                                        >
                                            <span>{cont.c_name}</span>
                                        </button>
                                        {cont.submenu && 
                                            <ul className={`depth2${menu1On === cont.id ? ' on' : ''}`}>
                                                {cont.submenu.map((cont2,idx)=>{
                                                    return(
                                                        <li key={idx} 
                                                            className={`${cont2.submenu ? 'is_depth' : ''}${menu2On === cont2.id ? ' on' : ''}`} 
                                                        >
                                                            <button type="button"
                                                                onClick={()=>{menuClickHandler(2, cont2)}}
                                                            >
                                                                <span>{cont2.c_name}</span>
                                                            </button>
                                                            {cont2.submenu &&
                                                                <ul className="depth3">
                                                                    {cont2.submenu.map((cont3, index)=>{
                                                                        return(
                                                                            <li key={index}
                                                                                className={menu3On === cont3.id ? 'on' : ''} 
                                                                            >
                                                                                <button type="button"
                                                                                    onClick={()=>{menuClickHandler(3, cont3)}}
                                                                                >
                                                                                    <span>{cont3.c_name}</span>
                                                                                </button>
                                                                            </li>
                                                                        );
                                                                    })}
                                                                </ul>
                                                            }
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        }
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                    <ul className="header_util">
                        {login ? 
                            <>
                                <li>
                                    <Link to="/mypage/profile" className="btn_join">
                                        <span>마이페이지</span>
                                    </Link>
                                </li>
                                <li>
                                    <button type="button" className="btn_logout" onClick={logoutHandler}>
                                        <span>로그아웃</span>
                                    </button>
                                </li>
                            </>
                            :<>
                                <li>
                                    <Link to="/signup" className="btn_join">
                                        <span>회원가입</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/login" className="btn_login">
                                        <span>로그인</span>
                                    </Link>
                                </li>
                            </>
                        }
                    </ul>
                    <div className="lang_box">
                        <SelectBox 
                            className="select_type3"
                            list={langList}
                            selected={lang}
                            onChangeHandler={(e)=>{
                                const val = e.currentTarget.value;
                                dispatch(siteLang(val));
                            }}
                            selHidden={true}
                            objectSel={'lang'}
                        />
                    </div>
                    <button type="button" className={`btn_m${isMoMenuOpen ? ' on' : ''}`} onClick={toggleMoMenu}>
                        <span>모바일 메뉴</span>
                    </button>
                    <div className={`m_gnb_wrap${isMoMenuOpen ? ' on' : ''}`}>
                        <ul className="m_gnb">
                            {menuList.map((cont,i)=>{
                                return(
                                    <li key={i} 
                                        className={`${cont.submenu ? 'is_depth' : ''}${moMenu1On === cont.id ? ' on' : ''}`}
                                    >
                                        <button type="button"
                                            onClick={()=>{moMenuClickHandler(1, cont)}}
                                        >
                                            <span>{cont.c_name}</span>
                                        </button>
                                        {cont.submenu &&
                                            <ul className={`depth2${moMenu1On === cont.id ? ' on' : ''}`}>
                                                {cont.submenu.map((cont2,idx)=>{
                                                    return(
                                                        <li key={idx} 
                                                            className={`${cont2.submenu ? 'is_depth' : ''}${moMenu2On === cont2.id ? ' on' : ''}`} 
                                                        >
                                                            <button type="button"
                                                                onClick={()=>{moMenuClickHandler(2, cont2)}}
                                                            >
                                                                <span>{cont2.c_name}</span>
                                                            </button>
                                                            {cont2.submenu && moMenu2On === cont2.id &&
                                                                <ul className="depth3">
                                                                    {cont2.submenu.map((cont3, index)=>{
                                                                        return(
                                                                            <li key={index}
                                                                                className={moMenu3On === cont3.id ? 'on' : ''} 
                                                                            >
                                                                                <button type="button"
                                                                                    onClick={()=>{moMenuClickHandler(3, cont3)}}
                                                                                >
                                                                                    <span>{cont3.c_name}</span>
                                                                                </button>
                                                                            </li>
                                                                        );
                                                                    })}
                                                                </ul>
                                                            }
                                                        </li>
                                                    );
                                                })} 
                                            </ul>
                                        }
                                    </li>
                                );
                            })}
                        </ul>
                        <div className="lang_box">
                            <SelectBox 
                                className="select_type3"
                                list={langList}
                                selected={lang}
                                onChangeHandler={(e)=>{
                                    const val = e.currentTarget.value;
                                    dispatch(siteLang(val));
                                }}
                                selHidden={true}
                                objectSel={'lang'}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </header>

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default Header;