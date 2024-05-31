import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import f_admin_logo from "../../../images/f_admin_logo.png";

const Footer = (props) => {
    const common = useSelector((state)=>state.common);
    const [info, setInfo] = useState({});

    useEffect(()=>{
        setInfo(common.siteInfo);
    },[common.siteInfo]);

    return(
        <footer id="footer" className="footer">
            <div className="footer_inner">
                <address>
                    <ul>
                        {info && info.c_site_name && <li><h2>{info.c_site_name}</h2></li>}
                        {info && info.c_ceo && <li><span>대표이사</span>{info.c_ceo}</li>}
                        {info && info.c_num && <li><span>사업자등록번호</span>{info.c_num}</li>}
                    </ul>
                    <ul>
                        {info && info.c_address && <li>{info.c_address}</li>}
                        {info && info.c_tel && <li><span>Tel</span>{info.c_tel}</li>}
                        {info && info.c_email && <li><span>Email</span>{info.c_email}</li>}
                    </ul>
                </address>
                <h2 className="f_logo">
                    <img src={f_admin_logo} alt="로고" />
                </h2>
            </div>
        </footer>
    );
};

export default Footer;