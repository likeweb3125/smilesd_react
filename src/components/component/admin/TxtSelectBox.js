import { useEffect, useState } from "react";


const TxtSelectBox = (props) => {
    const [list, setList] = useState([]);

    useEffect(()=>{
        setList(props.list);
    },[props.list]);


    return(
        <div className={props.className}>
            <div className={`txt_select${props.hiddenTxt && !props.selected ? ' none' : ''}`}>
                {props.limitSel ?
                    <span>{props.selected ? props.selected+"개씩" : "선택"}</span>
                    :<span>{props.selected ? props.selected : props.hiddenTxt ? props.hiddenTxt : "선택"}</span>
                }
                {props.objectSel === "level_list" && //회원등급 리스트일때 
                    props.selectedLevel !== null && (<em>{"lv."+props.selectedLevel}</em>)
                }
            </div>
            <select 
                value={props.selected}
                onChange={props.onChangeHandler}
                name={props.name}
            >
                <option value="" hidden={props.selHidden}>{props.hiddenTxt ? props.hiddenTxt : "선택"}</option>
                {list && list.map((val,i)=>{
                    return(
                        props.objectSel === "board_title" ? //게시판관리 - 게시글들 제목일때
                            <option value={val.c_name} key={i} data-category={val.category}>{val.c_name}</option>
                        :   props.objectSel === "level_list" ? //회원등급 리스트일때
                            <option value={val.l_name} key={i} data-level={val.l_level}>{val.l_name}</option>
                        :   
                            <option value={val} key={i}>{val}{props.limitSel && "개씩"}</option>
                    );
                })}
            </select>
        </div>
    );
};

export default TxtSelectBox;