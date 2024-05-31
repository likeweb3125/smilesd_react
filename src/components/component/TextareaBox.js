const TextareaBox = (props) => {
    return(
        <div className="textarea_box">
            <textarea 
                cols={props.cols} 
                rows={props.rows}
                placeholder={props.placeholder}
                value={props.value}
                onChange={props.onChangeHandler}
                maxLength={props.countMax}
                id={props.id}
            ></textarea>
            {props.countShow && <span className="char_cnt">{`${props.count}/${props.countMax}`}</span>}
        </div>
    );
};

export default TextareaBox;