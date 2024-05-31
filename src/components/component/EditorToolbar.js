import React, { useMemo } from "react";
import { Quill } from "react-quill";
import ImageResize from 'quill-image-resize';

Quill.register('modules/ImageResize', ImageResize);


// Add sizes to whitelist and register them
const Size = Quill.import("attributors/style/size");
Size.whitelist = ['12px', '14px', '16px', '18px', '20px', '22px', '24px', '26px', '28px', '30px'];
Quill.register(Size, true);

// Add fonts to whitelist and register them
const Font = Quill.import("formats/font");
Font.whitelist = [
    "arial",
    "comic-sans",
    "courier-new",
    "georgia",
    "helvetica",
    "lucida"
];
Quill.register(Font, true);


// Quill Toolbar component
export const QuillToolbar = (props) => (
    <div id="toolbar">
        <span className="ql-formats">
            <select className="ql-size" defaultValue="16px">
                <option value="12px">12px</option>
                <option value="14px">14px</option>
                <option value="16px">16px</option>
                <option value="18px">18px</option>
                <option value="20px">20px</option>
                <option value="22px">22px</option>
                <option value="24px">24px</option>
                <option value="26px">26px</option>
                <option value="28px">28px</option>
                <option value="30px">30px</option>
            </select>
        </span>
        <span className="ql-formats">
            <button className="ql-bold" />
            <button className="ql-italic" />
            <button className="ql-underline" />
            <button className="ql-strike" />
        </span>
        <span className="ql-formats">
            <button className="ql-list" value="ordered" />
            <button className="ql-list" value="bullet" />
            <button className="ql-indent" value="-1" />
            <button className="ql-indent" value="+1" />
        </span>
        <span className="ql-formats">
            <select className="ql-align" />
            <select className="ql-color" />
            <select className="ql-background" />
        </span>
        <span className="ql-formats">
            <button className="ql-link" />
            <button className="ql-image" />
            <button className="ql-video" />
        </span>
        <span className="ql-formats">
            <button className={`btn_html${props.btnHtmlOn ? " on" : ""}`} onClick={props.onClickRaw}>HTML</button>
        </span>
    </div>
);

export default QuillToolbar;