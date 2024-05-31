import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { scrollY } from "../../../store/commonSlice";
import * as CF from "../../../config/function";


const ListInquiry = ({columnTitle, columnDate, columnView, columnFile, columnGroup, list, onDetailToggleHandler, detailData, login, onDeltHandler, category}) => {
    const dispatch = useDispatch();
    const user = useSelector((state)=>state.user);
    const common = useSelector((state)=>state.common);
    const [detailOn, setDetailOn] = useState(false);


    useEffect(()=>{
        if(Object.keys(detailData).length > 0){
            setDetailOn(true);
        }else{
            setDetailOn(false);
        }
    },[detailData]);


    return(<>
        <ul className="list_board">
            {list && list.length > 0 ? 
                list.map((cont,i)=>{
                    //현재상세내용 보이는지 체크
                    let box = false;
                    if(Object.keys(detailData).length > 0 && detailData.idx === cont.idx){
                        box = true;
                    }

                    let liOn = false;
                    if(detailOn && detailData.idx === cont.idx){
                        liOn = true;
                    }

                    //글 수정/삭제 버튼 노출결정
                    let editBtnBox = false;

                    //로그인시
                    if(login){
                        if(user.loginUser.m_email == cont.m_email || common.secretPassCheckOk){
                            editBtnBox = true;
                        }
                    }
                    //미로그인시
                    else{
                        if(common.secretPassCheckOk){
                            editBtnBox = true;
                        }
                    }

                    console.log(editBtnBox);

                    return(
                        <li key={i}>
                            <div className="item_box">
                                <div className="item_txt">
                                    <div className="item_num">
                                        <em className={`answer_status${cont.g_status == '답변완료' ? ' txt_color1' : ''}`}>{cont.g_status}</em>
                                    </div>
                                    <div className="item_link">
                                        {columnTitle && <>
                                            <span>
                                                <button type="button"
                                                    onClick={()=>{
                                                        onDetailToggleHandler(cont.b_secret, cont.idx, box);
                                                    }}
                                                >{columnGroup && '['+cont.g_name+'] '}{cont.b_title}</button>
                                            </span>
                                            {cont.b_secret == 'Y' && <i>잠금 게시물</i>}
                                        </>}
                                    </div>
                                </div>
                                <ul className="item_util">
                                    <li className="item_name">{cont.m_name}</li>
                                    {columnView && <li className="item_cnt">{CF.MakeIntComma(cont.b_view)}</li>}
                                    {columnDate && <li className="item_date">{cont.b_reg_date}</li>}
                                </ul>
                            </div>
                            {liOn &&
                                <div className="answer_box">
                                    <div className="q_box">
                                        <div dangerouslySetInnerHTML={{__html:detailData.b_contents}}></div>
                                        {editBtnBox &&
                                            <div className="btn_util">
                                                <Link 
                                                    to={`/sub/inquiry/modify/${category}/${cont.idx}`} 
                                                    className="btn_type11"
                                                    onClick={()=>{dispatch(scrollY(window.scrollY))}}
                                                >수정</Link>
                                                <button type="button" className="btn_type12" onClick={()=>onDeltHandler(cont.idx)}>삭제</button>
                                            </div>
                                        }
                                    </div>
                                    {cont.g_status == '답변완료' &&
                                        <div className="a_box">
                                            <div className="answer_info">
                                                <b>답변</b>
                                                <span>담당자</span>
                                                {/* <span>2023.07.23</span> */}
                                            </div>
                                            <p>{detailData.b_reply}</p>
                                        </div>
                                    }
                                </div>
                            }
                        </li>
                    );
                })
                : <div className="none_data">데이터가 없습니다.</div>
            }
        </ul>
    </>);
};

export default ListInquiry;