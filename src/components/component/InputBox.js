import { useEffect, useState } from "react";
import { NumericFormat, PatternFormat } from "react-number-format";


const InputBox = (props) => {

    return(
        <div className={props.className}>
            {props.countShow && <span className="char_cnt">{`${props.count}/${props.countMax}`}</span>}
            {props.numberOnly ? 
                <NumericFormat 
                    thousandSeparator={props.thousandSeparator} 
                    decimalScale={props.decimalScale} 
                    placeholder={props.placeholder}
                    value={props.value}
                    onChange={props.onChangeHandler}
                    id={props.id}
                    maxLength={props.countMax}
                    className={props.inputClassName}
                    disabled={props.disabled}
                    name={props.name}
                />
                :   props.phone ? 
                    <PatternFormat 
                        format='###-####-####'
                        placeholder={props.placeholder}
                        value={props.value}
                        onChange={props.onChangeHandler}
                        id={props.id}
                        maxLength={props.countMax}
                        className={props.inputClassName}
                        disabled={props.disabled}
                        name={props.name}
                    />
                :   <input 
                        type={props.type} 
                        placeholder={props.placeholder}
                        value={props.value}
                        onChange={props.onChangeHandler}
                        id={props.id}
                        maxLength={props.countMax}
                        className={props.inputClassName}
                        disabled={props.disabled}
                        onKeyDown={props.onKeyDownHandler}
                        name={props.name}
                    />
            }
            {props.password && <button type="button" className="view_pwd" onClick={props.passwordBtnClickHandler}>비밀번호 보기</button>}
        </div>

    );
};

export default InputBox;