import { useEffect, useState } from "react";
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

const UnusedMenu = (props) => {
    const [data, setData] = useState({});
    const [unusedMenu, setUnusedMenu] = useState(0);
    const [unusedMenuOn, setUnusedMenuOn] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        isSorting,
    } = useSortable({id: props.id});
    
    const style = {
        transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
        transition: isSorting ? transition : undefined,
        zIndex: isDragging ? '100' : undefined,
    };

    
    useEffect(()=>{
        setData(props.data);
        // console.log(props.data)
    },[props.data]);
    
    


    return(
        <li style={style} className={`disable_menu_wrap${unusedMenuOn ? " on" : ""}`}>
            <button type="button" 
                className="btn_disable_menu"
                onClick={()=>{setUnusedMenuOn(!unusedMenuOn)}}
            >미사용 카테고리{unusedMenu > 0 && "("+unusedMenu+")"}</button>
            <div className="disable_menu">
                {unusedMenu > 0 ?
                    <ul className="list_disable_menu">
                        {data[0].list.map((cont,i)=>{
                            return(
                                <li key={i}>
                                    <div className="menu menu1">
                                        <span>{cont.name}</span>
                                        <div className="btn_wrap">
                                            <button type="button" className="btn_move">카테고리 이동</button>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                        {data[1].list.map((cont,i)=>{
                            return(
                                <li key={i}>
                                    <div className="menu menu2">
                                        <span>{cont.name}</span>
                                        <div className="btn_wrap">
                                            <button type="button" className="btn_move">카테고리 이동</button>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                    : <div className="none_category">카테고리가 없습니다.</div>
                }
            </div>
        </li>
    );
};

export default UnusedMenu;