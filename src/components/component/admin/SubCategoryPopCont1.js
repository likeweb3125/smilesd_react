import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { adminSubCategoryPopData } from "../../../store/popupSlice";
import Editor from "../Editor";


const SubCategoryPopCont1 = (props) => {
    const dispatch = useDispatch();
    const [info, setInfo] = useState({});
    const [content, setContent] = useState("");
    const [showRaw, setShowRaw] = useState(false);
    const [rawHtml, setRawHtml] = useState('');
    const [templateText, setTemplateText] = useState("");
    const [firstTime, setFirstTime] = useState(true);


    useEffect(()=>{
        if(firstTime){ //맨처음 랜더링
            setFirstTime(false);
        }
    },[]);


    useEffect(()=>{
        setInfo(props.info);
        setContent(props.info.content);
    },[props.info]);


    useEffect(()=>{
        //카테고리 값 변경시 adminSubCategoryPopData store 에 저장
        dispatch(adminSubCategoryPopData(info));
    },[info]);


    //에디터내용 값
    const onEditorChangeHandler = (e) => {
        setContent(e);
    };


    //에디터 HTML 버튼클릭시 textarea 보이기
    const handleClickShowRaw = () => {
        setShowRaw(!showRaw);
    };


    //에디터 HTML 버튼 토글
    useEffect(()=>{
        if(!firstTime){
            if (showRaw) {
                setRawHtml(content);
            }else {
                setContent(rawHtml);
            }
        }
    },[showRaw]);


    useEffect(()=>{
        let newData = {...props.info};
        if(!showRaw){ //에디터
            newData.content = content;
        }else{ //에디터 HTML
            newData.content = rawHtml;
        }
        setInfo(newData);
    },[content, rawHtml, templateText]);



    return(
        <div className="tab_con tab_con1">
            <div className="tab_inner">
                <div className="edit_box">
                    <Editor 
                        value={content}
                        onChangeHandler={onEditorChangeHandler}
                        onClickRaw={handleClickShowRaw}
                        btnHtmlOn={showRaw}
                    />
                    {showRaw ? 
                        <textarea
                            value={rawHtml}
                            onChange={(e) => {
                                setRawHtml(e.target.value);
                                
                            }}
                            className="raw_editor"
                        />
                        : null  
                    }
                </div>
            </div>
        </div>
    );
};

export default SubCategoryPopCont1;