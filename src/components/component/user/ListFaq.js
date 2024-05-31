import { useEffect, useState } from "react";


const ListFaq = ({columnGroup, list, onDetailToggleHandler, detailData}) => {
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

                    return(
                        <li key={i} className={liOn ? 'on' : ''}>
                            <div className="item_box"
                                onClick={()=>{
                                    onDetailToggleHandler(cont.idx, box);
                                }}
                            >
                                <div className="item_txt">
                                    <div className="item_num">
                                        {columnGroup && <em className="txt_category txt_color1">{cont.g_name}</em>}
                                    </div>
                                    <div className="item_link">
                                        <span>{cont.b_title}</span>
                                    </div>
                                </div>
                            </div>
                            {liOn &&
                                <div className="answer_box">
                                    <div className="a_box">
                                        <p>{detailData.b_contents}</p>
                                    </div>
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

export default ListFaq;