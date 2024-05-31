import { useDispatch } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { scrollY } from "../../../store/commonSlice";
import { passwordCheckPop } from "../../../store/popupSlice";
import * as CF from "../../../config/function";
import ic_clip from "../../../images/ic_clip.svg";


const ListBoard = ({columnTitle, columnDate, columnView, columnFile, list}) => {
    const dispatch = useDispatch();
    const { menu_idx } = useParams();

    return(<>
        <ul className="list_board">
            {list && list.length > 0 ? 
                list.map((cont,i)=>{
                    return(
                        <li key={i}>
                            <div className="item_box">
                                <div className="item_txt">
                                    <div className="item_num">
                                        {cont.b_notice == 1 ? <em className="notice">공지</em>
                                            :   <span>{CF.MakeIntComma(cont.num)}</span>                          
                                        }
                                    </div>
                                    <div className="item_link">
                                        {columnTitle && <>
                                            <span onClick={()=>{dispatch(scrollY(window.scrollY))}}>
                                                {cont.b_secret == 'Y' ? 
                                                    <button type="button"
                                                        onClick={()=>{
                                                            dispatch(passwordCheckPop({passwordCheckPop:true, passwordCheckPopCate:menu_idx, passwordCheckPopIdx:cont.idx, passwordCheckPopMoveUrl:'/sub/board/detail/'}));
                                                        }}
                                                    >{cont.b_title}</button>
                                                    :<Link to={`/sub/board/detail/${cont.category}/${cont.idx}`}>{cont.b_title}</Link>
                                                }
                                            </span>
                                            {cont.b_secret == 'Y' && <i>잠금 게시물</i>}
                                            {cont.comment_count > 0 &&
                                                <b>{CF.MakeIntComma(cont.comment_count)}</b>
                                            }
                                        </>}
                                    </div>
                                </div>
                                <ul className="item_util">
                                    {columnFile &&
                                        <li className="item_file">
                                            <div className="ic">
                                                <img src={ic_clip} alt="file icon"/>
                                            </div>
                                        </li>
                                    }
                                    <li className="item_name">{cont.m_name}</li>
                                    {columnView && <li className="item_cnt">{CF.MakeIntComma(cont.b_view)}</li>}
                                    {columnDate && <li className="item_date">{cont.b_reg_date}</li>}
                                </ul>
                            </div>
                        </li>
                    );
                })
                : <div className="none_data">데이터가 없습니다.</div>
            }
        </ul>
    </>);
};

export default ListBoard;