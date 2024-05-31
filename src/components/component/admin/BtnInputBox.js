
const BtnInputBox = (props) => {

    return(
        <div className={`input_box button_input${props.on ? ' on' : ''}`}>
            <input type={props.type} 
                placeholder={props.placeholder}
                value={props.value}
                onChange={props.onChangeHandler}
                id={props.id}
                maxLength={props.countMax}
                className={props.className}
                disabled={props.disabled}
            />
            <button type="button" onClick={props.onClickHandler}>{props.btnTxt}</button>
        </div>

    );
};

export default BtnInputBox;