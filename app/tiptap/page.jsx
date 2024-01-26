"use client"

import './styles.css'

import { Color } from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import TextStyle from '@tiptap/extension-text-style'
import { EditorProvider, useCurrentEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useState } from 'react';
import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun, UnderlineType } from "docx";
import { saveAs } from 'file-saver';
import jsPDF from "jspdf";
import { parse } from 'node-html-parser';

//converting html to markdown

// define your extension array
const MenuBar = () => {
    const { editor } = useCurrentEditor()
    MenuBar.displayName = "MenuBar"
  
    if (!editor) {
      return null
    }
  
    return (
      <>
      <div className='menuBar'>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleBold()
              .run()
          }
          className={editor.isActive('bold') ? 'is-active' : ''}
        >
          bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleItalic()
              .run()
          }
          className={editor.isActive('italic') ? 'is-active' : ''}
        >
          italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .toggleCode()
              .run()
          }
          className={editor.isActive('code') ? 'is-active' : ''}
        >
          code
        </button>
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={editor.isActive('paragraph') ? 'is-active' : ''}
        >
          paragraph
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
        >
          h1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
        >
          h2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
        >
          h3
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={editor.isActive('heading', { level: 4 }) ? 'is-active' : ''}
        >
          h4
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
          className={editor.isActive('heading', { level: 5 }) ? 'is-active' : ''}
        >
          h5
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
          className={editor.isActive('heading', { level: 6 }) ? 'is-active' : ''}
        >
          h6
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
        >
          bullet list
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
        >
          ordered list
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'is-active' : ''}
        >
          code block
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'is-active' : ''}
        >
          blockquote
        </button>
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .undo()
              .run()
          }
        >
          undo
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={
            !editor.can()
              .chain()
              .focus()
              .redo()
              .run()
          }
        >
          redo
        </button>
        </div>
        <DownloadButton></DownloadButton>
        
      </>
    )
  }
  
const extensions = [
    Color.configure({ types: [TextStyle.name, ListItem.name] }),
    TextStyle.configure({ types: [ListItem.name] }),
    StarterKit.configure({
      bulletList: {
        keepMarks: true,
        keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
      },
    }),
  ]

const DownloadButton = () => {
    const { editor } = useCurrentEditor();
  
    const downloadLessonResource = async () => {
      if (!editor) {
        console.error('Editor instance not found.');
        return;
      }
  
      const editorHtml = editor.getHTML();
      console.log(editorHtml);

      const parser = new DOMParser();
      const doc = parser.parseFromString(editorHtml, 'text/html'); //doc is the dom structure - trying to convert dom structure to docx

      function extractContentAndFormatting(node) {
        var content = '';
        var formatting = [];
    
        // Iterate over child nodes
        for (var i = 0; i < node.childNodes.length; i++) {
            var child = node.childNodes[i];
    
            // If it's a text node, capture the content
            if (child.nodeType === Node.TEXT_NODE) {
                content += child.textContent;
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                // If it's an element node, capture the formatting and recurse
                formatting.push({
                    tag: child.tagName.toLowerCase(),
                    start: content.length,
                    end: content.length + child.textContent.length,
                });
                var { innerContent, innerFormatting } = extractContentAndFormatting(child);
                content += innerContent;
                formatting = formatting.concat(innerFormatting);
            }
        }
    
        return { innerContent: content, innerFormatting: formatting };
    }
    
    // Get an array of all elements
    var elements = Array.from(doc.body.children);
    
    // Create an array of objects with tag type, content, and formatting
    var resultArray = elements.map(element => {
        var { innerContent, innerFormatting } = extractContentAndFormatting(element);
        return {
            type: element.tagName.toLowerCase(),
            content: innerContent.trim(),
            formatting: innerFormatting,
        };
    });
    
    console.log(resultArray);

    let content = {
      styles: {
        paragraphStyles: [
            {
                id: "Heading1",
                name: "Heading 1",
                basedOn: "Normal",
                next: "Normal",
                quickFormat: true,
                run: {
                    size: 28,
                    bold: true,
                    italics: true,
                },
                paragraph: {
                    spacing: {
                        after: 120,
                    },
                },
            },
            {
                id: "Heading2",
                name: "Heading 2",
                basedOn: "Normal",
                next: "Normal",
                quickFormat: true,
                run: {
                    size: 26,
                    bold: true,
                    underline: {
                        type: UnderlineType.DOUBLE,
                        color: "FF0000",
                    },
                },
                paragraph: {
                    spacing: {
                        before: 240,
                        after: 120,
                    },
                },
            },
            {
                id: "aside",
                name: "Aside",
                basedOn: "Normal",
                next: "Normal",
                run: {
                    color: "999999",
                    italics: true,
                },
                paragraph: {
                    indent: {
                        left: 720,
                    },
                    spacing: {
                        line: 276,
                    },
                },
            },
            {
                id: "wellSpaced",
                name: "Well Spaced",
                basedOn: "Normal",
                quickFormat: true,
                paragraph: {
                    spacing: { line: 276, before: 20 * 72 * 0.1, after: 20 * 72 * 0.05 },
                },
            },
            {
                id: "ListParagraph",
                name: "List Paragraph",
                basedOn: "Normal",
                quickFormat: true,
            },
        ],
    },
    numbering: {
        config: [
            {
                reference: "my-crazy-numbering",
                levels: [
                    {
                        level: 0,
                        format: "lowerLetter",
                        text: "%1)",
                        alignment: AlignmentType.LEFT,
                    },
                ],
            },
        ],
    },
      sections: [
        {
            children: [
            ],
        },
    ],
    }

    for (let i = 0; i < resultArray.length; i++) {
      if (resultArray[i].type === 'p') {
        content.sections[0].children[i] = new Paragraph({
          children: [
            new TextRun({
              text:resultArray[i].content
            })
          ]
        })
      } else if (resultArray[i].type === 'h1') {
        content.sections[0].children[i] = new Paragraph({
          children: [
            new TextRun({
              text:resultArray[i].content,
              bold: true,
            })
          ]
        })
      }
    }

    let EGcontent = {
      sections: [
        {
            properties: {
            },
            children: [
                // new Paragraph({
                //     children: [
                //         new TextRun("Hello World"),
                //         new TextRun({
                //             text: "Foo Bar",
                //             bold: true,
                //         }),
                //         new TextRun({
                //             text: "\tGithub is the best",
                //             bold: true,
                //         }),
                //     ],
                // }),
                // new Paragraph({
                //     children: [
                //         new TextRun("Hello World"),
                //         new TextRun({
                //             text: "Foo Bar",
                //             bold: true,
                //         }),
                //         new TextRun({
                //             text: "\tGithub is the best",
                //             bold: true,
                //         }),
                //     ],
                // })
                
            ],
        },
    ],
    }
                      
    const docx = new Document(content);
    //   const docx = new Document({
    //     creator: "example creator",
    //     title: "example title",
    //     description: "example description",
        // sections: [
        //     {
        //         properties: {
        //         },
        //         children: [
        //             new Paragraph({
        //                 children: [
        //                     new TextRun("Hello World"),
        //                     new TextRun({
        //                         text: "Foo Bar",
        //                         bold: true,
        //                     }),
        //                     new TextRun({
        //                         text: "\tGithub is the best",
        //                         bold: true,
        //                     }),
        //                 ],
        //             }),
        //             new Paragraph({
        //                 children: [
        //                     new TextRun("Hello World"),
        //                     new TextRun({
        //                         text: "Foo Bar",
        //                         bold: true,
        //                     }),
        //                     new TextRun({
        //                         text: "\tGithub is the best",
        //                         bold: true,
        //                     }),
        //                 ],
        //             })
                    
        //         ],
        //     },
        // ],
    // });

    Packer.toBuffer(docx).then((buffer) => {
        saveAs(new Blob([buffer]), 'document.docx');
      });
      
  
      // Add your logic for downloading or processing the HTML as needed    
    };

    return (<>
        <button onClick={downloadLessonResource}>
          Download Lesson Resource
        </button>
        <input onChange={isItWellBracketed}></input>
        </>
      );
    };

const content = `
  <p>hello</p>
  <p>hi</p>
  `
let stack = [];

function isItWellBracketed(e) {

    let brackets = e.currentTarget.value
    console.log(`brackets - ${brackets}`)

    for (let i = 0; i < brackets.length; i++){
      if (brackets[i] === '('){
        stack.push('(');
      }
      else if (brackets[i] === ')'){
        let a = stack.pop();
        if (a != '('){
          return ('Not well bracketed');
        }
      }
    }
    if (stack.length != 0){
      return ('Not well bracketed');
    }
    else{
      return ('Well bracketed');
    }

     
//     for (let i = 0; i < brackets.length; i++) {  
//       if (brackets[i] === '(') {
//         if (brackets[brackets.length - i - 1] !== ')') {
//           console.log("Not well bracketed")
//         } else if (brackets[i] === '{') {
//           if (brackets[brackets.length - i - 1] !== '}') {
//             console.log("Not well bracketed")
//           } else if (brackets[i] === '[') {
//             if (brackets[brackets.length - i - 1] !== ']') {
//               console.log("Not well bracketed")
//             } else {
//               console.log("Looks well bracketed to me!")
//             }
//       }
//     }
//   }
// }
}
  
  export default function Tiptap () {
    Tiptap.displayName = "Tiptap"
    return (
        <>
             <EditorProvider slotBefore={<MenuBar />} extensions={extensions} content={content}></EditorProvider>
        </>

    )
  }

