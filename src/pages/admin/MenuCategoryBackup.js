import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { enum_api_uri } from "../../config/enum";
import * as CF from "../../config/function";
import { confirmPop } from "../../store/popupSlice";

import MenuListBox from "../../components/component/admin/MenuListBox";
import InputBox from "../../components/component/InputBox";


const MenuCategory = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const menu_list = enum_api_uri.menu_list;
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const etc = useSelector((state)=>state.etc);
    const [confirm, setConfirm] = useState(false);
    const [menuList, setMenuList] = useState([]);
    const [unusedMenuList, setUnusedMenuList] = useState([]);
    const [depth1Num, setDepth1Num] = useState(0);
    const [depth2Num, setDepth2Num] = useState(0);
    const [info, setInfo] = useState({});
    const [error, setError] = useState({});


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);

    
    // 전체카테고리 가져오기
    const getMenuList = () => {
        axios.get(menu_list,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                // let data = res.data.data;
                let data = [
                    {
                        "id": 45,
                        "c_depth": 1,
                        "c_depth_parent": 0,
                        "c_num": 1,
                        "c_name": "클리어라식",
                        "c_main_banner": "",
                        "c_main_banner_file": null,
                        "c_menu_ui": "TXT",
                        "c_menu_on_img": null,
                        "c_menu_off_img": null,
                        "c_content_type": null
                    },
                    {
                        "id": 46,
                        "c_depth": 1,
                        "c_depth_parent": 0,
                        "c_num": 2,
                        "c_name": "지머",
                        "c_main_banner": "",
                        "c_main_banner_file": null,
                        "c_menu_ui": "TXT",
                        "c_menu_on_img": null,
                        "c_menu_off_img": null,
                        "c_content_type": null,
                    },
                    {
                        "id": 47,
                        "c_depth": 1,
                        "c_depth_parent": 0,
                        "c_num": 3,
                        "c_name": "매거진",
                        "c_main_banner": "",
                        "c_main_banner_file": null,
                        "c_menu_ui": "TXT",
                        "c_menu_on_img": null,
                        "c_menu_off_img": null,
                        "c_content_type": null,
                        "submenu": [
                            {
                                "id": 49,
                                "c_depth": 2,
                                "c_depth_parent": 47,
                                "c_num": 1,
                                "c_name": "뉴스",
                                "c_main_banner": "",
                                "c_main_banner_file": "",
                                "c_menu_ui": "TXT",
                                "c_menu_on_img": null,
                                "c_menu_off_img": null,
                                "c_content_type": [
                                    5,
                                    "GALLERY"
                                ],
                                "submenu": [
                                    {
                                        "id": 51,
                                        "c_depth": 3,
                                        "c_depth_parent": 49,
                                        "c_num": 1,
                                        "c_name": "활동사진",
                                        "c_main_banner": "",
                                        "c_main_banner_file": null,
                                        "c_menu_ui": "TXT",
                                        "c_menu_on_img": null,
                                        "c_menu_off_img": null,
                                        "c_content_type": [
                                            5,
                                            "GALLERY"
                                        ],
                                    }
                                ]
                            },
                            // {
                            //     "id": 50,
                            //     "c_depth": 2,
                            //     "c_depth_parent": 47,
                            //     "c_num": 2,
                            //     "c_name": "제휴문의",
                            //     "c_main_banner": "",
                            //     "c_main_banner_file": null,
                            //     "c_menu_ui": "TXT",
                            //     "c_menu_on_img": null,
                            //     "c_menu_off_img": null,
                            //     "c_content_type": [
                            //         7,
                            //         "QNA"
                            //     ]
                            // }
                        ]
                    },
                    // {
                    //     "id": 48,
                    //     "c_depth": 1,
                    //     "c_depth_parent": 0,
                    //     "c_num": 4,
                    //     "c_name": "클리어병원 찾기",
                    //     "c_main_banner": "",
                    //     "c_main_banner_file": null,
                    //     "c_menu_ui": "TXT",
                    //     "c_menu_on_img": null,
                    //     "c_menu_off_img": null,
                    //     "c_content_type": null
                    // },
                    {
                        "id": "0",
                        "c_depth": "1",
                        "c_depth_parent": "0",
                        "c_num": "0",
                        "c_name": "미사용 카테고리",
                        "submenu": [
                            {
                                "id": 48,
                                "c_depth": 1,
                                "c_depth_parent": 0,
                                "c_num": 4,
                                "c_name": "클리어병원 찾기",
                                "c_main_banner": "",
                                "c_main_banner_file": null,
                                "c_menu_ui": "TXT",
                                "c_menu_on_img": null,
                                "c_menu_off_img": null,
                                "c_content_type": null
                            },
                            {
                                "id": 50,
                                "c_depth": 2,
                                "c_depth_parent": 47,
                                "c_num": 2,
                                "c_name": "제휴문의",
                                "c_main_banner": "",
                                "c_main_banner_file": null,
                                "c_menu_ui": "TXT",
                                "c_menu_on_img": null,
                                "c_menu_off_img": null,
                                "c_content_type": [
                                    7,
                                    "QNA"
                                ]
                            }
                        ]
                    }
                ];
                const list = data.filter(item => item.id != 0);
                const unList = data.find(item => item.id == 0).submenu;
                setMenuList(list);
                setUnusedMenuList(unList);
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
        getMenuList();
    },[]);


    //1차, 하위카테고리 개수
    useEffect(()=>{
        const depth1_num = menuList.filter(item => item.c_depth === 1).length;
        const depth2_list = menuList.filter(item => item.c_depth === 1) // 1단계에서 c_depth가 1인 항목을 필터링
        .flatMap(item => item.submenu || []) // 필터링된 항목의 submenu를 flatMap으로 추출
        .filter(subItem => subItem.c_depth === 2); 
        const depth3_num = depth2_list.flatMap(item => item.submenu || [])
        .filter(subItem => subItem.c_depth === 3).length; 
        const depth2_num = depth2_list.length + depth3_num;
        
        setDepth1Num(depth1_num);
        setDepth2Num(depth2_num);
    },[menuList]);


    //인풋값 변경시
    const onInputChangeHandler = (e) => {
        const id = e.currentTarget.id;
        const val = e.currentTarget.value;

        let newInfo = {...info};
            newInfo[id] = val;
            
        setInfo(newInfo);

        if(id == "c_site_name" && val.length > 0){
            let newError = {...error};
                newError.c_site_name = false;
            setError(newError);
        }
        if(id == "c_b_title" && val.length > 0){
            let newError = {...error};
                newError.c_b_title = false;
            setError(newError);
        }
    };


    return(<>
        <div className="page_admin_menu">
            <div className="content_box">
                <div className="tit">
                    <h3><b>전체 카테고리</b></h3>
                    <ul className="list_category_txt">
                        <li>
                            <span>1차 카테고리</span>
                            <strong>총 {CF.MakeIntComma(depth1Num)}개</strong>
                        </li>
                        <li>
                            <span>2차 카테고리</span>
                            <strong>총 {CF.MakeIntComma(depth2Num)}개</strong>
                        </li>
                    </ul>
                </div>
                <div className="menu_box">
                    <div className="menu_list_wrap">
                        <div className="btn_util">
                            <div className="add_wrap">
                                <button type="button" className="btn_type5">1차 카테고리 추가</button>
                                <button type="button" className="btn_type6">하위 카테고리 등록</button>
                            </div>
                            <button type="button" className="btn_type7">삭제</button>
                        </div>
                        <div className="menu_list_box">
                            <MenuListBox
                                list={menuList}
                                unusedList={unusedMenuList}
                            />
                            {/* <p>* 드래그앤드랍으로 카테고리 순서를 변경할 수 있습니다.<br/>* 드래그앤드랍으로 하위 카테고리는 상위 카테고리 추가 및 미사용 카테고리로 등록할 수 있습니다.</p> */}
                        </div>
                        <div className="btn_util">
                            <div className="add_wrap">
                                <button type="button" className="btn_type5">1차 카테고리 추가</button>
                                <button type="button" className="btn_type6">하위 카테고리 등록</button>
                            </div>
                            <button type="button" className="btn_type7">삭제</button>
                        </div>
                    </div>
                    {/* 1차 카테고리 등록 섹션 */}
                    <div className="reg_category_wrap">
                        <h4>1차 카테고리</h4>
                        <div className="page_form">
                            <form action="">
                                <fieldset>
                                    <legend>1차 카테고리 등록 폼</legend>
                                    <div className="form_inner">
                                        <div className="form_box form_border_box">
                                            <div className="form_input">
                                                <h6>카테고리명 <i>*</i></h6>
                                                <div className="input_wrap">
                                                    <InputBox
                                                        className="input_box" 
                                                        type={`text`}
                                                        placeholder={`카테고리명을 입력해주세요.`}
                                                        countShow={true}
                                                        countMax={16}
                                                        count={info.c_site_name ? info.c_site_name.length : 0}
                                                        value={info.c_site_name || ""}
                                                        onChangeHandler={onInputChangeHandler}
                                                        id={`c_site_name`}
                                                        inputClassName={error.c_site_name ? "wrong_input" : ""}
                                                    />
                                                    {error.c_site_name && <em className="txt_err">카테고리명을 입력해주세요.</em>}
                                                </div>
                                            </div>
                                            <div className="form_input">
                                                <h6>서브 메인 배너</h6>
                                                <div className="input_wrap">
                                                    <div className="chk_rdo_wrap">
                                                        <div className="rdo_box1">
                                                            <input type="radio" id="rdo11" className="blind" checked/>
                                                            <label htmlFor="rdo11">원본 사이즈 고정</label>
                                                        </div>
                                                        <div className="rdo_box1">
                                                            <input type="radio" id="rdo12" className="blind"/>
                                                            <label htmlFor="rdo12">커버</label>
                                                        </div>
                                                    </div>
                                                    <div className="file_box1">
                                                        <div className="input_file">
                                                            <input type="file" id="file11" className="blind"/>
                                                            <label htmlFor="file11">
                                                                <b>파일을 마우스로 끌어 오세요.</b>
                                                                <strong>파일선택</strong>
                                                            </label>
                                                        </div>
                                                        <ul className="file_txt">
                                                            <li>
                                                                <span>이미지.JPG</span>
                                                                <button type="button" className="btn_file_remove">파일삭제</button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                    <em className="txt_input">* 권장 : 1800 * 320 px</em>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form_box">
                                            <div className="form_input">
                                                <h6>메뉴 UI <i>*</i></h6>
                                                <div className="input_wrap">
                                                    <div className="chk_rdo_wrap">
                                                        <div className="rdo_box1">
                                                            <input type="radio" id="rdo21" className="blind"/>
                                                            <label htmlFor="rdo21">텍스트</label>
                                                        </div>
                                                        <div className="rdo_box1">
                                                            <input type="radio" id="rdo22" className="blind" checked/>
                                                            <label htmlFor="rdo22">이미지</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form_input">
                                                <h6>메뉴 이미지 ON</h6>
                                                <div className="input_wrap">
                                                    <div className="file_box1">
                                                        <div className="input_file">
                                                            <input type="file" id="file2" className="blind"/>
                                                            <label htmlFor="file2">
                                                                <b>파일을 마우스로 끌어 오세요.</b>
                                                                <strong>파일선택</strong>
                                                            </label>
                                                        </div>
                                                        <ul className="file_txt">
                                                            <li>
                                                                <span>이미지.JPG</span>
                                                                <button type="button" className="btn_file_remove">파일삭제</button>
                                                            </li>
                                                        </ul>
                                                        <div className="view_file_img">
                                                            <div className="file_img">
                                                                <img src="images/test1.png" alt="image"/>
                                                                <button type="button" className="btn_img_remove">이미지 삭제</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="form_input">
                                                <h6>메뉴 이미지 OFF</h6>
                                                <div className="input_wrap">
                                                    <div className="file_box1">
                                                        <div className="input_file">
                                                            <input type="file" id="file2" className="blind"/>
                                                            <label htmlFor="file2">
                                                                <b>파일을 마우스로 끌어 오세요.</b>
                                                                <strong>파일선택</strong>
                                                            </label>
                                                        </div>
                                                        <ul className="file_txt">
                                                            <li>
                                                                <span>이미지.JPG</span>
                                                                <button type="button" className="btn_file_remove">파일삭제</button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form_btn_wrap">
                                        <button type="button" className="btn_type1">취소</button>
                                        <button type="button" className="btn_type2">등록</button>
                                    </div>
                                </fieldset>
                            </form>
                        </div>
                    </div>
                    {/* //1차 카테고리 등록 섹션 */}
                </div>
            </div>
        </div>
    </>);
};

export default MenuCategory;
