import { useEffect, useState } from "react";


const MenuListBox = (props) => {
    const [list, setList] = useState([]);
    const [liClasses, setLiClasses] = useState({});
    const [li2Classes, setLi2Classes] = useState({});
    const [unusedList, setUnusedList] = useState([]);
    const [unusedMenu, setUnusedMenu] = useState(0);
    const [unusedMenuOpen, setUnusedMenuOpen] = useState(false);

    const [menuOnId, setMenuOnId] = useState(null);
    const [unMenuOnId, setUnMenuOnId] = useState(null);


    // 메뉴 카테고리 리스트
    useEffect(()=>{
        setList(props.list);
    },[props.list]);


    //미사용 카테고리 리스트
    useEffect(()=>{
        setUnusedList(props.unusedList);
        console.log(props.unusedList)

        // 미사용카테고리 개수
        let num = 0;
        if(props.unusedList){
            num = props.unusedList.length;
        }
        setUnusedMenu(num);
    },[props.unusedList]);


    //1뎁스 메뉴토글버튼 클릭시
    const liFolderHandler = (index) => {
        // 버튼을 클릭하면 해당 인덱스의 liClasses 상태를 토글합니다.
        setLiClasses((prevClasses) => ({
            ...prevClasses,
            [index]: !prevClasses[index], // 토글
        }));
      
        // index-로 시작하는 모든 키를 false로 설정합니다.
        const updatedClasses = { ...li2Classes };
        for (let key in updatedClasses) {
            if (key.startsWith(`${index}-`)) {
                updatedClasses[key] = false;
            }
        }
      
        //변경된 li2Classes를 설정합니다.
        setLi2Classes(updatedClasses);
    };


    //2뎁스 메뉴토글버튼 클릭시
    const li2FolderHandler = (index) => {
        // 버튼을 클릭하면 해당 인덱스의 li2Classes 상태를 토글합니다.
        setLi2Classes((prevClasses) => ({
            ...prevClasses,
            [index]: !prevClasses[index], // 토글
        }));
    };



    return(<>
        {/* 메뉴 카테고리 */}
        <ul className="list_menu1">
            {list.map((cont,idx)=>{
                const isLiOn = liClasses[idx] ? 'on' : '';

                //하위카테고리 개수
                let num = 0;
                if(cont.submenu){
                    const submenu2 = cont.submenu.flatMap(item => item.submenu || []);
                    num = cont.submenu.length + submenu2.length;
                }
                return(
                    <li key={idx} className={isLiOn}>
                        <div className={`menu${menuOnId === cont.id ? " on" : ""}`} onClick={()=>setMenuOnId(cont.id)}>
                            <span>{cont.c_name}{num > 0 && "("+num+")"}</span>
                            <div className="btn_wrap">
                                {cont.submenu && <button type="button" className="btn_folder" onClick={() => liFolderHandler(idx)}>하위 카테고리 열고 닫기</button>}
                                <button type="button" className="btn_add">하위 카테고리 등록</button>
                            </div>
                        </div>
                        <ul className="list_menu2">
                            {cont.submenu && cont.submenu.map((depth2,i)=>{
                                const isLiOn = li2Classes[`${idx}-${i}`] ? 'on' : '';

                                return(
                                    <li key={i} className={isLiOn}>
                                        <div className={`menu${menuOnId === depth2.id ? " on" : ""}`} onClick={()=>setMenuOnId(depth2.id)}>
                                            <span>{depth2.c_name}</span>
                                            <div className="btn_wrap">
                                                {depth2.submenu && <button type="button" className="btn_folder" onClick={() => li2FolderHandler(`${idx}-${i}`)}>하위 카테고리 열고 닫기</button>}
                                                <button type="button" className="btn_add">하위 카테고리 등록</button>
                                            </div>
                                        </div>
                                        <ul className="list_menu3">
                                            {depth2.submenu && depth2.submenu.map((depth3,i)=>{
                                                return(
                                                    <li key={i}>
                                                        <div className={`menu${menuOnId === depth3.id ? " on" : ""}`} onClick={()=>setMenuOnId(depth3.id)}>
                                                            <span>{depth3.c_name}</span>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </li>
                                );
                            })}
                        </ul>
                    </li>
                );
            })}
        </ul>

        {/* 미사용 카테고리 */}
        <div className={`disable_menu_wrap${unusedMenuOpen ? " on" : ""}`}>
            <button type="button" 
                className="btn_disable_menu"
                onClick={()=>{setUnusedMenuOpen(!unusedMenuOpen)}}
            >미사용 카테고리{unusedMenu > 0 && "("+unusedMenu+")"}</button>
            <div className="disable_menu">
                {unusedMenu > 0 ?
                    <ul className="list_disable_menu">
                        {unusedList.map((cont,i)=>{
                            return(
                                <li key={i}>
                                    <div className={`menu ${cont.c_depth == 1 ? ' menu1' : ' menu2'}${unMenuOnId === cont.id ? " on" : ""}`} onClick={()=>setUnMenuOnId(cont.id)}>
                                        <span>{cont.c_name}</span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                    : <div className="none_category">카테고리가 없습니다.</div>
                }
            </div>
            
        </div>
    </>);
};

export default MenuListBox;