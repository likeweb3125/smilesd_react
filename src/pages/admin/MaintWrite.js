import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDropzone } from 'react-dropzone';
import { enum_api_uri } from "../../config/enum";
import * as CF from "../../config/function";
import { confirmPop } from "../../store/popupSlice";
import InputBox from "../../components/component/InputBox";
import ConfirmPop from "../../components/popup/ConfirmPop";
import Editor from "../../components/component/Editor";


const MaintWrite = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const maint_create = enum_api_uri.maint_create;
    const user = useSelector((state)=>state.user);
    const popup = useSelector((state)=>state.popup);
    const common = useSelector((state)=>state.common);
    const [confirm, setConfirm] = useState(false);
    const [boardData, setBoardData] = useState({});
    const [content, setContent] = useState("");
    const [files, setFiles] = useState(null);
    const [filesData, setFilesData] = useState(null);
    const [showRaw, setShowRaw] = useState(false);
    const [rawHtml, setRawHtml] = useState('');
    // const siteId = process.env.REACT_APP_SITE_ID;
    const siteId = 'likeweb';


    useEffect(()=>{
        console.log(common.siteInfo);
    },[common.siteInfo]);



    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);


    //인풋값 변경시
    const onInputChangeHandler = (e) => {
        const id = e.currentTarget.id;
        const val = e.currentTarget.value;

        let newData = {...boardData};
            newData[id] = val;
            
        setBoardData(newData);
    };


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
        if (showRaw) {
            setRawHtml(content);
        }else {
            setContent(rawHtml);
        }
    },[showRaw]);


    //에디터 기본내용 적용
    // useEffect(()=>{
    //     const txt = "<p>## 빠른 처리를 위해 아래 고객님 정보를 입력해주시길 바랍니다. ##</p><br/><p>- (필수)담당자 :</p><p>- (필수)담당자연락처(직통) :</p><p>- 담당자이메일 :</p><p>- (필수)도메인 :</p><p>- 보수내용 :</p>"
    //     setContent(txt);
    // },[]);


    //첨부파일 등록
    const { getRootProps: getRootProps1, getInputProps: getInputProps1 } = useDropzone({
        multiple: false, // 여러 개의 파일 선택 불가능하도록 설정
        onDrop: acceptedFiles => {
            const file = acceptedFiles[0];
        
            // 파일의 이름
            const name = file.name;

            setFiles(name);

            setFilesData(acceptedFiles);
        }
    });


    //글 등록버튼 클릭시
    const submitClickHandler = () => {
        let cont = '';
        if(showRaw){
            cont = rawHtml;
        }else{
            cont = content.replace(/<p><br><\/p>/g, "");
        }

        if(!boardData.subject){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'제목을 입력해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }else if(!boardData.company){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'담당자를 입력해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }else if(!boardData.m_tel){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'담당자 연락처를 입력해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }else if(!boardData.email){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'담당자 이메일을 입력해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }else if(!boardData.m_email){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'도메인을 입력해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }else if(!cont){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'내용을 입력해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }else{
            submitHandler();
        }
    };


    //글 등록하기
    const submitHandler = () => {
        const formData = new FormData();

        //첨부파일
        if(filesData != null && filesData.length > 0){
            filesData.forEach((file) => {
                formData.append("b_file", file);
            });
        }else{
            formData.append("b_file", "");
        }

        let cont;
        if(showRaw){
            cont = rawHtml;
        }else{
            cont = content;
        }

        let contents = "<p>## 빠른 처리를 위해 아래 고객님 정보를 입력해주시길 바랍니다. ##</p><br/><p>- (필수)담당자 :"+boardData.company+
                        "</p><p>- (필수)담당자연락처(직통) :"+boardData.m_tel+
                        "</p><p>- 담당자이메일 :"+boardData.email+
                        "</p><p>- (필수)도메인 :"+boardData.m_email+
                        "</p><p>- 보수내용 :"+cont+"</p>";
        
        formData.append("category", user.maintName);
        formData.append("name", user.maintName);
        formData.append("password", "");
        formData.append("subject", boardData.subject);
        formData.append("contents", contents);
        formData.append("company", siteId);
        formData.append("email", boardData.email);

        axios.post(maint_create, formData, {
            headers: {
                Authorization: `Bearer ${user.loginUser.accessToken}`,
                "Content-Type": "multipart/form-data",
            },
        })
        .then((res) => {
            if (res.status === 200) {
                navigate(-1);
            }
        })
        .catch((error) => {
            const err_msg = CF.errorMsgHandler(error);
            if(error.response.status === 401){//토큰에러시 관리자단 로그인페이지로 이동
                navigate("/console/login");
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


    return(<>
        <div className="page_admin_board">
            <div className="content_box">
                <div className="tit">
                    <h3>
                        <b>서비스 관리 및 유지보수 시스템</b>
                    </h3>
                </div>
                <div className="board_section">
                    <div className="board_write">
                        <div className="tbl_wrap2">
                            <table>
                                <caption>게시판 작성 테이블</caption>
                                <colgroup>
                                    <col style={{width: "140px"}}/>
                                    <col style={{width: "auto"}}/>
                                    <col style={{width: "24px"}}/>
                                    <col style={{width: "140px"}}/>
                                    <col style={{width: "auto"}}/>
                                </colgroup>
                                <tbody>
                                    <tr>
                                        <th>제목</th>
                                        <td colSpan={4}>
                                            <InputBox
                                                className="input_box" 
                                                type={`text`}
                                                placeholder={`제목을 입력해주세요.`}
                                                countShow={true}
                                                countMax={40}
                                                count={boardData.subject ? boardData.subject.length : 0}
                                                value={boardData.subject || ""}
                                                onChangeHandler={onInputChangeHandler}
                                                id={`subject`}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>담당자</th>
                                        <td>
                                            <InputBox
                                                className="input_box" 
                                                type={`text`}
                                                placeholder={`담당자를 입력해주세요.`}
                                                value={boardData.company || ""}
                                                onChangeHandler={onInputChangeHandler}
                                                id={`company`}
                                            />
                                        </td>
                                        <td></td>
                                        <th>담당자연락처(직통)</th>
                                        <td>
                                            <InputBox
                                                className="input_box" 
                                                type={`text`}
                                                placeholder={`연락처를 입력해주세요.`}
                                                value={boardData.m_tel || ""}
                                                onChangeHandler={onInputChangeHandler}
                                                id={`m_tel`}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>담당자이메일</th>
                                        <td>
                                            <InputBox
                                                className="input_box" 
                                                type={`text`}
                                                placeholder={`이메일을 입력해주세요.`}
                                                value={boardData.email || ""}
                                                onChangeHandler={onInputChangeHandler}
                                                id={`email`}
                                            />
                                        </td>
                                        <td></td>
                                        <th>도메인</th>
                                        <td>
                                            <InputBox
                                                className="input_box" 
                                                type={`text`}
                                                placeholder={`도메인을 입력해주세요.`}
                                                value={boardData.m_email || ""}
                                                onChangeHandler={onInputChangeHandler}
                                                id={`m_email`}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={5}>
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
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>
                                            <div className="tip_box">
                                                <p className="tip_txt">파일첨부</p>
                                                <div className="box">
                                                    <p>1개의 파일만 첨부 가능합니다. <br/>여러개 파일 등록시에는 압축하여 등록해주세요.</p>
                                                    <ul>
                                                        <li className="flex_top">
                                                            <p>첨부가능 파일</p>
                                                            <p>문서, 압축 파일, 이미지</p>
                                                        </li>
                                                        <li className="flex_top">
                                                            <p>첨부가능 확장자</p>
                                                            <p>zip, doc, docx, xls, xlsx, ppt, pptx, hwp, pdf, txt, jpg, jpeg, gif, bmp, png, psd, bmp, emf, exif, gif, ico, jpg, jpeg, png</p>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </th>
                                        <td colSpan={4}>
                                            <div className="file_box2">
                                                <div className="input_file">
                                                    <div {...getRootProps1({className: 'dropzone'})}>
                                                        <input {...getInputProps1({className: 'blind'})} />
                                                        <label>
                                                            <b>파일을 마우스로 끌어 오세요.</b>
                                                            <strong>파일선택</strong>
                                                        </label>
                                                    </div>
                                                </div>
                                                {files !== null &&
                                                    <ul className="file_txt">
                                                        <li>
                                                            <span>{files}</span>
                                                            <button type="button" className="btn_file_remove" 
                                                                onClick={() => {
                                                                    setFiles(null);
                                                                    setFilesData(null);
                                                                }}
                                                            >파일삭제</button>
                                                        </li>
                                                    </ul>
                                                }
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="form_btn_wrap">
                            <Link to={-1} className="btn_type3">취소</Link>
                            <button type="button" className="btn_type4" onClick={submitClickHandler}>등록</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default MaintWrite;