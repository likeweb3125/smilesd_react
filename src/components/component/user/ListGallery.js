import { Link } from "react-router-dom";
import * as CF from "../../../config/function";
import { enum_api_uri } from "../../../config/enum";
import ic_clip from "../../../images/ic_clip.svg";


const ListGallery = ({columnTitle, columnDate, columnView, columnFile, list}) => {  
    const api_uri = enum_api_uri.api_uri;

    return(<>
        {list && list.length > 0 ? 
            <ul className="list_gallery">
                {list.map((cont,i)=>{
                    return(
                        <li key={i}>
                            <Link to={`/sub/board/detail/${cont.category}/${cont.idx}`}>
                                <div className="img">
                                    <img src={api_uri+'/'+cont.b_img} alt="image" />
                                </div>
                                {columnTitle && 
                                    <div className="txt">
                                        <strong>{cont.b_title}</strong>
                                    </div>
                                }
                                <ul className="item_util flex_wrap flex_end">
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
                            </Link>
                        </li>
                        );
                    })
                }
            </ul>
            : <div className="none_data">데이터가 없습니다.</div>
        }
    </>);
};

export default ListGallery;