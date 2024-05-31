import React,{ useEffect, useState, forwardRef } from "react";
import {
    SimpleTreeItemWrapper,
    SortableTree,
} from "dnd-kit-sortable-tree";

const TreeItem = forwardRef((props, ref) => {
    const { isOff, onClickHandler, ...rest } = props;
    return (
        <SimpleTreeItemWrapper {...rest} ref={ref} 
            className={`${props.item.depth > 0 ? "menu_" + props.item.depth : "menu"} ${!props.item.children || props.item.children.length === 0 || isOff ? "off" : ""}`}
            onClick={onClickHandler}
        >
            <div className="txt">{props.item.value}</div>
        </SimpleTreeItemWrapper>
    );
});

const Test = () => {
    const [items, setItems] = useState([
        {
            id: 1,
            depth: 0,
            value: "About Us",
            canHaveChildren: (dragItem) => {
                return dragItem.id !== 2 && dragItem.id !== 3;
            },
            children: [
                { id: 4, depth: 1, value: "회사소개 2depth", 
                    canHaveChildren: (dragItem) => {
                        return dragItem.id !== 2 && dragItem.id !== 3;
                    },
                    children: [{ id: 7, depth: 2, value: "회사소개 3depth", canHaveChildren: false }] 
                },
                { id: 5, depth: 1, value: "회사비전 2depth",
                    canHaveChildren: (dragItem) => {
                        return dragItem.id !== 2 && dragItem.id !== 3 && dragItem.id !== 4;
                    },
                },
            ],
        },
        { id: 2, depth: 0, value: "Service", 
            canHaveChildren: (dragItem) => {
                return dragItem.id !== 1 && dragItem.id !== 3;
            },
            children: [{ id: 6, depth: 1, value: "서비스 2depth" ,
                canHaveChildren: (dragItem) => {
                    return dragItem.id !== 1 && dragItem.id !== 3 && dragItem.id !== 4;
                },
            }] 
        },
        { id: 3, depth: 0, value: "Board",
            canHaveChildren: (dragItem) => {
                return dragItem.id !== 1 && dragItem.id !== 2;
            },
        },
    ]);
    // const [items, setItems] = useState([
    //     {
    //         id: 1,
    //         depth: 0,
    //         value: "About Us",
    //         children: [
    //             { id: 4, depth: 1, value: "회사소개 2depth", 
    //                 children: [{ id: 7, depth: 2, value: "회사소개 3depth"}] 
    //             },
    //             { id: 5, depth: 1, value: "회사비전 2depth"},
    //         ],
    //     },
    //     { id: 2, depth: 0, value: "Service", 
    //         children: [{ id: 6, depth: 1, value: "서비스 2depth"}] 
    //     },
    //     { id: 3, depth: 0, value: "Board",
    //     },
    // ]);

    const [newItems, setNewItems] = useState([]);




    const [liClasses, setLiClasses] = useState({});


    const handleItemClick = (data) => {
        const id = data.item.id;
        const isLast = data.isLast;

        console.log(data);

        if(data.item.children && data.item.children.length > 0){
            setLiClasses((prevClasses) => ({
                ...prevClasses,
                [id]: !liClasses[id], // 토글
            }));
        }
    };

    useEffect(() => {
        // const extractIds = (item) => {
        //     const ids = [item.id];
        //     if (item.children) {
        //         item.children.forEach(child => {
        //             ids.push(...extractIds(child));
        //         });
        //     }
        //     return ids;
        // };
          
        // const topLevelIds = items.map(item => item.id);
          
        // const secondLevelIds = items.reduce((acc, item) => {
        //     if (item.children) {
        //         item.children.forEach(child => {
        //             acc.push(child.id);
        //         });
        //     }
        //     return acc;
        // }, []);
          
        // const thirdLevelIds = items.reduce((acc, item) => {
        //     if (item.children) {
        //         item.children.forEach(child => {
        //             if (child.children) {
        //                 acc.push(...extractIds(child.children[0]));
        //             }
        //         });
        //     }
        //     return acc;
        // }, []);
          
        // console.log("Top Level IDs:", topLevelIds);
        // console.log("Second Level IDs:", secondLevelIds);
        // console.log("Third Level IDs:", thirdLevelIds);

          
        // const updatedItems = items.map(item => {
        //     const depthZeroIds = items
        //     .filter(i => i.depth === 0 && i.id !== item.id)
        //     .map(i => i.id);
        
        //     const depthOneParentId = item.depth === 1
        //     ? items.find(i => i.depth === 1 && i.children && i.children.some(child => child.id === item.id)).id
        //     : null;
        
        //     const depthOneIds = items
        //     .filter(i => i.depth === 1 && i.id !== item.id && (!i.children || i.children.length === 0))
        //     .map(i => i.id);
        
        //     const canHaveChildren = (dragItem) => {
        //         if (item.depth === 0) {
        //             return !depthZeroIds.includes(dragItem.id);
        //         } else if (item.depth === 1) {
        //             return dragItem.id !== depthOneParentId && !depthOneIds.includes(dragItem.id);
        //         } else {
        //             return false; // depth가 2일 때는 항상 false
        //         }
        //     };
        
        //     const updateChildren = children => children.map(child => ({
        //         ...child,
        //         canHaveChildren: child.depth === 2 ? false : canHaveChildren(child),
        //         children: child.children ? updateChildren(child.children) : undefined,
        //     }));
        
        //     return {
        //         ...item,
        //         canHaveChildren,
        //         children: item.children ? updateChildren(item.children) : undefined,
        //     };
        // });

        // setNewItems(updatedItems);
        console.log(items);
    }, [items]);


    // const handleItemsChanged = changedItems => {
    //     console.log(changedItems);

    //     const extractIds = (item) => {
    //         const ids = [item.id];
    //         if (item.children) {
    //             item.children.forEach(child => {
    //                 ids.push(...extractIds(child));
    //             });
    //         }
    //         return ids;
    //     };
          
    //     const topLevelIds = items.map(item => item.id);
          
    //     const secondLevelIds = items.reduce((acc, item) => {
    //         if (item.children) {
    //             item.children.forEach(child => {
    //                 acc.push(child.id);
    //             });
    //         }
    //         return acc;
    //     }, []);
          
    //     const thirdLevelIds = items.reduce((acc, item) => {
    //         if (item.children) {
    //             item.children.forEach(child => {
    //                 if (child.children) {
    //                     acc.push(...extractIds(child.children[0]));
    //                 }
    //             });
    //         }
    //         return acc;
    //     }, []);
          
    //     // console.log("Top Level IDs:", topLevelIds);
    //     // console.log("Second Level IDs:", secondLevelIds);
    //     // console.log("Third Level IDs:", thirdLevelIds);

          
    //     // const updatedItems = changedItems.map(item => {
    //     //     const depthZeroIds = changedItems
    //     //     .filter(i => topLevelIds.includes(i.id) && i.id !== item.id)
    //     //     .map(i => i.id);
        
    //     //     const depthOneParentId = secondLevelIds.includes(item.id)
    //     //     ? changedItems.find(i => topLevelIds.includes(i.id) && i.children && i.children.some(child => child.id === item.id)).id
    //     //     : null;
        
    //     //     const depthOneIds = changedItems
    //     //     .filter(i => secondLevelIds.includes(i.id) && i.id !== item.id && (!i.children || i.children.length === 0))
    //     //     .map(i => i.id);
        
    //     //     const canHaveChildren = (dragItem) => {
    //     //         if (topLevelIds.includes(item.id)) {
    //     //             return !depthZeroIds.includes(dragItem.id);
    //     //         } else if (secondLevelIds.includes(item.id)) {
    //     //             return dragItem.id !== depthOneParentId && !depthOneIds.includes(dragItem.id);
    //     //         } else {
    //     //             return false; // depth가 2일 때는 항상 false
    //     //         }
    //     //     };
        
    //     //     const updateChildren = children => children.map(child => ({
    //     //         ...child,
    //     //         canHaveChildren: thirdLevelIds.includes(child.id) ? false : canHaveChildren(child),
    //     //         children: child.children ? updateChildren(child.children) : undefined,
    //     //     }));
        
    //     //     return {
    //     //         ...item,
    //     //         canHaveChildren,
    //     //         children: item.children ? updateChildren(item.children) : undefined,
    //     //     };
    //     // });

    //     setItems(changedItems);
    //     console.log(changedItems);
    // };


    useEffect(()=>{
        console.log(newItems);
    },[newItems]);


    return(<>
        <div className="menu_list_box">
            <ul className="list_menu">
                <SortableTree
                    items={items}
                    onItemsChanged={setItems}
                    TreeItemComponent={forwardRef((props, ref) => (
                        <TreeItem
                            {...props}
                            ref={ref}
                            isOff={liClasses[props.item.id] ? true : false}
                            onClickHandler={() => handleItemClick(props)}
                        />
                    ))}
                    dropAnimation={null}
                    keepGhostInPlace={true}
                />
            </ul>
        </div>
    </>);
};

export default Test;