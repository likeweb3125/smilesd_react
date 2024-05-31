import { useEffect, useState } from "react";


const SelectBox = (props) => {
    const [list, setList] = useState([]);

    useEffect(()=>{
        setList(props.list);
    },[props.list]);

    return(
        <div className={props.className}>
            <select 
                value={props.selected}
                onChange={props.onChangeHandler}
                name={props.name}
                required={props.required}
            >
                <option value="" hidden={props.selHidden}>{props.hiddenTxt ? props.hiddenTxt : "선택"}</option>
                {list && list.map((val,i)=>{
                    return(<option value={val} key={i}>{val}</option>);
                })}
            </select>
        </div>
    );
};

export default SelectBox;