import React, { useMemo } from "react";
import ReactQuill,{ Quill } from "react-quill";
import EditorToolbar from "./EditorToolbar";
import "react-quill/dist/quill.snow.css";
import ImageResize from 'quill-image-resize';

// Quill.register('modules/ImageResize', ImageResize);


export const Editor = (props) => {
    const modules = useMemo(() => {
        return {
            toolbar: {
                container: "#toolbar",
            },
            history: {
                delay: 500,
                maxStack: 100,
                userOnly: true,
            },
            ImageResize: {
                parchment: Quill.import('parchment'),
            },
        };
    }, []);
      
    const formats = [
        'header',
        'font',
        'size',
        'bold',
        'italic',
        'underline',
        'align',
        'strike',
        'script',
        'blockquote',
        'background',
        'list',
        'bullet',
        'indent',
        'link',
        'image',
        'color',
    ];

    return (<>
        <EditorToolbar 
            onClickRaw={props.onClickRaw}
            btnHtmlOn={props.btnHtmlOn}
        />
        <ReactQuill
            theme="snow"
            value={props.value}
            onChange={props.onChangeHandler}
            // placeholder={"Write something awesome..."}
            modules={modules}
            formats={formats}
        />
        
    </>);
};

export default Editor;