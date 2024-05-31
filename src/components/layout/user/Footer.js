import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import f_logo from "../../../images/f_logo.png";

const Footer = ({policyList}) => {
    const common = useSelector((state)=>state.common);
    const [info, setInfo] = useState({});
    const [policyOn, setPolicyOn] = useState(null);
    const { policy_idx } = useParams();


    useEffect(()=>{
        setInfo(common.siteInfo);
    },[common.siteInfo]);


    //운영정책 페이지일때 li on
    useEffect(()=>{
        if(policy_idx){
            setPolicyOn(policy_idx);
        }else{
            setPolicyOn(null);
        }
    },[policy_idx]);


    


    return(<>
        <footer id="footer" className="footer">
            <div className="footer_inner">
                <div className="site_info">
                    <div className="f_logo">
                        <img src={f_logo} alt="로고"/>
                    </div>
                    <address>
                        <ul>
                            {info.c_site_name &&
                                <li>
                                    <span>{info.c_site_name}</span>
                                </li>
                            }
                            {info.c_ceo &&
                                <li>
                                    <span>대표이사</span>
                                    <span>{info.c_ceo}</span>
                                </li>
                            }
                            {info.c_num &&
                                <li>
                                    <span>사업자등록번호</span>
                                    <span>{info.c_num}</span>
                                </li>
                            }
                        </ul>
                        <ul>
                            {info.c_address &&
                                <li>
                                    <span>{info.c_address}</span>
                                </li>
                            }
                            {info.c_tel &&
                                <li>
                                    <span>Tel</span>
                                    <span>{info.c_tel}</span>
                                </li>
                            }
                        </ul>
                        <ul>
                            {info.c_email &&
                                <li>
                                    <span>Email</span>
                                    <span>{info.c_email}</span>
                                </li>
                            }
                        </ul>
                    </address>
                </div>
                <div className="f_util_wrap">
                    <ul className="f_util">
                        {policyList.map((cont,i)=>{
                            return(
                                <li key={i} className={policyOn == cont.idx ? 'on' : ''}>
                                    <Link to={`/policy/${cont.idx}`}>{cont.p_title}</Link>
                                </li>
                            );
                        })}
                    </ul>
                    <p className="copy">©2023 Lorem ipsum Co.,Ltd. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    </>);
};

export default Footer;