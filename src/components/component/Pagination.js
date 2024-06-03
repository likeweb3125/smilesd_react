import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { pageNo, pageNoChange } from "../../store/etcSlice";

const Pagination = (props) => {
    const dispatch = useDispatch();
    const [pageList, setPageList] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const page = searchParams.get('page');

    useEffect(()=>{
        setPageList(pageList);
    },[pageList]);

    //페이지리스트 배열로 저장
    useEffect(()=>{
        let arr = [];
        for (let i = props.startPage; i <= props.endPage; i++) {
            arr.push(i);
            setPageList(arr);
        }
    },[props.currentPage]);
    
    //페이징번호 클릭시 리스트리스트 변경하기
    const movePage = (num) => {
        // dispatch(pageNo(num));
        // dispatch(pageNoChange(true));
        if(page){
            searchParams.set('page',num);
        }else{
            searchParams.append('page',num);
        }
        setSearchParams(searchParams);
    };

    //페이징 이전버튼 클릭시
    const prevPaging = () => {
        if(props.currentPage > 1){
            // dispatch(pageNo(props.currentPage - 1));
            // dispatch(pageNoChange(true));

            if(page){
                searchParams.set('page',props.currentPage - 1);
            }else{
                searchParams.append('page',props.currentPage - 1);
            }
            setSearchParams(searchParams);
        }
    };

    //페이징 다음버튼 클릭시
    const nextPaging = () => {
        if(props.currentPage < props.lastPage){
            // dispatch(pageNo(props.currentPage + 1));
            // dispatch(pageNoChange(true));

            if(page){
                searchParams.set('page',props.currentPage + 1);
            }else{
                searchParams.append('page',props.currentPage + 1);
            }
            setSearchParams(searchParams);
        }
    };

    return(
        <div className="paging">
            <button type='button' className="btn_prev btn_paging" onClick={prevPaging}>이전페이지</button>
            {props.endPage > 1 ?
                pageList && pageList.map((num,i)=>{
                    return(
                        <button type="button" key={i} 
                            className={props.currentPage === num ? "on" : ""}
                            onClick={()=>{movePage(num)}}
                        >{num}</button>
                    );
                })
                :props.endPage === 1 && <button type="button" className="on">1</button>
            }
            <button type='button' className="btn_next btn_paging" onClick={nextPaging}>다음페이지</button>
        </div>
    );
};

export default Pagination;