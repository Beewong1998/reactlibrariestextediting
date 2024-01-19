"use client"

import './styles.css'

import { Color } from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import TextStyle from '@tiptap/extension-text-style'
import { EditorProvider, useCurrentEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { useState } from 'react';
import jsPDF from "jspdf";

//converting html to markdown
import { convert } from 'html-to-markdown';

// define your extension array
const MenuBar = () => {
    const { editor } = useCurrentEditor()
  
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
  
      const html = editor.getHTML();
      console.log(html);
      
  
      // Add your logic for downloading or processing the HTML as needed
      let convertedMarkdown = convert(html);
      console.log(convertedMarkdown)

      const doc = new jsPDF();
      convertedMarkdown = convertedMarkdown.replace('→', ' => ')
      let lines = doc.splitTextToSize(convertedMarkdown, 280);
      const lineHeight = 6.5; // Set the line height
      let yPos = 5; // Start position on the page
    
      
      lines.forEach((line) => {
        if (yPos > 280) { // Check if the position exceeds page height (280 considering margins)
            doc.addPage(); // Add a new page
            yPos = 15; // Reset yPos for the new page
        }
        if (/^#{1,2}/.test(line)) {  //this is a header  # or ##
          doc.setFont('times', 'bold').setFontSize(18);
          line = line.replace(/^#+\s/gm, '')
          doc.text(line, 10, yPos)
        } else if (/^-+/.test(line) || (/^\s+-+/)) {  //this is a bullet point
            const textSegments = line.split(/(\*\*.*?\*\*)/);
            let currentX = 10
            textSegments.forEach(segment => {
              if (segment.startsWith("**") && segment.endsWith("**")) {
                  // Bold text
                  doc.setFont("times", "bold").setFontSize(12);
                  segment = segment.substring(2, segment.length - 2); // Remove ** from both ends
              } else if (/^\s+-+/.test(segment)) {
                  segment = segment.replace(/^\s+-+/g, '  ')
              } else {
                  // Normal text
                  doc.setFont('times', 'normal').setFontSize(12)
                  segment = segment.replace(/^-+/gm, '• ');
              }
                      // Write the text segment
            doc.text(segment, currentX, yPos);
            currentX += doc.getStringUnitWidth(segment) * 12 / doc.internal.scaleFactor;
        });
        } else if (/^#{3}/.test(line)) {//this is a sub header
          doc.setFont('times', 'bold')
          doc.setFontSize(14)
          doc.text(line, 10, yPos)
        } else if (/^`+/.test(line)) {
          line = line.replace(/^`+/gm, '') 
        } else if (/^\*+/.test(line)){ {
          doc.setFont('times', 'bold').setFontSize(12)
          line = line.replace(/^\*+$\*+/, '')
          doc.text(line, 10, yPos)
        }} else {
          doc.setFont('times', 'normal').setFontSize(12)
          doc.text(line, 10, yPos)
        }
        yPos += lineHeight; // Increment the position for next line
      });
      doc.save(`${lines[0].replace(/^#+\s/gm, '')}.pdf`);
    };

    return (
        <button onClick={downloadLessonResource}>
          Download Lesson Resource
        </button>
      );
    };
  
  const content = `
  <h2>
    Hi there,
  </h2>
  <p>
    this is a <em>basic</em> example of <strong>tiptap</strong>. Sure, there are all kind of basic text styles you’d probably expect from a text editor. But wait until you see the lists:
  </p>
  <ul>
    <li>
      That’s a bullet list with one …
    </li>
    <li>
      … or two list items.
    </li>
  </ul>
  <p>
    Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:
  </p>
  <pre><code class="language-css">body {
  display: none;
  }</code></pre>
  <p>
    I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.
  </p>
  <blockquote>
    Wow, that’s amazing. Good work, boy! 👏
    <br />
    — Mom
  </blockquote>
  `
  
  export default () => {
    return (
        <>
             <EditorProvider slotBefore={<MenuBar />} extensions={extensions} content={content}></EditorProvider>
        </>

    )
  }