import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import {
    loadCaptchaEnginge,
    LoadCanvasTemplate,
    validateCaptcha,
  } from "react-simple-captcha";
import { enum_api_uri } from "../../config/enum";
import * as CF from "../../config/function";
import history from "../../config/history";
import { confirmPop } from "../../store/popupSlice";
import { detailPageBack } from "../../store/commonSlice";
import { passOk } from "../../config/constants";
import InputBox from "../../components/component/InputBox";
import ConfirmPop from "../../components/popup/ConfirmPop";
import TextareaBox from "../../components/component/TextareaBox";
import SelectBox from "../../components/component/SelectBox";


const InquiryWrite = (props) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { menu_idx, board_idx } = useParams();
    const api_uri = enum_api_uri.api_uri;
    const board_detail = enum_api_uri.board_detail;
    const board_file = enum_api_uri.board_file;
    const board_modify = enum_api_uri.board_modify;
    const board_group_list = enum_api_uri.board_group_list;
    const user = useSelector((state)=>state.user);
    const popup = useSelector((state)=>state.popup);
    const common = useSelector((state)=>state.common);
    const [confirm, setConfirm] = useState(false);
    const [boardData, setBoardData] = useState({});
    const [boardSettingData, setBoardSettingData] = useState({});
    const [content, setContent] = useState("");
    const [files, setFiles] = useState([]);
    const [filesData, setFilesData] = useState([]);
    const [deltFiles, setDeltFiles] = useState([]);
    const [password, setPassword] = useState("");
    const [passwordOn, setPasswordOn] = useState(false);
    const [thumbImg, setThumbImg] = useState(null);
    const [thumbImgData, setThumbImgData] = useState(null);
    const [groupList, setGroupList] = useState([]);
    const [groupSelect, setGroupSelect] = useState("");
    const [groupSelectId, setGroupSelectId] = useState(null);
    const [secret, setSecret] = useState(false);
    const [alarmOn, setAlarmOn] = useState(false);
    const [emailOn, setEmailOn] = useState(false);
    const [SmsOn, setSmsOn] = useState(false);
    const [login, setLogin] = useState(false);


    //상세페이지 뒤로가기
    useEffect(() => {
        const listenBackEvent = () => {
            dispatch(detailPageBack(true));
        };
    
        const unlistenHistoryEvent = history.listen(({ action }) => {
            if (action === "POP") {
                listenBackEvent();
            }
        });

        return unlistenHistoryEvent;
    },[]);


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);


    //로그인했는지 체크
    useEffect(()=>{
        if(user.loginStatus){
            setLogin(true);
        }else{
            setLogin(false);
        }
    },[user.loginStatus]);


    //게시글정보 가져오기
    const getBoardData = () => {
        //비밀글일때 비밀번호체크했는지 확인
        let pass = false;
        if(common.secretPassCheckOk){
            pass = true;
        }

        axios.get(`${board_detail.replace(":category",menu_idx).replace(":idx",board_idx)}${pass ? '?pass='+passOk : ''}`)
        .then((res)=>{
            if(res.status === 200){
                let data = res.data.data;
                setBoardData(data);
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


    //맨처음 
    useEffect(()=>{
        //게시판설정정보 가져오기
        setBoardSettingData(common.boardSettingData);

        //새로작성페이지가 아닐때만 게시글정보 가져오기 
        if(!props.write){
            getBoardData();
        } 

        //보안문자 설정
        loadCaptchaEnginge(6,"#C5CCE3",'#142864');
    },[]);


    //게시글수정페이지일때 게시글정보 값 뿌려주기
    useEffect(()=>{
        if(boardData.b_contents){
            setContent(boardData.b_contents);
        }
        if(boardData.b_file){
            let list = [...files];
                list = boardData.b_file;
            setFiles(list);
        }
        if(boardSettingData.c_content_type === 5 && boardData.b_img){
            let name = boardData.b_img.replace("upload/board/","");
            let url = api_uri + boardData.b_img;
            let data = {
                name: name,
                url: url
            };
            setThumbImg(data);
        }
        if(boardData.m_pwd){
            setPasswordOn(true);
        }
        if(boardData.b_secret === 'Y'){
            setSecret(true);
        }
    },[boardData]);


    //게시글설정값에 따라 값 뿌려주기
    useEffect(()=>{
        // 새로작성페이지일때 템플릿 적용설정일때만
        if(props.write && boardSettingData.b_template == "Y"){
            setContent(boardSettingData.b_template_text);
        }

        //게시판 분류사용시 분류유형리스트 가져오기
        if(boardSettingData.b_group == "Y"){
            getGroupList();
        }

        //비밀글설정일때
        if(boardSettingData.b_secret == 'Y'){
            setPasswordOn(true);

            //미로그인시 비밀글체크 고정
            if(!login){
                setSecret(true);
            }
        } 

        //답변 알림 수신일때
        if(boardSettingData.b_write_alarm == 'Y'){
            setAlarmOn(true);
            if(boardSettingData.b_write_send == 'Y'){
                setEmailOn(true);
            }
            if(boardSettingData.b_write_sms == 'Y'){
                setSmsOn(true);
            }
        } 
    },[boardSettingData]);


    //게시판 분류유형리스트 가져오기
    const getGroupList = () => {
        axios.get(`${board_group_list.replace(":parent_id",menu_idx)}`)
        .then((res)=>{
            if(res.status === 200){
                let data = res.data.data;
                const newList = data.filter((item)=>item.g_num !== "0"); //숨긴분류 제외
                setGroupList(newList);
            }
        })
        .catch((error) => {
            const err_msg = CF.errorMsgHandler(error);

            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt: err_msg,
                confirmPopBtn:1,
            }));
            setConfirm(true);
        });
    };


    //게시글수정페이지일때 분류유형 값 뿌려주기
    useEffect(()=>{
        if(groupList.length > 0 && !props.write && boardData.group_id){
            const findItem = groupList.find((item)=>item.id === boardData.group_id);
            const txt = findItem.g_name;
            const id = findItem.id;
            setGroupSelect(txt);
            setGroupSelectId(id);
        }
    },[groupList, boardData]);


    //인풋값 변경시
    const onInputChangeHandler = (e) => {
        const id = e.currentTarget.id;
        const val = e.currentTarget.value;
        console.log(id);

        let newData = {...boardData};
            newData[id] = val;
            
        setBoardData(newData);
    };


    //첨부파일 등록
    const { getRootProps: getRootProps1, getInputProps: getInputProps1 } = useDropzone({
        multiple: true, // 여러 개의 파일 선택 가능하도록 설정
        onDrop: acceptedFiles => {
            setFiles(prevFiles => [
                ...prevFiles,
                ...acceptedFiles.map((file,i) => ({
                    id: uuidv4(), // 고유한 식별자로 파일 이름 사용
                    original_name: file.name,
                }))
            ]);

            setFilesData(acceptedFiles);
        }
    });


    //첨부파일 삭제버튼 클릭시
    const handleRemove = (i, idx) => {
        let newList = [...files];
            newList.splice(i,1);
        setFiles(newList);

        //서버에 저장된 파일이면 deltFiles 에 추가
        if(idx){
            let list = [...deltFiles];
            list.push(idx);
            setDeltFiles(list);
        }
    };


    //파일삭제하기
    const fileDeltHandler = () => {
        const body = {
            idx: deltFiles,
        };
        axios.delete(`${board_file}`,
            {
                data: body,
            }
        )
        .then((res)=>{
            if(res.status === 200){
                submitHandler(); //글 수정, 등록하기
            }
        })
        .catch((error) => {
            const err_msg = CF.errorMsgHandler(error);
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt: err_msg,
                confirmPopBtn:1,
            }));
            setConfirm(true);
        });
    };


    //글 수정, 등록버튼 클릭시 삭제파일있으면 삭제후 submit
    const submitClickHandler = () => {
        let user_captcha = document.getElementById("user_captcha_input").value;

        if(!boardData.b_title){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'제목을 입력해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }else if(!boardData.b_contents){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'문의내용을 입력해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }
        // 비회원일때 작성자, 비밀글작성 필수값체크
        else if(!login && !boardData.m_name){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'작성자를 입력해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }else if(boardSettingData.b_secret == "Y" && !login && !secret){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'비회원인 경우 비밀글로 작성해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }
        // 분류사용시 분류유형선택 체크
        else if(boardSettingData.b_group == "Y" && !groupSelect){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'유형을 선택해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }
        // 비밀글설정체크시 비밀번호입력 체크
        else if(secret && !password){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'비밀글 설정시 비밀번호를 입력해주세요.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }else if (validateCaptcha(user_captcha) == false) {
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'보안문자를 잘못 입력했습니다.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }else{
            if(deltFiles.length > 0){
                fileDeltHandler();
            }else{
                submitHandler();
            }
        }
    };


    //글 수정, 등록하기
    const submitHandler = () => {
        const formData = new FormData();

        //첨부파일
        if(filesData.length > 0){
            filesData.forEach((file) => {
                formData.append("b_file", file);
            });
        }else{
            formData.append("b_file", "");
        }

        let m_name = '';
        let m_email = '';
        if(login){
            m_name = user.loginUser.m_name;
            m_email = user.loginUser.m_email;
        }else{
            m_name = boardData.m_name;
        }

        let b_secret = '';
        if(secret){
            b_secret = 'Y';
        }

        formData.append("category", menu_idx);
        formData.append("m_email", m_email);
        formData.append("m_name", m_name);
        formData.append("m_pwd", password);
        formData.append("b_title", boardData.b_title);
        formData.append("b_contents", boardData.b_contents);
        formData.append("b_depth", 0);
        formData.append("b_secret", b_secret);

        //분류사용시 유형선택값 보내기
        if(boardSettingData.b_group == "Y"){
            formData.append("group_id", groupSelectId);
        }

        //게시글 수정일때
        if(!props.write){
            formData.append("idx", board_idx);

            //비밀글 비밀번호체크후 수정일때 pass 값 추가
            if(common.secretPassCheckOk){
                formData.append("pass", passOk);
            }

            axios.put(`${board_modify}`, formData, {
                headers: {
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

                dispatch(confirmPop({
                    confirmPop:true,
                    confirmPopTit:'알림',
                    confirmPopTxt: err_msg,
                    confirmPopBtn:1,
                }));
                setConfirm(true);
            });
        }     
        //게시글 새로작성일때
        else{
            axios.post(`${board_modify}`, formData, {
                headers: {
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

                dispatch(confirmPop({
                    confirmPop:true,
                    confirmPopTit:'알림',
                    confirmPopTxt: err_msg,
                    confirmPopBtn:1,
                }));
                setConfirm(true);
            });
        }
    };


    return(<>
        <div className="page_user_board">
            <div className="section_inner">
                <div className="board_section">
                    <div className="board_inquiry">
                        <h4>
                            <strong>1:1 문의 작성</strong>
                            <p>문의하신 내용의 답변은 이메일에서도 확인이 가능하며, 충분한 검토를 거쳐 신속하게 답변 드리겠습니다.</p>
                        </h4>
                        <div className="tbl_wrap4">
                            <table>
                                <caption>문의 작성 테이블</caption>
                                <colgroup>
                                    <col style={{'width':'180px'}}/>
                                    <col style={{'width':'auto'}}/>
                                </colgroup>
                                <tbody>
                                    {!login &&
                                        <tr>
                                            <th>작성자 <i>*</i></th>
                                            <td>
                                                <InputBox
                                                    className="input_box" 
                                                    type={`text`}
                                                    placeholder={`작성자를 입력해주세요.`}
                                                    value={boardData.m_name || ""}
                                                    onChangeHandler={onInputChangeHandler}
                                                    id={`m_name`}
                                                />
                                            </td>
                                        </tr>
                                    }
                                    {boardSettingData.b_group == "Y" &&
                                        <tr>
                                            <th>유형 <i>*</i></th>
                                            <td>
                                                <SelectBox 
                                                    className="select_type3"
                                                    list={groupList}
                                                    selected={groupSelect}
                                                    onChangeHandler={(e)=>{
                                                        const val = e.currentTarget.value;
                                                        const id = e.target.options[e.target.selectedIndex].getAttribute("data-id");
                                                        setGroupSelect(val);
                                                        setGroupSelectId(id);
                                                    }}
                                                    selHidden={true}
                                                    objectSel={`board_group`}
                                                />
                                            </td>
                                        </tr>
                                    }
                                    <tr>
                                        <th>제목 <i>*</i></th>
                                        <td>
                                            <InputBox
                                                className="input_box" 
                                                type={`text`}
                                                placeholder={`제목을 입력해주세요.`}
                                                countShow={true}
                                                countMax={40}
                                                count={boardData.b_title ? boardData.b_title.length : 0}
                                                value={boardData.b_title || ""}
                                                onChangeHandler={onInputChangeHandler}
                                                id={`b_title`}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>문의 내용 <i>*</i></th>
                                        <td>
                                            <div className="textarea_box">
                                                <TextareaBox 
                                                    cols={30}
                                                    rows={13}
                                                    placeholder="문의하실 내용을 입력해주세요."
                                                    countShow={true}
                                                    countMax={300}
                                                    count={boardData.b_contents ? boardData.b_contents.length : 0}
                                                    value={boardData.b_contents || ""}
                                                    onChangeHandler={onInputChangeHandler}
                                                    id={`b_contents`}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>파일첨부</th>
                                        <td>
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
                                                {files.length > 0 &&
                                                    <ul className="file_txt">
                                                        {files.map((cont,i)=>{
                                                            return(
                                                                <li key={i}>
                                                                    <span>{cont.original_name}</span>
                                                                    <button type="button" className="btn_file_remove" 
                                                                        onClick={() => {
                                                                            let id;
                                                                            if(cont.idx){
                                                                                id = cont.idx;
                                                                            }else{
                                                                               id = null; 
                                                                            }
                                                                            handleRemove(i,id);
                                                                        }}
                                                                    >파일삭제</button>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                }
                                            </div>
                                        </td>
                                    </tr>
                                    {/* 게시판 비밀글설정가능일때 노출 */}
                                    {passwordOn && <>
                                        <tr>
                                            <th>비밀번호 설정</th>
                                            <td>
                                                <div className="pwd_wrap">
                                                    <InputBox
                                                        className="input_box" 
                                                        type={`text`}
                                                        placeholder={`비밀번호를 설정해주세요.`}
                                                        value={password}
                                                        onChangeHandler={(e)=>{
                                                            const val = e.currentTarget.value;
                                                            setPassword(val);
                                                        }}
                                                        id={`m_pwd`}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>비밀글 설정</th>
                                            <td>
                                                <div className="chk_box1">
                                                    <input type="checkbox" id="chkSecret" className="blind" 
                                                        onChange={(e)=>{
                                                            const checked = e.currentTarget.checked;
                                                            if(checked){
                                                                setSecret(true);
                                                            }else{
                                                                setSecret(false);
                                                            }
                                                        }}
                                                        checked={secret ? true : false}
                                                    />
                                                    <label htmlFor="chkSecret">체크 시 비밀글로 작성됩니다.</label>
                                                </div>
                                            </td>
                                        </tr>
                                    </>}
                                    {/* 답변 알림 수신 == 'Y' 일때 노출 */}
                                    {alarmOn &&
                                        <tr>
                                            <th>답변 알림 수신</th>
                                            <td>
                                                <div className="chk_rdo_wrap chk_rdo_wrap2">
                                                    {emailOn &&
                                                        <div className="chk_box1">
                                                            <input type="checkbox" id="chkEmail" className="blind"/>
                                                            <label htmlFor="chkEmail">이메일</label>
                                                        </div>
                                                    }
                                                    {SmsOn &&
                                                        <div className="chk_box1">
                                                            <input type="checkbox" id="chkMsg" className="blind"/>
                                                            <label htmlFor="chkMsg">문자</label>
                                                        </div>
                                                    }
                                                </div>
                                                <p className="txt">* 회원가입시 입력했던 회원 정보로 수신됩니다.</p>
                                            </td>
                                        </tr>
                                    }
                                    <tr>
                                        <th>보안문자</th>
                                        <td>
                                            <div className="secure_wrap">
                                                <div className="secure_code">
                                                    <LoadCanvasTemplate />
                                                </div>
                                                <div className="input_box">
                                                    <input
                                                        placeholder="보안문자를 입력해주세요."
                                                        id="user_captcha_input"
                                                        name="user_captcha_input"
                                                        type="text"
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="btn_between_wrap">
                            <div className="between_box">
                                <button type="button" className="btn_list" onClick={()=>{navigate(-1)}}>목록으로</button>
                            </div>
                            <div className="between_box">
                                <button type="button" className="btn_type22" onClick={()=>{navigate(-1)}}>취소</button>
                                <button type="button" className="btn_type23"
                                    onClick={submitClickHandler}
                                >등록</button>
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

export default InquiryWrite;