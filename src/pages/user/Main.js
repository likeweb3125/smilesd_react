import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";

import { enum_api_uri } from "../../config/enum";
import * as CF from "../../config/function";
import util from "../../config/util";
import { confirmPop } from "../../store/popupSlice";
import ConfirmPop from "../../components/popup/ConfirmPop";
import UserPop from "../../components/popup/user/UserPop";

import MainVisual from "../../components/component/user/MainVisual";


const Main = () => {
    const dispatch = useDispatch();
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const api_uri = enum_api_uri.api_uri;
    const board_list = enum_api_uri.board_list;
    const auth_popup_list = enum_api_uri.auth_popup_list;
    const [confirm, setConfirm] = useState(false);
    const [newsList, setNewsList] = useState([]);
    const [popupList, setPopupList] = useState([]);
    const [popupType, setPopupType] = useState(null);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);


    //화면사이즈 변경될때 width 체크---------
    useEffect(() => {
        const handleWindowResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleWindowResize);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    },[]);


    // 화면사이즈에 따라 popupType 변경
    useEffect(() => {
        if(windowWidth >= 1000){
            setPopupType("P");
        }else{
            setPopupType("M");
        }
    }, [windowWidth]);


    useEffect(() => {

        //뉴스게시판 리스트 가져오기
        // getNewsList();

    }, []);


    //팝업리스트 가져오기
    useEffect(()=>{
        if(popupType !== null){
            // getPopupList();
        }
    },[popupType]);


    //팝업리스트 가져오기
    const getPopupList = () => {
        axios.get(`${auth_popup_list}?p_type=${popupType}`)
        .then((res)=>{
            if(res.status === 200){
                const list = res.data.data.popup_list;

                //현재날짜
                const currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0); //시간제거

                // 레이어팝업--------
                let popList = list.filter((item)=>item.p_layer_pop[0] == 1);
                popList = popList.filter(item => {
                    // p_e_date에 값이 있으면 현재 날짜와 비교
                    if (item.p_e_date) {
                        const endDate = new Date(item.p_e_date.replace(/\./g, '-'));
                        return endDate > currentDate;
                    }
                    // p_e_date에 값이 없거나 빈 문자열이면 포함
                    return true;
                });
                setPopupList(popList);
                
                // 새창팝업--------
                const hideList = util.getCookie("hidePopupList") || [];
                let openPopList = list.filter((item)=>item.p_layer_pop[0] == 2);
                //쿠키에 저장된 오늘은그만보기 팝업제외하고 노출
                openPopList = openPopList.filter(item => !hideList.includes(item.idx));

                openPopList = openPopList.filter(item => {
                    // p_e_date에 값이 있으면 현재 날짜와 비교
                    if (item.p_e_date) {
                        const endDate = new Date(item.p_e_date.replace(/\./g, '-'));
                        return endDate > currentDate;
                    }
                    // p_e_date에 값이 없거나 빈 문자열이면 포함
                    return true;
                });

                const openPopups = () => {
                    openPopList.forEach(item => {
                        const { idx, p_title, p_width_size, p_height_size, p_top_point, p_left_point } = item;
                        const popupUrl = `/openpopup/${idx}`;
                        const property = `width=${p_width_size},height=${p_height_size},top=${p_top_point},left=${p_left_point},scrollbars=no,toolbar=no`;

                        // 팝업 창 열기
                        const popupWindow = window.open(popupUrl, p_title, property);

                        // 팝업 창에 콘텐츠 추가
                        if (popupWindow) {
                            // 팝업 창에서 URL로 이동하는 JavaScript 코드 추가
                            popupWindow.document.write(`<script>window.location.href = "${popupUrl}";</script>`);
                        }
                    });
                }
                openPopups();
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


    //메인배너 가져오기
    const getMainBanner = () => {

    };


    //뉴스게시판 리스트 가져오기
    const getNewsList = () => {
        axios.get(`${board_list.replace(":category",49).replace(":limit",8)}`)
        .then((res)=>{
            if(res.status === 200){
                let list = res.data.data.board_list;

                // list의 길이가 1보다 크고 4보다 작을 때만 6개까지 복사 (슬라이드 루프때문)
                if (list.length > 1 && list.length < 4) {
                    while (list.length < 6) {
                        list = list.concat([...list]);
                    }
                }

                setNewsList(list);
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
        <div className="page_user_main">
            <div className="main_visual_wrap">
                <MainVisual 
                    // pcList={}
                    // moList={}
                />
            </div>
            <div className="section_list">
                <div className="section_inner">
                    <h2 className="tit">Our Services</h2>
                    <ul className="list_service">
                        <li>
                            <a href="#">
                                <div className="img">
                                    {/* <!-- 이미지 없을 경우 img 태그 날려도 됨 --> */}
                                    <img src="images/no_img.png" alt="image"/>
                                </div>
                                <div className="txt">
                                    <strong>서비스 01</strong>
                                    <span>우리는 웹을 좋아하고 웹에 대한 생각을 나눕니다.</span>
                                </div>
                            </a>
                        </li>
                        <li>
                            <a href="#">
                                <div className="img">
                                    {/* <!-- 이미지 없을 경우 img 태그 날려도 됨 --> */}
                                    <img src="images/no_img.png" alt="image"/>
                                </div>
                                <div className="txt">
                                    <strong>서비스 02</strong>
                                    <span>우리는 웹을 좋아하고 웹에 대한 생각을 나눕니다.</span>
                                </div>
                            </a>
                        </li>
                        <li>
                            <a href="#">
                                <div className="img">
                                    {/* <!-- 이미지 없을 경우 img 태그 날려도 됨 --> */}
                                </div>
                                <div className="txt">
                                    <strong>서비스 03</strong>
                                    <span>우리는 웹을 좋아하고 웹에 대한 생각을 나눕니다.</span>
                                </div>
                            </a>
                        </li>
                        <li>
                            <a href="#">
                                <div className="img">
                                    <img src="images/no_img.png" alt="image"/>
                                </div>
                                <div className="txt">
                                    <strong>서비스 04</strong>
                                    <span>우리는 웹을 좋아하고 웹에 대한 생각을 나눕니다.</span>
                                </div>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="section_notice">
                <div className="section_inner">
                    <h2 className="tit">Our Boards</h2>
                    <div className="main_notice">
                        <div className="main_board">
                            <div className="main_board_tab">
                                <ul>
                                    <li className="on">
                                        <a href="#">공지사항</a>
                                    </li>
                                    <li>
                                        <a href="#">자유 게시판</a>
                                    </li>
                                    <li>
                                        <a href="#">자주 묻는 질문</a>
                                    </li>
                                    <li>
                                        <a href="#">1:1 문의</a>
                                    </li>
                                </ul>
                            </div>
                            <ul className="list_main_board">
                                <li>
                                    <div className="txt">
                                        <strong>
                                            <a href="#">2023년 경영전략워크숍 개최</a>
                                        </strong>
                                        <span>지난 3월17일~18일 (2일간) 현대블룸비스타호텔 (경기도 양평)에서 2023년 사업목표를 공유하고 ...</span>
                                    </div>
                                    <em>2023.07<b>26</b></em>
                                </li>
                                <li>
                                    <div className="txt">
                                        <strong>
                                            <a href="#">창립 20주년, 행사 개최</a>
                                        </strong>
                                    </div>
                                    <em>2023.07<b>26</b></em>
                                </li>
                                <li>
                                    <div className="txt">
                                        <strong>
                                            <a href="#">2023년 시무식 개최</a>
                                        </strong>
                                    </div>
                                    <em>2023.07<b>26</b></em>
                                </li>
                                <li>
                                    <div className="txt">
                                        <strong>
                                            <a href="#">2023년 상반기 신입/경력자 채용 공고</a>
                                        </strong>
                                    </div>
                                    <em>2023.07<b>26</b></em>
                                </li>
                            </ul>
                            <a href="#" className="btn_more">더보기</a>
                        </div>
                        <div className="main_customer">
                            <div className="customer_txt">
                                <b>대표번호</b>
                                <strong>1688-3309</strong>
                                <span>평일 09:00 ~ 19:30</span>
                                <span>사고 접수 / 긴급 24 시간 이용 가능</span>
                            </div>
                            <ul className="customer_link">
                                <li>
                                    <a href="#">
                                        <span>오시는 길</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="#">
                                        <span>회사소개</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="#">
                                        <span>연혁</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 관리자단에서 설정한 팝업 */}
        <UserPop
            list={popupList}
            mo={popupType == "M" ? true : false}
        />

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default Main;