import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import * as CF from "../../../config/function";
import { enum_api_uri } from "../../../config/enum";
import { confirmPop, adminSubCategoryPopData } from "../../../store/popupSlice";
import InputBox from "../InputBox";
import SelectBox from "../SelectBox";
import ConfirmPop from "../../popup/ConfirmPop";



const SubCategoryPopCont3 = (props) => {
    const dispatch = useDispatch();
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const [confirm, setConfirm] = useState(false);
    const [info, setInfo] = useState({});


    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);


    useEffect(()=>{
        setInfo(props.info);
    },[props.info]);


    useEffect(()=>{
        //카테고리 값 변경시 adminSubCategoryPopData store 에 저장
        dispatch(adminSubCategoryPopData(info));
    },[info]);


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


    return(<>
        <div className="tab_con tab_con3">
            <div className="tab_inner">
                <div className="form_pop_inner">
                    <div className="form_inner">
                        <div className="form_box">
                            <div className="form_input">
                                <h6>카테고리 유형</h6>
                                <div className="input_wrap">
                                    <div className="chk_rdo_wrap">
                                        <div className="rdo_box1">
                                            <input type="radio" id="check_type1" className="blind"
                                                onChange={(e)=>{
                                                    const checked = e.currentTarget.checked;
                                                    onCheckChangeHandler(checked,"c_type",1);
                                                }}
                                                checked={info.c_type && info.c_type == 1 ? true : false}
                                                name="check_type"
                                            />
                                            <label htmlFor="check_type1">폼메일(게시판)</label>
                                        </div>
                                        <div className="rdo_box1">
                                            <input type="radio" id="check_type2" className="blind"
                                                onChange={(e)=>{
                                                    const checked = e.currentTarget.checked;
                                                    onCheckChangeHandler(checked,"c_type",2);
                                                }}
                                                checked={info.c_type && info.c_type == 2 ? true : false}
                                                name="check_type"
                                            />
                                            <label htmlFor="check_type2">일반</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="form_box">
                            <div className="form_input">
                                <h6>파일 경로</h6>
                                <div className="input_wrap">
                                    <InputBox
                                        className="input_box" 
                                        type={`text`}
                                        placeholder={`파일 경로를 입력해주세요.`}
                                        value={info.file_path || ""}
                                        onChangeHandler={onInputChangeHandler}
                                        id={`file_path`}
                                    />
                                </div>
                            </div>
                            <div className="form_input">
                                <h6>관리자 파일 경로</h6>
                                <div className="input_wrap">
                                    <InputBox
                                        className="input_box" 
                                        type={`text`}
                                        placeholder={`파일 경로를 입력해주세요.`}
                                        value={info.admin_file_path || ""}
                                        onChangeHandler={onInputChangeHandler}
                                        id={`admin_file_path`}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="form_box">
                            <div className="form_input">
                                <h6>수신 문자</h6>
                                <div className="input_wrap">
                                    <InputBox
                                        className="input_box" 
                                        type={`text`}
                                        placeholder={`숫자만 입력해주세요.`}
                                        value={info.sms || ""}
                                        onChangeHandler={onInputChangeHandler}
                                        id={`sms`}
                                        phone={true}
                                    />
                                </div>
                            </div>
                            <div className="form_input">
                                <h6>수신 메일</h6>
                                <div className="input_wrap">
                                    <InputBox
                                        className="input_box" 
                                        type={`text`}
                                        placeholder={`ID@example.com`}
                                        value={info.email || ""}
                                        onChangeHandler={onInputChangeHandler}
                                        id={`email`}
                                    />
                                </div>
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

export default SubCategoryPopCont3;