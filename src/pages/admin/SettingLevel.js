import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { enum_api_uri } from "../../config/enum";
import * as CF from "../../config/function";
import { confirmPop } from "../../store/popupSlice";
import { checkedList } from "../../store/etcSlice";
import { userLevelList } from "../../store/commonSlice";
import ConfirmPop from "../../components/popup/ConfirmPop";
import InputBox from "../../components/component/InputBox";
import BtnInputBox from "../../components/component/admin/BtnInputBox";


const SettingLevel = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const etc = useSelector((state)=>state.etc);
    const level_list = enum_api_uri.level_list;
    const [confirm, setConfirm] = useState(false);
    const [list, setList] = useState([]);
    const [totalCnt, setTotalCnt] = useState(0);
    const [nameInput, setNameInput] = useState([]);
    const [nameOn, setNameOn] = useState([]);


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);


    //회원등급리스트 가져오기
    const getLevelList = () => {
        axios.get(level_list,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                const data = res.data.data;
                setList(data);

                //등록한 회원 등급 총개수
                const useLevelList = data
                .filter((item)=>item.l_name !== null)    //미등록등급 제외
                .filter((item)=>item.l_name.length > 0)  //미등록등급 제외
                const useLevel = useLevelList.length;
                setTotalCnt(useLevel);

                //등급명 배열로 추출
                const nameInputList = data.map((item) => item.l_name);
                setNameInput(nameInputList);

                const nameOnList = data.map(() => false);
                setNameOn(nameOnList);
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


    //맨처음 회원등급리스트 가져오기
    useEffect(()=>{
        getLevelList();
    },[]);


    //체크박스 체크시
    const checkHandler = async (checked, value) => {
        const val = parseInt(value, 10); //input의 value 가 문자열로 처리됨으로 숫자로 변경해줌
        let newList = etc.checkedList;
        if(checked){
            newList = newList.concat(val);
        }else if(!checked && newList.includes(val)){
            newList = newList.filter((el)=>el !== val);
        }
        dispatch(checkedList(newList));
    };


    //등급명 변경시 인풋값 변경
    const onNameChangeHandler = (val, idx) => {
        let newNameInput = [...nameInput];
            newNameInput[idx] = val;
        setNameInput(newNameInput);
    };


    //등급명 변경시 인풋 on 변경
    const onNameOnHandler = (val, idx) => {
        let newNameOn = [...nameOn];
        newNameOn[idx] = val;
        setNameOn(newNameOn);
    };


    //등급명 수정하기
    const onNameEditHandler = (idx, signup_lv, l_level) => {
        const body = {
            l_name: nameInput[idx],
            signup_lv: signup_lv,
            l_level: l_level
        };
        axios.put(level_list, body,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                //변경된회원등급리스트 store에 저장하기
                saveLevelList();

                let newList = [...list];
                newList[idx].l_name = nameInput[idx];
                setList(newList);

                let newNameOn = [...nameOn];
                newNameOn[idx] = false;
                setNameOn(newNameOn);

                //체크박스 해제
                dispatch(checkedList([]));
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


    //변경된회원등급리스트 store에 저장하기
    const saveLevelList = () => {
        axios.get(level_list,
            {headers:{Authorization: `Bearer ${user.loginUser.accessToken}`}}
        )
        .then((res)=>{
            if(res.status === 200){
                let data = res.data.data;
                const list = data
                .filter((item)=>item.l_name !== null)    //미등록등급 제외
                .filter((item)=>item.l_name.length > 0)  //미등록등급 제외
                dispatch(userLevelList(list));
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


    //회원가입등급 설정버튼 클릭시
    const onSignupLevelSettingHandler = () => {
        //체크박스 2개 이상 선택시 불가
        if(etc.checkedList.length > 1){
            dispatch(confirmPop({
                confirmPop:true,
                confirmPopTit:'알림',
                confirmPopTxt:'회원가입 초기 등급은 1개만 설정이 가능합니다.',
                confirmPopBtn:1,
            }));
            setConfirm(true);
        }else{
            const l_level = etc.checkedList[0];
            const levelList = [...list];
            const idx = levelList.findIndex((item) => item.l_level == l_level);
            const level = levelList[idx];

            if(level.l_name !== null && level.l_name && level.l_name.length > 0){
                onNameEditHandler(idx, 'Y', l_level);
            }else{
                dispatch(confirmPop({
                    confirmPop:true,
                    confirmPopTit:'알림',
                    confirmPopTxt:'등급명이 등록되어있지 않아 초기 등급설정이 불가합니다. <br/>등급명을 먼저 등록해주세요.',
                    confirmPopBtn:1,
                }));
                setConfirm(true);
            }
        }
    };


    return(<>
        <div className="page_admin_setting">
            <div className="content_box">
                <div className="tit tit2">
                    <h3>
                        <b>등록한 회원 등급</b>
                    </h3>
                    <strong>총 {CF.MakeIntComma(totalCnt)}개</strong>
                </div>
                <div className="board_section">
                    <div className="board_table_util">
                        <div className="util_wrap">
                            <span>회원가입 시 초기 등급으로</span>
                            <button type="button" className="btn_type8" onClick={onSignupLevelSettingHandler}>설정</button>
                            <p>※ 하나의 등급만 회원 가입시 초기 등급으로 설정할 수 있습니다.</p>
                        </div>
                    </div>
                    <div className="tbl_wrap1">
                        <table>
                            <colgroup>
                                <col style={{'width':'80px'}} />
                                <col style={{'width':'12%'}} />
                                <col style={{'width':'12%'}} />
                                <col style={{'width':'auto'}} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>등급 레벨</th>
                                    <th>회원가입 초기 등급</th>
                                    <th>등급명</th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.map((cont,i)=>{
                                    return(
                                        <tr key={i}>
                                            <td>
                                                <div className="chk_box2">
                                                    <input type="checkbox" id={`check_${cont.l_level}`} className="blind"
                                                        value={cont.l_level}
                                                        onChange={(e) => {
                                                            const isChecked = e.currentTarget.checked;
                                                            const value = e.currentTarget.value;
                                                            checkHandler(isChecked, value);
                                                        }}
                                                        checked={etc.checkedList.includes(cont.l_level)}
                                                    />
                                                    <label htmlFor={`check_${cont.l_level}`}>선택</label>
                                                </div>
                                            </td>
                                            <td><em className="txt_color1">{cont.l_level}</em></td>
                                            <td>{cont.signup_lv !== null && <em className="txt_color2">설정</em>}</td>
                                            <td>
                                                {cont.l_level === 9 || cont.l_level === 0 ? 
                                                    <InputBox
                                                        className="input_box" 
                                                        type={`text`}
                                                        value={cont.l_name}
                                                        disabled={true}
                                                    />
                                                    :
                                                    <BtnInputBox 
                                                        type={`text`}
                                                        value={nameInput[i] || ''}
                                                        onChangeHandler={(e)=>{
                                                            const val = e.currentTarget.value;
                                                            onNameChangeHandler(val,i);
                                                            
                                                            //등급명이 기존값과 다르면 on, 같으면 off
                                                            if(cont.l_name == val){
                                                                onNameOnHandler(false, i);
                                                            }else{
                                                                onNameOnHandler(true, i);
                                                            }
                                                        }}
                                                        on={nameOn[i] ? true : false}
                                                        onClickHandler={()=>onNameEditHandler(i, cont.signup_lv, cont.l_level)}
                                                        btnTxt={cont.l_name ? '수정' : '등록'}
                                                    />
                                                }
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>


        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default SettingLevel;