import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import { enum_api_uri } from '../../../config/enum';
import * as CF from "../../../config/function";
import { adminBannerPop, adminSubCategoryPop } from '../../../store/popupSlice';


const DndTr = ({order, data, id, onCheckHandler, colgroup, popType, type, unMenu, menuDepth, onMappingHandler, onMenuClickHandler}) => {
    const etc = useSelector((state)=>state.etc);
    const dispatch = useDispatch();
    const api_uri = enum_api_uri.api_uri;
    
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        isSorting
    // } = useSortable({id: id});
    } = useSortable({
        id: id,
        data:{...data,order: order}
    });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition: isSorting ? transition : undefined,
        zIndex: isDragging ? '100' : undefined,
        background: '#fff'
    };



    return(
        <td
            style={style} 
            ref={setNodeRef} 
            colSpan={7}
        >   
            {type === 'banner' ? //디자인관리 - 메인배너관리 일때
                <div className='flex'>
                    <div style={{'width':colgroup[0]}}>
                        <div className="chk_box2">
                            <input type="checkbox" id={`check_${data.idx}`} className="blind"
                                value={data.idx}
                                onChange={(e) => {
                                    const isChecked = e.currentTarget.checked;
                                    const value = e.currentTarget.value;
                                    onCheckHandler(isChecked, value);
                                }}
                                checked={etc.checkedList.includes(data.idx)}
                            />
                            <label htmlFor={`check_${data.idx}`}>선택</label>
                        </div>
                    </div>
                    <div style={{'width':colgroup[1]}}>
                        <div className="img_box">
                            {data.b_c_type == '1' ? <img src={api_uri+data.b_file} alt="썸네일이미지" />
                                : data.b_c_type == '2' && <video src={api_uri+data.b_file} />
                            }
                        </div>
                    </div>
                    <div style={{'width':colgroup[2]}}>
                        <button type="button" className="link" 
                            onClick={()=>{
                                dispatch(adminBannerPop({adminBannerPop:true,adminBannerPopIdx:data.idx,adminBannerPopType:popType}));
                            }}>{data.b_title}</button>
                    </div>
                    <div style={{'width':colgroup[3]}}>{data.b_s_date}{data.b_e_date && " ~ "+data.b_e_date}</div>
                    <div style={{'width':colgroup[4]}}>커버</div>
                    <div style={{'width':colgroup[5]}}>
                        <em className={data.b_open[0] == "Y" ? "txt_color1" : "txt_color2"}>{data.b_open[1]}</em>
                    </div>
                    <div style={{'width':colgroup[6]}}><button type="button" className="btn_move" {...attributes} {...listeners}>카테고리 이동</button></div>
                </div>

                :type === 'menu' && menuDepth !== 1 ? //메뉴관리 - 카테고리관리 - 하위카테고리일때
                <div className='flex'>
                    <div style={{'width':colgroup[0]}}>
                        <div className="chk_box2">
                            <input type="checkbox" id={`check_${data.id}`} className="blind"
                                value={data.id}
                                onChange={(e) => {
                                    const isChecked = e.currentTarget.checked;
                                    const value = e.currentTarget.value;
                                    onCheckHandler(isChecked, value);
                                }}
                                checked={unMenu ? etc.unMenuCheckList.includes(data.id) : etc.menuCheckList.includes(data.id)}
                            />
                            <label htmlFor={`check_${data.id}`}>선택</label>
                        </div>
                    </div>
                    {/* <div style={{'width':colgroup[1]}}>{data.c_num}</div> */}
                    <div style={{'width':colgroup[1]}}>{order}</div>
                    <div style={{'width':colgroup[2]}}>
                        <button type='button' className='link'
                            onClick={()=>{
                                if(unMenu){//미설정목록일때
                                    dispatch(adminSubCategoryPop({adminSubCategoryPop:true, adminSubCategoryPopIdx:data.id}));
                                }else{
                                    onMenuClickHandler(data.id);
                                }
                            }}
                        >{data.c_name}</button>
                    </div>
                    <div style={{'width':colgroup[3]}}>{data.submenu ? CF.MakeIntComma(data.submenu.length) : '-'}</div>
                    <div style={{'width':colgroup[4]}}>
                        {data.c_content_type ?
                        data.c_content_type[0] == 1 ? 'HTML' : data.c_content_type[0] == 2 ? '빈 메뉴' : data.c_content_type[0] == 3 ? '고객맞춤' : data.c_content_type[0] == 4 ? '일반' : data.c_content_type[0] == 5 ? '갤러리' : data.c_content_type[0] == 6 ? 'FAQ' : data.c_content_type[0] == 7 && '문의'
                        : ''}
                    </div>
                    <div style={{'width':colgroup[5]}}>
                        {unMenu ? //미설정목록일때
                            <button type='button' className='btn_type8'
                                onClick={()=>{
                                    onMappingHandler('Y', data.c_depth_parent, data.id);
                                }}
                            >매핑</button> 
                            :
                            <button type='button' className='btn_type10'
                                onClick={()=>{
                                    onMappingHandler('N', data.c_depth_parent, data.id);
                                }}
                            >해제</button>
                        }
                    </div>
                    <div style={{'width':colgroup[6]}}><button type="button" className="btn_move" {...attributes} {...listeners}>카테고리 이동</button></div>
                </div>

                :type === 'menu' && menuDepth === 1 && //메뉴관리 - 카테고리관리 - 1차카테고리일때 (1차카테고리관리팝업)
                <div className='flex'>
                    <div style={{'width':colgroup[0]}}>
                        <div className="chk_box2">
                            <input type="checkbox" id={`menu_check_${data.id}`} className="blind"
                                value={data.id}
                                onChange={(e) => {
                                    const isChecked = e.currentTarget.checked;
                                    const value = e.currentTarget.value;
                                    onCheckHandler(isChecked, value);
                                }}
                                checked={etc.checkedList.includes(data.id)}
                            />
                            <label htmlFor={`menu_check_${data.id}`}>선택</label>
                        </div>
                    </div>
                    {/* <div style={{'width':colgroup[1]}}>{data.c_num}</div> */}
                    <div style={{'width':colgroup[1]}}>{order}</div>
                    <div style={{'width':colgroup[2]}}>{data.c_name}</div>
                    <div style={{'width':colgroup[3]}}>{data.submenu ? CF.MakeIntComma(data.submenu.length) : '-'}</div>
                    <div style={{'width':colgroup[4]}}><button type="button" className="btn_move" {...attributes} {...listeners}>카테고리 이동</button></div>
                </div>
            }
        </td>
    );
};

export default DndTr;