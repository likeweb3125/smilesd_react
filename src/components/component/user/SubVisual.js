import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { enum_api_uri } from "../../../config/enum";


const SubVisual = ({list, imgData}) => {
    const api_uri = enum_api_uri.api_uri;
    const [style, setStyle] = useState({});


    //배너이미지
    useEffect(()=>{
        let type = '';
        if(imgData.c_main_banner == '1'){
            type = 'cover';
        }else if(imgData.c_main_banner == '2'){
            type = 'contain';
        }

        const data = {
            backgroundImage: 'url('+api_uri+imgData.c_main_banner_file+')',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: type
        };

        setStyle(data);
    },[imgData]);


    return(<>
        <div className="sub_visual" 
            style={style}
        >
            <div className="section_inner">
                <div className="location_wrap">
                    <ul className="location">
                        <li>
                            <Link to="/" className="btn_home">홈</Link>
                        </li>
                        {list.map((cont,i)=>{
                            return(<li key={i}>{cont}</li>);
                        })}
                    </ul>
                </div>
                <h2>
                    <b>{list[0]}</b>
                    <strong>{list[list.length-1]}</strong>
                </h2>
            </div>
        </div>
    </>);
};

export default SubVisual;