import { useDispatch, useSelector } from 'react-redux';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import { adminBoardGroupPopMenuOn } from '../../../store/popupSlice';


const BoardGroupMenu = (props) => {
    const dispatch = useDispatch();
    const popup = useSelector((state)=>state.popup);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        isSorting
    } = useSortable({
        id: props.id,
        data:{...props.data}
    });
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition: isSorting ? transition : undefined,
        zIndex: isDragging ? '100' : undefined,
    };

    return(
        <li
            style={style} 
            ref={setNodeRef} 
            className={popup.adminBoardGroupPopMenuOn === props.id ? "on" : ""}
            onClick={()=>{
                dispatch(adminBoardGroupPopMenuOn(props.id));
            }}
        >
            <div className="menu">
                <span>{props.data.g_name}</span>
                <div className="btn_wrap">
                    <button type="button" className="btn_move" {...attributes} {...listeners}>카테고리 이동</button>
                </div>
            </div>
        </li>
    );
};

export default BoardGroupMenu;