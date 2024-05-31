import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { enum_api_uri } from "../../config/enum";
import { confirmPop } from "../../store/popupSlice";
import { loginStatus, loginUser, siteId, maintName } from "../../store/userSlice";
import * as CF from "../../config/function";
import ConfirmPop from "../../components/popup/ConfirmPop";
import SubVisual from "../../components/component/user/SubVisual";
import MyStatBox from "../../components/component/user/MyStatBox";
import MyInfoCont from "../../components/component/user/MyProfile";
import MyInquiry from "../../components/component/user/MyInquiry";


const MyPage = (props) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const user_info = enum_api_uri.user_info;
    const [confirm, setConfirm] = useState(false);
    const [info, setInfo] = useState({});
    const [userInfo, setUserInfo] = useState({});
    const [menuOn, setMenuOn] = useState(null);


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);



    useEffect(()=>{
        const path = location.pathname;
        if(path == '/mypage/profile'){
            setMenuOn(1);
        }else if(path == '/mypage/inquiry'){
            setMenuOn(2);
        }else{
            setMenuOn(null);   
        }
    },[location]);



    //회원정보 가져오기
    const getUserInfo = () => {
        axios.get(user_info,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                const data = res.data.data;
                setInfo(data);
                setUserInfo(data.member);
            }
        })
        .catch((error) => {
            const err_msg = CF.errorMsgHandler(error);
            if(error.response.status === 401){//토큰에러시 로그인페이지로 이동
                navigate("/login");
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


    //맨처음 회원정보 가져오기
    useEffect(()=>{
        getUserInfo();
    },[]);


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
        <SubVisual 
            imgData={{}}
            list={['My Page']}
        />
        <div className="page_user_mypage">
            <div className="section_inner">
                <div className="mypage_info">
                    <div className="mypage_user">
                        <span><b>{userInfo.m_name}</b> 님, </span>
                        안녕하세요!
                    </div>
                    <MyStatBox 
                       boardCnt={info.boardCnt || 0} 
                       commentCnt={info.commentCnt || 0} 
                       qnaCnt={info.qnaCnt || 0} 
                    />
                </div>
                <div className="lnb_section">
                    <div className="lnb_wrap">
                        <h6>나의 메뉴</h6>
                        <ul className="lnb">
                            <li className={menuOn === 1 ? 'on' : ''}>
                                <Link to={`/mypage/profile`}>회원정보 수정</Link>
                            </li>
                            <li className={menuOn === 2 ? 'on' : ''}>
                                <Link to={`/mypage/inquiry`}>내가 작성한 문의 내역</Link>
                            </li>
                            <li>
                                <button type="button" onClick={logoutHandler}>로그아웃</button>
                            </li>
                        </ul>
                    </div>
                    <div className="lnb_con">
                        {props.children}
                    </div>
                </div>
            </div>
        </div>

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default MyPage;