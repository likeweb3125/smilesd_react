import { Link } from "react-router-dom";
import ic_join from "../../../images/ic_join.svg";


const SignUpCompletedBox = ({name}) => {
    return(<>
        <div className="user_con_box">
            <div className="user_con_inner">
                <h3>
                    <b>회원가입 완료</b>
                    <span>회원가입이 완료되었습니다. <br/>환영합니다!</span>
                </h3>
                <div className="con_txt">
                    <div className="ic">
                        <img src={ic_join} alt="회원가입완료 아이콘"/>
                    </div>
                    <span><b>{name} 고객님,</b> 가입이 완료되었습니다. <br/>지금 바로 <i>Lorem ipsum</i> 서비스를 이용해 보세요!</span>
                </div>
            </div>
            <div className="btn_wrap">
                <Link to="/" className="btn_type26">홈으로 가기</Link>
                <Link to="/login" className="btn_type25">로그인</Link>
            </div>
        </div>
    </>);
};

export default SignUpCompletedBox;