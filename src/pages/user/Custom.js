import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";


const Custom = () => {
    const navigate = useNavigate();
    const common = useSelector((state)=>state.common);


    useEffect(()=>{
        console.log(common.currentMenuData);
        if(common.currentMenuData.file_path){
            navigate(common.currentMenuData.file_path);
        }
    },[common.currentMenuData]);


};

export default Custom;