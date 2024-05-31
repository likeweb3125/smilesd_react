import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import * as CF from "../../../config/function";
import { enum_api_uri } from "../../../config/enum";
import { confirmPop, adminSubCategoryPopData, adminBoardGroupPop } from "../../../store/popupSlice";
import InputBox from "../InputBox";
import InputBox2 from "./InputBox2";
import TxtSelectBox from "./TxtSelectBox";
import ConfirmPop from "../../popup/ConfirmPop";
import Editor from "../Editor";


const SubCategoryPopCont6 = (props) => {
    const dispatch = useDispatch();
    const level_list = enum_api_uri.level_list;
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const [temStep, setTemStep] = useState(1);
    const [confirm, setConfirm] = useState(false);
    const [info, setInfo] = useState({});
    const [limit, setLimit] = useState(null);
    const [levelList, setLevelList] = useState([]);
    const [showRaw, setShowRaw] = useState(false);
    const [rawHtml, setRawHtml] = useState('');
    const [templateEditor, setTemplateEditor] = useState("");
    const [templateText, setTemplateText] = useState("");
    const [firstTime, setFirstTime] = useState(true);


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);


    useEffect(()=>{
        if(firstTime){ //맨처음 랜더링
            setFirstTime(false);
        }
    },[]);


    useEffect(()=>{
        setInfo(props.info);
        setLimit(props.info.b_list_cnt);
        setTemplateEditor(props.info.b_template_text);
    },[props.info]);


    useEffect(()=>{
        //카테고리 값 변경시 adminSubCategoryPopData store 에 저장
        dispatch(adminSubCategoryPopData(info));
    },[info]);


    //인풋값 변경시
    const onInputChangeHandler = (e) => {
        console.log(e)
        const id = e.currentTarget.id;
        const val = e.currentTarget.value;

        let newData = {...info};
            newData[id] = val;
            
        setInfo(newData);
    };


    //체크박스, 라디오 값 변경시
    const onCheckChangeHandler = (checked, name, val) => {
        let newData = {...info};

        if(checked){
            newData[name] = val;
        }else{
            newData[name] = "";
        }
        
        setInfo(newData);
    };


    //셀렉트값 변경시
    const onSelectChangeHandler = (name, val) => {
        let newData = {...info};
        const numericValue = parseInt(val, 10); // 문자열을 숫자로 변환

        if (!isNaN(numericValue)) { // 숫자로 변환 가능한 경우
            newData[name] = numericValue;
        }else{
            newData[name] = val;
        }
    
        setInfo(newData);
    };


    //에디터내용 값
    const onEditorChangeHandler = (e) => {
        setTemplateEditor(e);
        
    };


    //에디터 HTML 버튼클릭시 textarea 보이기
    const handleClickShowRaw = () => {
        setShowRaw(!showRaw);
    };


    //에디터 HTML 버튼 토글
    useEffect(()=>{
        if(!firstTime){
            if (showRaw) {
                setRawHtml(templateEditor);
            }else {
                setTemplateEditor(rawHtml);
            }
        }
    },[showRaw]);

    useEffect(()=>{
        let newData = {...info};
        if(info.b_template == "Y"){
            if(temStep === 1 && !showRaw){ //CH에디터 탭에 입력값
                newData.b_template_text = templateEditor;
            }else if(temStep === 1 && showRaw){ //CH에디터 탭에 HTML입력값
                newData.b_template_text = rawHtml;
            }else if(temStep === 2){ //Textarea 탭에 입력값
                newData.b_template_text = templateText;
            }
            setInfo(newData);
        }
    },[templateEditor, rawHtml, templateText]);


    return(<>
        <div className="tab_con tab_con5">
            <div className="tab_inner">
                <div className="form_pop_inner">
                    <div className="form_inner">
                        <div className="form_box">
                            <div className="form_input">
                                <h6>목록 갯수</h6>
                                <div className="input_wrap">
                                    <TxtSelectBox 
                                        className="select_type1"
                                        list={[10,15,30,50]}
                                        selected={limit || ""}
                                        onChangeHandler={(e)=>{
                                            const val = e.currentTarget.value;
                                            setLimit(val);
                                            onSelectChangeHandler("b_list_cnt",val);
                                        }}
                                        selHidden={true}
                                        limitSel={`개씩`}
                                    />
                                </div>
                            </div>
                            <div className="form_input">
                                <h6>게시판 분류 사용여부</h6>
                                {popup.adminSubCategoryPopIdx ? //수정일때만 분류설정가능
                                    <div className="input_wrap">
                                        <div className="chk_rdo_wrap chk_rdo_wrap2">
                                            <div className="chk_box1">
                                                <input type="checkbox" id="check_split" className="blind"
                                                    onChange={(e)=>{
                                                        const checked = e.currentTarget.checked;
                                                        onCheckChangeHandler(checked,"b_group","Y");
                                                    }}
                                                    checked={info.b_group && info.b_group == "Y" ? true : false}
                                                />
                                                <label htmlFor="check_split">체크 시 게시판 분류를 사용합니다.</label>
                                            </div>
                                            <button type="button" className="btn_right" onClick={()=>{
                                                dispatch(adminBoardGroupPop({adminBoardGroupPop:true,adminBoardGroupPopId:info.id}));
                                            }}>분류 설정</button>
                                        </div>
                                    </div>
                                    :<p className="f_16">하위 카테고리를 등록 후 수정 시에 설정 가능합니다.</p>
                                }
                            </div>
                        </div>
                        <div className="form_box form_box2 form_border_box">
                            <div className="form_input">
                                <h6>게시판 상단 HTML</h6>
                                <textarea 
                                    style={{height:"150px"}}
                                    value={info.b_top_html || ""}
                                    onChange={onInputChangeHandler}
                                    id={`b_top_html`}
                                />
                            </div>
                        </div>
                        <div className="form_box form_box2">
                            <div className="form_input">
                                <h6>게시글 템플릿 적용</h6>
                                <div className="input_wrap">
                                    <div className="chk_rdo_wrap chk_rdo_wrap2">
                                        <div className="chk_box1">
                                            <input type="checkbox" id="chkPop61" className="blind"/>
                                            <input type="checkbox" id="check_tem" className="blind"
                                                onChange={(e)=>{
                                                    const checked = e.currentTarget.checked;
                                                    onCheckChangeHandler(checked,"b_template","Y");
                                                }}
                                                checked={info.b_template && info.b_template == "Y" ? true : false}
                                            />
                                            <label htmlFor="check_tem">게시글 작성 시 템플릿 적용 가능</label>
                                        </div>
                                    </div>
                                </div>
                                {info.b_template == "Y" &&
                                    <div className="tab_wrap">
                                        <ul className="tab_type2">
                                            <li className={temStep === 1 ? "on" : ""}>
                                                <button type="button" onClick={()=>setTemStep(1)}>CH에디터</button>
                                            </li>
                                            <li className={temStep === 2 ? "on" : ""}>
                                                <button type="button" onClick={()=>setTemStep(2)}>Textarea</button>
                                            </li>
                                        </ul>
                                        <div className="tab_inner">
                                            {temStep === 1 ?
                                                <div className="edit_box">
                                                    <Editor 
                                                        value={templateEditor}
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
                                                :<textarea 
                                                    style={{height:"350px"}}
                                                    value={templateText || ""}
                                                    onChange={(e)=>setTemplateText(e.currentTarget.value)}
                                                />
                                            } 
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default SubCategoryPopCont6;