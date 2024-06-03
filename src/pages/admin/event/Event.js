import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDropzone } from 'react-dropzone';
import axios from "axios";
import { enum_api_uri } from "../../../config/enum";
import * as CF from "../../../config/function";
import { confirmPop } from "../../../store/popupSlice";
import { pageNoChange, checkedList } from "../../../store/etcSlice";
import SelectBox from "../../../components/component/SelectBox";
import SearchInput from "../../../components/component/SearchInput";
import TableWrap from "../../../components/component/admin/TableWrap";
import ConfirmPop from "../../../components/popup/ConfirmPop";
import Pagination from "../../../components/component/Pagination";
import qs from "qs"



const Event = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const popup = useSelector((state)=>state.popup);
    const user = useSelector((state)=>state.user);
    const etc = useSelector((state)=>state.etc);
    const event_list = enum_api_uri.event_list;
    const event_ex = enum_api_uri.event_ex;
    const [confirm, setConfirm] = useState(false);
    const [boardData, setBoardData] = useState({});
    const [list, setList] = useState([]);
    const [file, setFile] = useState('');
    const [fileData, setFileData] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get('search');
    const page = searchParams.get('page');
    const [searchTxt, setSearchTxt] = useState('');



    // Confirm팝업 닫힐때
    useEffect(()=>{
        if(popup.confirmPop === false){
            setConfirm(false);
        }
    },[popup.confirmPop]);



    //주문내역 가져오기
    const getList = () => {
        const body = {
            getPage: page ? page : 1,
            listSize: 10,
            sKey: '',
            sWord: ''
        };
        const queryString = qs.stringify(body);
        axios.get(`${event_list}?${queryString}`, {
            headers: { Authorization: `Bearer ${user.loginUser.accessToken}` }
        })
        .then((res)=>{
            if(res.status === 200){
                const data = res.data.data;
                const list = data.event_list;
                setBoardData({...data});
                setList([...list]);

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


    //주문내역 가져오기
    // useEffect(()=>{
    //     getList();
    //     if(search){
    //         setSearchTxt(search);
    //     }
    // },[search]);


    useEffect(()=>{
        getList();
    },[page]);


    //검색하기버튼 클릭시
    const onSearchHandler = () => {
        if(searchTxt.length > 0){
            if(search){
                searchParams.set('search',searchTxt);
            }else{
                searchParams.append('search',searchTxt);
            }
        }else{
            searchParams.delete('search');
        }
        setSearchParams(searchParams);
    };



    //엑셀다운 버튼 클릭시
    const exDownBtnClickHandler = () => {
        const body = {
            sKey: '',
            sWord: ''
        };
        const queryString = qs.stringify(body);
        axios.get(`${event_ex}?${queryString}`, {
            responseType: 'blob', // 바이너리 데이터로 응답을 처리합니다
            headers: { Authorization: `Bearer ${user.loginUser.accessToken}` }
        })
        .then((res)=>{
            if(res.status === 200){
                // 응답으로 받은 데이터를 Blob 객체로 변환합니다
                // const blob = new Blob([res.data], {
                //     type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                // });

                // // Blob 객체를 다운로드 링크로 변환합니다
                // const url = URL.createObjectURL(blob);

                // // 가상의 <a> 태그를 생성하여 다운로드를 트리거합니다
                // const a = document.createElement('a');
                // a.href = url;
                // a.download = 'filename.xlsx'; // 다운로드할 파일 이름을 지정합니다
                // document.body.appendChild(a);
                // a.click();

                // // 다운로드 링크를 정리합니다
                // URL.revokeObjectURL(url);
                // document.body.removeChild(a);
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


    return(<>
        <div className="page_admin_order">
            <div className="content_box">
                {/* <div className="flex_end">
                    <div className="search_box">
                        <SearchInput 
                            placeholder="검색어를 입력해주세요."
                            onChangeHandler={(e)=>{
                                const val = e.currentTarget.value;
                                setSearchTxt(val);
                            }}
                            value={searchTxt}
                            onSearchHandler={onSearchHandler}
                        />
                    </div>
                </div> */}
                <div className="flex_end">
                    <button type="button" className="btn_type2" onClick={exDownBtnClickHandler}>엑셀다운로드</button>
                </div>
                <div className="board_section">
                    <div className="scroll_wrap_x">
                        <TableWrap 
                            className="tbl_wrap1 tbl_wrap1_1"
                            colgroup={["auto","auto","auto","auto"]}
                            thList={["회사명","직책","이름","날짜"]}
                            tdList={list}
                            type={"event_list"}
                        />
                    </div>
                    {boardData.event_list && boardData.event_list.length > 0 &&
                        <Pagination 
                            currentPage={boardData.current_page} //현재페이지 번호
                            startPage={boardData.start_page} //시작페이지 번호 
                            endPage={boardData.end_page} //보이는 끝페이지 번호 
                            lastPage={boardData.last_page} //총페이지 끝
                        />
                    }
                </div>
            </div>
        </div>

        {/* confirm팝업 */}
        {confirm && <ConfirmPop />}
    </>);
};

export default Event;