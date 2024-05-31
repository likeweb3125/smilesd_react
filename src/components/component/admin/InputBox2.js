import { useEffect, useState } from "react";
import { NumericFormat, PatternFormat } from "react-number-format";


const InputBox2 = (props) => {

    return(
        <div className="input_box input_box2">
            {props.txt && <span>{props.txt}</span>}
            {props.numberOnly ? 
                <NumericFormat 
                    thousandSeparator="," 
                    decimalScale={0} 
                    allowNegative={false} // '-' 입력 막기
                    placeholder={props.placeholder}
                    value={props.value}
                    onChange={props.onChangeHandler}
                    id={props.id}
                    maxLength={props.countMax}
                    className={props.className}
                />
                :   props.phone ? 
                    <PatternFormat 
                        format="###-####-####"
                        placeholder={props.placeholder}
                        value={props.value}
                        onChange={props.onChangeHandler}
                        id={props.id}
                        maxLength={props.countMax}
                        className={props.className}
                    />
                :   <input type={props.type} 
                        placeholder={props.placeholder}
                        value={props.value}
                        onChange={props.onChangeHandler}
                        id={props.id}
                        maxLength={props.countMax}
                        className={props.className}
                    />
            }
        </div>

    );
};

export default InputBox2;