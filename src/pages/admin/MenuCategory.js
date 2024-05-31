import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { enum_api_uri } from "../../config/enum";
import * as CF from "../../config/function";
import { confirmPop, adminCategoryPop, adminSubCategoryPop, adminSubCategoryPopModify, adminCategoryPopModify, adminSubCategoryPopParentData, adminCategoryPopDelt } from "../../store/popupSlice";
import { menuCheckList, unMenuCheckList, cateMenuList, activeMenuId } from "../../store/etcSlice";
import arrow_open from "../../images/arrow_open.svg";
import TableWrap from "../../components/component/admin/TableWrap";
import ConfirmPop from "../../components/popup/ConfirmPop";


const MenuCategory = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const menu_list = enum_api_uri.menu_list;
    const menu_mapping = enum_api_uri.menu_mapping;
    const menu_modify = enum_api_uri.menu_modify;
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const etc = useSelector((state)=>state.etc);
    const common = useSelector((state)=>state.common);
    const [confirm, setConfirm] = useState(false);
    const [deltConfirm, setDeltConfirm] = useState(false);
    const [menuList, setMenuList] = useState([]);
    const [unusedMenuList, setUnusedMenuList] = useState([]);
    const [currentMenu, setCurrentMenu] = useState({});
    const [currentMenuId, setCurrentMenuId] = useState(null);
    const [menuOn, setMenuOn] = useState(null);
    const [unMenuOn, setUnMenuOn] = useState(false);
    const [checkList, setCheckList] = useState([]);
    const [unCheckList, setUnCheckList] = useState([]);
    const [checkedNum, setCheckedNum] = useState(0);
    const [unCheckedNum, setUnCheckedNum] = useState(0);
    const [parents, setParents] = useState([]);
    const [langTabList, setLangTabList] = useState([]);
    const [langTabOn, setLangTabOn] = useState(0);
    const [tabLang, setTabLang] = useState('');


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
            setDeltConfirm(false);
        }
    },[popup.confirmPop]);


    //사이트 언어리스트 가져오기
    useEffect(()=>{
        const list = common.siteLangList;
        setLangTabList(list);
    },[common.siteLangList]);


    
    // 전체카테고리 가져오기
    const getMenuList = () => {
        let lang = 'KR';
        if(langTabList.length > 1){
            lang = langTabList[langTabOn].site_lang;
        }
        
        axios.get(`${menu_list}?c_lang=${lang}`,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                const data = res.data.data;
                const list = data.filter(item => item.id != 0); //미사용카테고리 제외
                const menuListWithCount = list.map((cont, i) => {
                    const totalSubMenuCount = getMenuCount(cont);
                    return {
                        ...cont,
                        totalSubMenuCount,
                    };
                });
                setMenuList(menuListWithCount);

                const unList = data.find(item => item.id == 0); //미사용카테고리
                setUnusedMenuList(unList.submenu);
            }
        })
        .catch((error) => {
            const err_msg = CF.errorMsgHandler(error);
            if(error.response.status === 401){//토큰에러시 관리자단 로그인페이지로 이동
                navigate("/console/login");
            }else{
                dispatch(confirmPop({
                    confirmPop:true,
                    confirmPopTit:'알림',
                    confirmPopTxt: err_msg,
                    confirmPopBtn:1,
                }));
                setConfirm(true);
            }
        });
    };
    

    //언어 탭변경시 전체카테고리 가져오기
    useEffect(()=>{
        dispatch(activeMenuId(null));
        getMenuList();
    },[langTabOn]);


    //언어탭변경시 tabLang 값 변경
    useEffect(()=>{
        let lang = 'KR';
        if(langTabList.length > 0){
            lang = langTabList[langTabOn].site_lang;
        }
        setTabLang(lang);
    },[langTabOn, langTabList]);


    //카테고리수정,삭제시 전체카테고리 가져오기
    useEffect(()=>{
        //1차카테고리 수정시
        if(popup.adminCategoryPopModify){
            dispatch(adminCategoryPopModify(false));

            getMenuList();
        }
        //1차카테고리 삭제시
        if(popup.adminCategoryPopDelt){
            dispatch(adminCategoryPopDelt(false));

            getMenuList();
        }
        //하위카테고리 수정시
        if(popup.adminSubCategoryPopModify){
            dispatch(adminSubCategoryPopModify(false));

            getMenuList();
        }
    },[popup.adminCategoryPopModify, popup.adminCategoryPopDelt, popup.adminSubCategoryPopModify]);


    //전체카테고리 리스트 변경시
    useEffect(()=>{
        if(menuList.length > 0){
            //etc.activeMenuId 값이 있으면 menuList 값이 변경된 후 전에 선택됐던메뉴값으로 currentMenu 변경
            if(etc.activeMenuId){
                const foundItem = findItemByIdAndTopParents(menuList, etc.activeMenuId);
                setCurrentMenu({...foundItem});
            }else{
                let id = menuList[0].id;
                onMenuClickHandler(id);
            }
        }
        
        dispatch(cateMenuList(menuList));
    },[menuList]);


    //하위카테고리 총 개수 구하기
    const getMenuCount = (menu) => {
        let count = 0;
      
        if (menu.submenu && menu.submenu.length > 0) {
            count += menu.submenu.length; // 현재 레벨의 submenu 개수
        
            // 재귀적으로 하위 메뉴의 개수를 더함
            menu.submenu.forEach((subMenu) => {
                count += getMenuCount(subMenu);
            });
        }
      
        return count;
    };


    //맨처음 메뉴리스트 id값만 배열로 (전체 체크박스리스트 만들기)
    useEffect(()=>{
        let list = [];
        if(currentMenu.submenu){
            list = currentMenu.submenu.map((item) => item.id).filter(Boolean);
        }
        setCheckList([...list]);

        
        //선택된 1차 카테고리값 (currentMenu) 변경시 하위카테고리,미설정카테고리 체크리스트값 빈배열로 변경 
        dispatch(menuCheckList([]));
        dispatch(unMenuCheckList([]));


        //현재선택된 부모메뉴 리스트
        if(currentMenu.parents){
            setParents(currentMenu.parents);
        }else{
            setParents([]);
        }

        //현재선택된 메뉴 id store 에 저장
        if(currentMenu.id){
            dispatch(activeMenuId(currentMenu.id));
        }
    },[currentMenu]);


    //맨처음 미사용메뉴리스트 id값만 배열로 (전체 체크박스리스트 만들기)
    useEffect(()=>{
        let list = [];
        if(unusedMenuList.length > 0){
            list = unusedMenuList.map((item) => item.id).filter(Boolean);
        }
        setUnCheckList([...list]);
    },[unusedMenuList]);


    //메뉴 전체선택 체크박스 체크시
    const allCheckHandler = (checked) => {
        if(checked){
            dispatch(menuCheckList([...checkList]));
        }else{
            dispatch(menuCheckList([]));
        }
    };

    //미사용메뉴 전체선택 체크박스 체크시
    const allUnMenuCheckHandler = (checked) => {
        if(checked){
            dispatch(unMenuCheckList([...unCheckList]));
        }else{
            dispatch(unMenuCheckList([]));
        }
    };


    //메뉴 체크박스 변경시 체크된 수 변경
    useEffect(()=>{
        const num = etc.menuCheckList.length;
        setCheckedNum(num);
    },[etc.menuCheckList]);

    //미사용메뉴 체크박스 변경시 체크된 수 변경
    useEffect(()=>{
        const num = etc.unMenuCheckList.length;
        setUnCheckedNum(num);
    },[etc.unMenuCheckList]);


    //1차 카테고리 클릭시
    const onMenuClickHandler = (id) => {
        function findItemById(menu, targetId) {
            for (const item of menu) {
                if (item.id === targetId) {
                    return item;
                }
            
                if (item.submenu) {
                    const subItem = findItemById(item.submenu, targetId);
                    if (subItem) {
                        return subItem;
                    }
                }
            }
          
            return null;
        }
        const data = findItemById(menuList, id);

        setCurrentMenu({...data});
    };


    //선택된 메뉴값 찾기
    function findItemByIdAndTopParents(menu, targetId) {
        let resultItem = null;

        function findRecursively(currentItem, parents = []) {
            if (currentItem.id === targetId) {
                const totalSubMenuCount = getMenuCount(currentItem);
                resultItem = { ...currentItem, parents, totalSubMenuCount };
                return;
            }

            if (currentItem.submenu) {
                for (const subItem of currentItem.submenu) {
                    const totalSubMenuCount = getMenuCount(currentItem);
                    findRecursively(subItem, [...parents, { ...currentItem, submenu: null, totalSubMenuCount }]);
                }
            }
        }

        for (const item of menu) {
            findRecursively(item);
        }

        return resultItem;
    }


    //현재선택된 메뉴id currentMenuId 바뀔시 currentMenu 값 변경
    useEffect(()=>{
        const id = currentMenuId;
        if(id){
            const foundItem = findItemByIdAndTopParents(menuList, id);
            setCurrentMenu({...foundItem});
        }else{
            setCurrentMenu({});
        }
    },[currentMenuId]);


    //하위카테고리 부모카테고리 리스트값 변경시 최고부모 1차카테고리값 찾기
    useEffect(()=>{
        console.log(parents);
        if(parents.length > 0){
            const idList = parents.map((item)=>item.id);
            setMenuOn(idList[0]);
        }else{
            setMenuOn(currentMenu.id);
        }
    },[parents]);


    //하위카테고리 리스트에서 메뉴명 클릭시
    const menuNameClickHandler = (id) => {
        setCurrentMenuId(id);
    };


    //카테고리 매핑버튼 클릭시
    const mappingBtnClickHandler = (use, parentId) => {
        if(use == 'N'){ //매핑해제하기
            if(etc.menuCheckList.length > 0){
                const list = currentMenu.submenu;
                const filteredItems = list.filter(item => etc.menuCheckList.includes(item.id));
                const itemsWithSubMenu = filteredItems.filter(item => item.submenu && item.submenu.length > 0);

                //선택한 카테고리중 하위카테고리가 있는지 체크
                if(itemsWithSubMenu.length > 0){
                    dispatch(confirmPop({
                        confirmPop:true,
                        confirmPopTit:'알림',
                        confirmPopTxt:'선택한 카테고리의 하위카테고리들을 먼저 매핑 해제해주세요.',
                        confirmPopBtn:1,
                    }));
                    setConfirm(true);
                }else{
                    mappingHandler(use, parentId);
                }
            }else{
                dispatch(confirmPop({
                    confirmPop:true,
                    confirmPopTit:'알림',
                    confirmPopTxt:'카테고리를 선택해주세요.',
                    confirmPopBtn:1,
                }));
                setConfirm(true);
            }
        }
        if(use == 'Y'){ //매핑하기
            if(etc.unMenuCheckList.length > 0){
                mappingHandler(use, parentId);
            }else{
                dispatch(confirmPop({
                    confirmPop:true,
                    confirmPopTit:'알림',
                    confirmPopTxt:'카테고리를 선택해주세요.',
                    confirmPopBtn:1,
                }));
                setConfirm(true);
            }
        }
    };


    //카테고리 매핑하기
    const mappingHandler = (use, parentId, id) => {
        let idList = [];
        let c_depth_parent = parentId;

        if(id){
            idList = id;
            c_depth_parent = currentMenu.id;
        }else{
            if(use == 'N'){
                idList = etc.menuCheckList;
            }
            if(use == 'Y'){
                idList = etc.unMenuCheckList;
            }
        }

        const c_depth = currentMenu.c_depth+1;

        const body = {
            id: idList,
            c_depth: c_depth,
            c_depth_parent: c_depth_parent,
            c_use_yn: use,
        };

        axios.put(menu_mapping, body,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                getMenuList();
            }
        })
        .catch((error) => {
            const err_msg = CF.errorMsgHandler(error);
            if(error.response.status === 401){//토큰에러시 관리자단 로그인페이지로 이동
                navigate("/console/login");
            }else{
                dispatch(confirmPop({
                    confirmPop:true,
                    confirmPopTit:'알림',
                    confirmPopTxt: err_msg,
                    confirmPopBtn:1,
                }));
                setConfirm(true);
            }
        });
    };


    //삭제버튼 클릭시
    const deltBtnClickHandler = () => {
        if(unCheckedNum > 0){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'해당 카테고리를 삭제하시겠습니까?',
                confirmPopBtn:2,
            }));
            setDeltConfirm(true);
        }else if(unCheckedNum === 0){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'카테고리를 선택해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }
    };


    //카테고리 삭제하기
    const deltHandler = () => {
        const body = {
            id: etc.unMenuCheckList,
        };

        axios.delete(menu_modify,
            {
                data: body,
                headers: {Authorization: `Bearer ${user.loginUser.accessToken}`}
            }
        )
        .then((res)=>{
            if(res.status === 200){
                getMenuList();
            }
        })
        .catch((error) => {
            const err_msg = CF.errorMsgHandler(error);
            if(error.response.status === 401){//토큰에러시 관리자단 로그인페이지로 이동
                navigate("/console/login");
            }else{
                dispatch(confirmPop({
                    confirmPop:true,
                    confirmPopTit:'알림',
                    confirmPopTxt: err_msg,
                    confirmPopBtn:1,
                }));
                setConfirm(true);
            }
        });
    };


    return(<>
        <div className="page_admin_category">
            <ul className="tab_type1">
                {langTabList.length > 1 && langTabList.map((cont,i)=>
                    <li key={i} className={langTabOn === i ? 'on' : ''}>
                        <button type="button" onClick={()=>setLangTabOn(i)}>{cont.site_lang_hangul}</button>
                    </li>
                )}
            </ul>
            <div className="content_box">
                <div className="flex_between">
                    <div className="tit">
                        <h3><b>1차 카테고리</b><strong>총 {CF.MakeIntComma(menuList.length)}개</strong></h3>
                    </div>
                    <div className="flex">
                        {menuOn && //현재 선택된카테고리가 있을때만 노출
                            <button type="button" className="btn_type12"
                                onClick={()=>{
                                    dispatch(adminCategoryPop({adminCategoryPop:true, adminCategoryPopIdx:menuOn, adminCategoryPopLang:tabLang}));
                                }}
                            >카테고리 관리</button>
                        }
                        <button type="button" className="btn_type5 lm8"
                            onClick={()=>{
                                dispatch(adminCategoryPop({adminCategoryPop:true, adminCategoryPopIdx:null, adminCategoryPopLang:tabLang}));
                            }}
                        >1차 카테고리 추가</button>
                    </div>
                </div>
                <div className="menu_box">
                    <ul className="flex_wrap">
                        {menuList.map((cont,i)=>{
                            return(
                                <li key={i} 
                                    onClick={()=>{onMenuClickHandler(cont.id)}}
                                    className={menuOn === cont.id ? 'on' : ''}
                                >
                                    <strong>{cont.c_name}</strong><span>({CF.MakeIntComma(cont.totalSubMenuCount)})</span>
                                </li> 
                            );
                        })}
                    </ul>
                </div>
            </div>
            {Object.keys(currentMenu).length > 0 &&
                <div className="content_box">
                    <div className="flex_between">
                        <ul className="location_ul flex_wrap"> 
                            <li>홈</li>
                            {parents.map((cont,i)=>{
                                return(
                                    <li key={i}>
                                        <button type="button"
                                            onClick={()=>{
                                                setCurrentMenuId(cont.id);
                                            }}
                                        >
                                            <strong>{cont.c_name}</strong><span>({CF.MakeIntComma(cont.totalSubMenuCount)})</span>
                                        </button>
                                    </li>
                                );
                            })}
                            <li className="on">
                                <button type="button">
                                    <strong>{currentMenu.c_name}</strong><span>({CF.MakeIntComma(currentMenu.totalSubMenuCount)})</span>
                                </button>
                            </li>
                        </ul>
                        <div className="flex">
                            {parents.length > 0 && //현재선택된 카테고리가 하위카테고리일때만 노출
                                <button type="button" className="btn_type12"
                                    onClick={()=>{
                                        dispatch(adminSubCategoryPop({adminSubCategoryPop:true, adminSubCategoryPopIdx:currentMenu.id, adminSubCategoryPopLang:tabLang}));
                                    }}
                                >카테고리 관리</button>
                            }
                            {currentMenu.c_depth !== 3 && //현재선택된 카테고리가 3차 카테고리일때는 미노출 (하위카테고리 최대 3차까지만 생성가능)
                                <button type="button" className="btn_type6 lm8"
                                    onClick={()=>{
                                        dispatch(adminSubCategoryPopParentData(currentMenu)); //현재선택된 카테고리정보 store 에 저장
                                        dispatch(adminSubCategoryPop({adminSubCategoryPop:true, adminSubCategoryPopIdx:null, adminSubCategoryPopLang:tabLang}));
                                    }}
                                >하위 카테고리 등록</button>
                            }
                        </div>
                    </div>
                    <div className="board_section">
                        <div className="board_table_util">
                            <div className="chk_area">
                                <div className="chk_box2">
                                    <input type="checkbox" id="chkAll" className="blind"
                                        onChange={(e)=>{allCheckHandler(e.currentTarget.checked)}} 
                                        checked={checkList.length > 0 && checkList.length === etc.menuCheckList.length && checkList.every(item => etc.menuCheckList.includes(item))}
                                    />
                                    <label htmlFor="chkAll">전체선택</label>
                                </div>
                            </div>
                            <div className="util_wrap">
                                <span>선택한 카테고리</span>
                                <span>총 <b>{CF.MakeIntComma(checkedNum)}</b>개</span>
                                <button type="button" className="btn_type10"
                                    onClick={()=>{
                                        mappingBtnClickHandler('N', currentMenu.id);
                                    }}
                                >해제</button>
                            </div>
                        </div>
                        <TableWrap 
                            className="tbl_wrap1 tbl_wrap1_1"
                            colgroup={["6%","9%","40%","10%","15%","10%","10%"]}
                            thList={["","순서","메뉴명","하위","컨텐츠유형","매핑 해제","순서"]}
                            tdList={currentMenu.submenu || []}
                            type={"menu"}
                            onMappingHandler={mappingHandler}
                            onMenuClickHandler={menuNameClickHandler}
                        />
                    </div>
                </div>
            }
            <div className="content_box">
                <div className="flex_between">
                    <div className="tit">
                        <h3><b>미설정 목록</b><strong>총 {CF.MakeIntComma(unusedMenuList.length)}개</strong></h3>
                    </div>
                    <button type="button" 
                        className={`btn_open${unMenuOn ? ' on' : ''}`}
                        onClick={()=>setUnMenuOn(!unMenuOn)}
                    ><img src={arrow_open} alt="화살표 아이콘" /><span>미설정 목록 열기</span></button>
                </div>
                {unMenuOn &&
                    <div className="board_section">
                        <div className="board_table_util">
                            <div className="chk_area">
                                <div className="chk_box2">
                                    <input type="checkbox" id="unChkAll" className="blind"
                                        onChange={(e)=>{allUnMenuCheckHandler(e.currentTarget.checked)}} 
                                        checked={unCheckList.length > 0 && unCheckList.length === etc.unMenuCheckList.length && unCheckList.every(item => etc.unMenuCheckList.includes(item))}
                                    />
                                    <label htmlFor="unChkAll">전체선택</label>
                                </div>
                            </div>
                            <div className="util_wrap">
                                <span>선택한 카테고리</span>
                                <span>총 <b>{CF.MakeIntComma(unCheckedNum)}</b>개</span>
                                <button type="button" className="btn_type8"
                                    onClick={()=>{
                                        mappingBtnClickHandler('Y', currentMenu.id);
                                    }}
                                >매핑</button>
                            </div>
                            <div className="util_right">
                                <button type="button" className="btn_type9" onClick={deltBtnClickHandler}>삭제</button>
                            </div>
                        </div>
                        <TableWrap 
                            className="tbl_wrap1 tbl_wrap1_1"
                            colgroup={["6%","9%","40%","10%","15%","10%","10%"]}
                            thList={["","순서","메뉴명","하위","컨텐츠유형","매핑 해제","순서"]}
                            tdList={unusedMenuList}
                            type={"menu"}
                            unMenu={true}
                            onMappingHandler={mappingHandler}
                        />
                    </div>
                }
            </div>
        </div>

        {/* 카테고리 삭제 confirm팝업 */}
        {deltConfirm && <ConfirmPop onClickHandler={deltHandler} />}

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default MenuCategory;
