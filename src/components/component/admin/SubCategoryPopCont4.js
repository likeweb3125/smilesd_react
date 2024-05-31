import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import * as CF from "../../../config/function";
import { enum_api_uri } from "../../../config/enum";
import { confirmPop, adminSubCategoryPopData } from "../../../store/popupSlice";
import InputBox from "../InputBox";
import TxtSelectBox from "./TxtSelectBox";
import ConfirmPop from "../../popup/ConfirmPop";
import Editor from "../Editor";


const SubCategoryPopCont4 = (props) => {
    const dispatch = useDispatch();
    const popup = useSelector((state)=>state.popup);
    const common = useSelector((state)=>state.common);
    const [temStep, setTemStep] = useState(1);
    const [confirm, setConfirm] = useState(false);
    const [info, setInfo] = useState({});
    const [limit, setLimit] = useState(null);
    const [levelList, setLevelList] = useState([]);
    const [readSelect, setReadSelect] = useState("");
    const [readLevel, setReadLevel] = useState(null);
    const [writeSelect, setWriteSelect] = useState("");
    const [writeLevel, setWriteLevel] = useState(null);
    const [replySelect, setReplySelect] = useState("");
    const [replyLevel, setReplyLevel] = useState(null);
    const [commentSelect, setCommentSelect] = useState("");
    const [commentLevel, setCommentLevel] = useState(null);
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
        setInfo(props.info);
        setLimit(props.info.b_list_cnt);
        setReadLevel(props.info.b_read_lv);
        setWriteLevel(props.info.b_write_lv);
        setReplyLevel(props.info.b_reply_lv);
        setCommentLevel(props.info.b_comment_lv);
        setTemplateEditor(props.info.b_template_text);
    },[props.info]);


    // useEffect(()=>{
    //     //카테고리 값 변경시 adminSubCategoryPopData store 에 저장
    //     dispatch(adminSubCategoryPopData(info));
    // },[info]);


    //맨처음 랜더링
    useEffect(()=>{
        if(firstTime){ //맨처음 랜더링
            setFirstTime(false);
        }
    },[]);


    //회원등급리스트 가져오기
    useEffect(()=>{
        const list = common.userLevelList;

        setLevelList(list);
    },[common.userLevelList]);


    //회원등급리스트 값 있으면 각각 권한 셀렉트에 txt 값 넣기
    useEffect(()=>{
        if(levelList.length > 0 && Object.keys(info).length > 0){
            let read = '';
            let write = '';
            let reply = '';
            let comment = '';
            if(info.b_read_lv !== null){
                read = levelList.find(item=>item.l_level === info.b_read_lv);
                read = read.l_name;
            }
            if(info.b_write_lv !== null){
                write = levelList.find(item=>item.l_level === info.b_write_lv);
                write = write.l_name;
            }
            if(info.b_reply_lv !== null){
                reply = levelList.find(item=>item.l_level === info.b_reply_lv);
                reply = reply.l_name;
            }
            if(info.b_comment_lv !== null){
                comment = levelList.find(item=>item.l_level === info.b_comment_lv);
                comment = comment.l_name;
            }

            // let read = levelList.find(item=>item.l_level === props.info.b_read_lv);
            // read = read.l_name;

            // let write = levelList.find(item=>item.l_level === props.info.b_write_lv);
            // write = write.l_name;

            // let reply = levelList.find(item=>item.l_level === props.info.b_reply_lv);
            // reply = reply.l_name;

            // let comment = levelList.find(item=>item.l_level === props.info.b_comment_lv);
            // comment = comment.l_name;
            
            setReadSelect(read);
            setWriteSelect(write);
            setReplySelect(reply);
            setCommentSelect(comment);
        }

        //카테고리 값 변경시 adminSubCategoryPopData store 에 저장
        dispatch(adminSubCategoryPopData(info));
    },[levelList, info]);


    //인풋값 변경시
    const onInputChangeHandler = (e) => {
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
        <div className="tab_con tab_con4">
            <div className="tab_inner">
                <div className="form_pop_inner">
                    <div className="form_inner">
                        <div className="form_box form_border_box">
                            <div className="form_input">
                                <h6>목록 요소</h6>
                                <div className="input_wrap">
                                    <div className="chk_rdo_wrap chk_rdo_wrap2">
                                        <div className="chk_box1">
                                            <input type="checkbox" id="check_tit" className="blind"
                                                onChange={(e)=>{
                                                    const checked = e.currentTarget.checked;
                                                    onCheckChangeHandler(checked,"b_column_title","Y");
                                                }}
                                                checked={info.b_column_title && info.b_column_title == "Y" ? true : false}
                                            />
                                            <label htmlFor="check_tit">제목</label>
                                        </div>
                                        <div className="chk_box1">
                                            <input type="checkbox" id="check_date" className="blind"
                                                onChange={(e)=>{
                                                    const checked = e.currentTarget.checked;
                                                    onCheckChangeHandler(checked,"b_column_date","Y");
                                                }}
                                                checked={info.b_column_date && info.b_column_date == "Y" ? true : false}
                                            />
                                            <label htmlFor="check_date">등록 일자</label>
                                        </div>
                                        <div className="chk_box1">
                                            <input type="checkbox" id="check_view" className="blind"
                                                onChange={(e)=>{
                                                    const checked = e.currentTarget.checked;
                                                    onCheckChangeHandler(checked,"b_column_view","Y");
                                                }}
                                                checked={info.b_column_view && info.b_column_view == "Y" ? true : false}
                                            />
                                            <label htmlFor="check_view">조회수</label>
                                        </div>
                                        {/* <div className="chk_box1">
                                            <input type="checkbox" id="check_recom" className="blind"
                                                onChange={(e)=>{
                                                    const checked = e.currentTarget.checked;
                                                    onCheckChangeHandler(checked,"b_column_recom","Y");
                                                }}
                                                checked={info.b_column_recom && info.b_column_recom == "Y" ? true : false}
                                            />
                                            <label htmlFor="check_recom">추천수</label>
                                        </div> */}
                                        <div className="chk_box1">
                                            <input type="checkbox" id="check_file" className="blind"
                                                onChange={(e)=>{
                                                    const checked = e.currentTarget.checked;
                                                    onCheckChangeHandler(checked,"b_column_file","Y");
                                                }}
                                                checked={info.b_column_file && info.b_column_file == "Y" ? true : false}
                                            />
                                            <label htmlFor="check_file">파일</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                        </div>
                        <div className="form_box">
                            <div className="form_input_wrap">
                                <div className="form_input">
                                    <h6>
                                        <div className="tip_box">
                                            <p className="tip_txt">읽기권한</p>
                                            <div className="box">
                                                <p>권한은 선택한 등급레벨에 따라 설정됩니다. 
                                                    <br/>0레벨, 9레벨을 제외한 다른레벨 선택시 
                                                    <br/>선택한 등급레벨부터 최고등급레벨(관리자)까지 사용가능합니다.</p>
                                                <ul>
                                                    <li className="flex_top">
                                                        <p>이용제한 lv.0</p>
                                                        <p>비회원,관리자포함 모든회원 사용가능합니다.</p>
                                                    </li>
                                                    <li className="flex_top">
                                                        <p>관리자 lv.9</p>
                                                        <p>관리자회원만 사용가능합니다.</p>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </h6>
                                    <div className="input_wrap">
                                        <TxtSelectBox 
                                            className="select_type2"
                                            list={levelList}
                                            selected={readSelect || ""}
                                            selectedLevel={readLevel}
                                            onChangeHandler={(e)=>{
                                                const val = e.currentTarget.value;
                                                const level = e.target.options[e.target.selectedIndex].getAttribute("data-level");
                                                setReadSelect(val);
                                                setReadLevel(level);
                                                onSelectChangeHandler("b_read_lv",level);
                                            }}
                                            selHidden={true}
                                            objectSel={`level_list`}
                                        />
                                    </div>
                                </div>
                                <div className="form_input">
                                    <h6>쓰기권한</h6>
                                    <div className="input_wrap">
                                        <TxtSelectBox 
                                            className="select_type2"
                                            list={levelList}
                                            selected={writeSelect || ""}
                                            selectedLevel={writeLevel}
                                            onChangeHandler={(e)=>{
                                                const val = e.currentTarget.value;
                                                const level = e.target.options[e.target.selectedIndex].getAttribute("data-level");
                                                setWriteSelect(val);
                                                setWriteLevel(level);
                                                onSelectChangeHandler("b_write_lv",level);
                                            }}
                                            selHidden={true}
                                            objectSel={`level_list`}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form_input">
                                <h6>작성 시 비밀글 설정 여부</h6>
                                <div className="input_wrap">
                                    <div className="chk_rdo_wrap chk_rdo_wrap2">
                                        <div className="chk_box1">
                                            <input type="checkbox" id="check_secret" className="blind"
                                                onChange={(e)=>{
                                                    const checked = e.currentTarget.checked;
                                                    onCheckChangeHandler(checked,"b_secret","Y");
                                                }}
                                                checked={info.b_secret && info.b_secret == "Y" ? true : false}
                                            />
                                            <label htmlFor="check_secret">체크 시 작성자와 운영자만 열람 가능한 비밀글 설정 가능</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="form_box">
                            <div className="form_input">
                                <h6>답변 사용 및 권한</h6>
                                <div className="input_wrap input_wrap2">
                                    <div className="chk_rdo_wrap chk_rdo_wrap2">
                                        <div className="chk_box1">
                                            <input type="checkbox" id="check_reply" className="blind"
                                                onChange={(e)=>{
                                                    const checked = e.currentTarget.checked;
                                                    onCheckChangeHandler(checked,"b_reply","Y");
                                                }}
                                                checked={info.b_reply && info.b_reply == "Y" ? true : false}
                                            />
                                            <label htmlFor="check_reply">체크 시 답변 작성 가능</label>
                                        </div>
                                    </div>
                                    <TxtSelectBox 
                                        className="select_type2"
                                        list={levelList}
                                        selected={replySelect || ""}
                                        selectedLevel={replyLevel}
                                        onChangeHandler={(e)=>{
                                            const val = e.currentTarget.value;
                                            const level = e.target.options[e.target.selectedIndex].getAttribute("data-level");
                                            setReplySelect(val);
                                            setReplyLevel(level);
                                            onSelectChangeHandler("b_reply_lv",level);
                                        }}
                                        selHidden={true}
                                        objectSel={`level_list`}
                                    />
                                </div>
                            </div>
                            <div className="form_input">
                                <h6>댓글 사용 및 권한</h6>
                                <div className="input_wrap input_wrap2">
                                    <div className="chk_rdo_wrap chk_rdo_wrap2">
                                        <div className="chk_box1">
                                            <input type="checkbox" id="check_comment" className="blind"
                                                onChange={(e)=>{
                                                    const checked = e.currentTarget.checked;
                                                    onCheckChangeHandler(checked,"b_comment","Y");
                                                }}
                                                checked={info.b_comment && info.b_comment == "Y" ? true : false}
                                            />
                                            <label htmlFor="check_comment">체크 시 댓글쓰기 사용 가능</label>
                                        </div>
                                    </div>
                                    <TxtSelectBox 
                                        className="select_type2"
                                        list={levelList}
                                        selected={commentSelect || ""}
                                        selectedLevel={commentLevel}
                                        onChangeHandler={(e)=>{
                                            const val = e.currentTarget.value;
                                            const level = e.target.options[e.target.selectedIndex].getAttribute("data-level");
                                            setCommentSelect(val);
                                            setCommentLevel(level);
                                            onSelectChangeHandler("b_comment_lv",level);
                                        }}
                                        selHidden={true}
                                        objectSel={`level_list`}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="form_box form_border_box">
                            <div className="form_input">
                                <h6>게시 알림 사용</h6>
                                <div className="input_wrap">
                                    <div className="chk_rdo_wrap chk_rdo_wrap2">
                                        <div className="chk_box1">
                                            <input type="checkbox" id="check_alarm" className="blind"
                                                onChange={(e)=>{
                                                    const checked = e.currentTarget.checked;
                                                    onCheckChangeHandler(checked,"b_alarm","Y");
                                                }}
                                                checked={info.b_alarm && info.b_alarm == "Y" ? true : false}
                                            />
                                            <label htmlFor="check_alarm">체크 시 휴대폰 문자 전송</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="form_input">
                                <h6>게시 알림 전송 휴대폰 번호</h6>
                                <div className="input_wrap">
                                    <InputBox
                                        className="input_box" 
                                        type={`text`}
                                        placeholder={`숫자만 입력해주세요.`}
                                        value={info.b_alarm_phone || ""}
                                        onChangeHandler={onInputChangeHandler}
                                        id={`b_alarm_phone`}
                                        phone={true}
                                    />
                                </div>
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

export default SubCategoryPopCont4;