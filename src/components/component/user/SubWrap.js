import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import * as CF from "../../../config/function";
import { enum_api_uri } from "../../../config/enum";
import { confirmPop } from "../../../store/popupSlice";
import { currentMenuData } from "../../../store/commonSlice";
import SubVisual from "./SubVisual";
import ConfirmPop from "../../popup/ConfirmPop";


const SubWrap = (props) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const common = useSelector((state)=>state.common);
    const popup = useSelector((state)=>state.popup);
    const { menu_idx } = useParams();
    const menu_sub_detail = enum_api_uri.menu_sub_detail;
    const [confirm, setConfirm] = useState(false);
    const [menuList, setMenuList] = useState([]);
    const [bannerData, setBannerData] = useState({});
    const [parents, setParents] = useState([]);


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);


    //헤더메뉴리스트
    useEffect(()=>{
        setMenuList(common.headerMenuList);
    },[common.headerMenuList]);


    //현재메뉴정보 가져오기
    const getMenuData = () => {
        axios.get(`${menu_sub_detail.replace(":id",menu_idx)}`)
        .then((res)=>{
            if(res.status === 200){
                let data = res.data.data;
                dispatch(currentMenuData(data));
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


    useEffect(()=>{
        //현재메뉴정보 가져오기
        if(menu_idx){
            getMenuData(); 
        }else{
            dispatch(currentMenuData({}));
        }
    },[menu_idx]);


    //헤더메뉴리스트, 페이지변경시
    useEffect(() => {
        //현재메뉴 메인배너값 찾기
        const result = findObjectByIdWithDepthCheck(menuList, menu_idx);
        if(result){
            const data = {
                c_main_banner: result.c_main_banner ? result.c_main_banner : '1',
                c_main_banner_file: result.c_main_banner_file ? result.c_main_banner_file : '',
            };
            setBannerData(data);
        }

        //현재메뉴 부모이름 찾기
        const foundItem = findItemByIdAndTopParents(menuList, menu_idx);
        if(foundItem){
            const list = foundItem.parents.map((item) => item.c_name);
            const newList = list.concat(foundItem.c_name);
            setParents(newList);
        }
    }, [menu_idx, menuList]);
    


    //최상의 부모값 찾기
    function findObjectByIdWithDepthCheck(list, targetId) {
        const findRecursive = (items) => {
            for (const item of items) {
                if (item.id == targetId) {
                    // 찾은 객체의 c_depth가 1이면 현재 객체 반환
                    if (item.c_depth === 1) {
                        return item;
                    } else if (item.c_depth > 1) {
                        // c_depth가 1보다 크면 부모의 객체를 찾기 위해 재귀 호출
                        const parent = findObjectByIdWithDepthCheck(list, item.c_depth_parent);
                        return parent || item; // 부모를 찾은 경우 부모를 반환, 못 찾은 경우 현재 객체 반환
                    }
                }
    
                // 현재 객체의 submenu에 대해 재귀 호출
                const found = findRecursive(item.submenu || []);
                if (found) {
                    return found;
                }
            }
    
            return null; // 찾지 못한 경우
        };
    
        return findRecursive(list);
    }


    //현재 메뉴에 부모값추가
    function findItemByIdAndTopParents(menu, targetId) {
        let resultItem = null;

        function findRecursively(currentItem, parents = []) {
            if (currentItem.id == targetId) {
                resultItem = { ...currentItem, parents };
                return;
            }

            if (currentItem.submenu) {
                for (const subItem of currentItem.submenu) {
                    findRecursively(subItem, [...parents, { ...currentItem, submenu: null }]);
                }
            }
        }

        for (const item of menu) {
            findRecursively(item);
        }

        return resultItem;
    }



    return(<>
        <SubVisual 
            imgData={bannerData}
            list={parents}
        />
        {props.children}

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default SubWrap;