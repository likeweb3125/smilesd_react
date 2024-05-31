import { useEffect, useState } from "react";
import { useSelector } from "react-redux";


const Html = () => {
    const common = useSelector((state)=>state.common);
    const [content, setContent] = useState(null);


    useEffect(()=>{
        const cont = common.currentMenuData.content;
        setContent(cont);
    },[common.currentMenuData]);



    return(<>
        <div className="page_user_board">
            <div dangerouslySetInnerHTML={{__html:content}}></div>
        </div>
    </>);
};

export default Html;