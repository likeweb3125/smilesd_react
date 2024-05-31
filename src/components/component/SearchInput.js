const SearchInput = (props) => {
    return(
        <div className="search_input">
            <div className="input_box">
                <input 
                    type="text" 
                    placeholder={props.placeholder}
                    onChange={props.onChangeHandler}
                    value={props.value}
                    onKeyDown={(e)=>{
                        if(e.key === "Enter") {
                            e.preventDefault();
                            props.onSearchHandler();
                        }
                    }}
                />
            </div>
            <button type="button" className="btn_search" onClick={props.onSearchHandler}>검색하기</button>
        </div>
    );
};

export default SearchInput;