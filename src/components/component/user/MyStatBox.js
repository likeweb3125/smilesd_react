import * as CF from "../../../config/function";

const MyStatBox = ({boardCnt, commentCnt, qnaCnt}) => {
    return(<>
        <ul className="stat_box">
            <li>
                <strong>{CF.MakeIntComma(boardCnt)}</strong>
                <span>작성글</span>
            </li>
            <li>
                <strong>{CF.MakeIntComma(commentCnt)}</strong>
                <span>작성댓글</span>
            </li>
            <li>
                <strong>{CF.MakeIntComma(qnaCnt)}</strong>
                <span>작성 문의글</span>
            </li>
        </ul>
    </>);
};

export default MyStatBox;