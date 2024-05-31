import TextareaBox from "../TextareaBox";


const SmsTxtBox = (props) => {
    return(<>
        <TextareaBox 
            cols={props.cols}
            rows={props.rows}
            placeholder={props.placeholder}
            countShow={props.countShow}
            countMax={props.countMax}
            count={props.count}
            value={props.value}
            onChangeHandler={props.onChangeHandler}
        />
        <div className="btn_preset_util">
            <button type="button" className="btn_type16" onClick={props.onApplyHandler}>적용</button>
            <button type="button" className="btn_type8" onClick={props.onSaveHandler}>저장</button>
        </div>
    </>);
};

export default SmsTxtBox;