import DatePicker from "react-datepicker";
import { registerLocale } from  "react-datepicker";
import ko from 'date-fns/locale/ko';
import "react-datepicker/dist/react-datepicker.css";


const InputDatepicker = (props) => {
    registerLocale('ko', ko);


    return (
        <div className="date_input">
            <span>{props.txt}</span>
            <DatePicker
                selected={props.selectedDate}
                onChange={props.ChangeHandler}
                locale="ko"
                dateFormat="yyyy.MM.dd"
                // dateFormat="yyyy.MM.dd hh:mm"
                // showTimeInput
                minDate={props.minDate}
                maxDate={props.maxDate}
            />
        </div>
    );
};

export default InputDatepicker;
