"use client"

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {useEffect, useState} from 'react';
import "../lexical.css"
import ExampleTheme from "./exampleTheme";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import ToolbarPlugin from "./ToolBarPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import jsPDF from 'jspdf';
import {$generateHtmlFromNodes} from '@lexical/html';

import ListMaxIndentLevelPlugin from "../plugins/ListMaxIndentLevelPlugin";
import CodeHighlightPlugin from "../plugins/CodeHighlightPlugin";
import AutoLinkPlugin from "../plugins/AutoLinkPlugin";

async function downloadLessonResource(resource) {
  const resourceJSON = JSON.parse(resource)
  let textArray = resourceJSON.root.children
  let textStrings = textArray.map((textString) => textString.children[0].text)
  console.log(`This is your array of strings ${textStrings}`)
  const doc = new jsPDF();
  resource = resource.replace('→', ' => ')
  let lines = doc.splitTextToSize(textStrings, 280);
  console.log(`this is what lines looks like - ${lines}`)
  const lineHeight = 6.5; // Set the line height
  let yPos = 15; // Start position on the page
  
  
  console.log(resourceJSON.root)
  for (let i = 0; i < textArray.length; i++){
    const currentChildren = textArray[i].children;
    for (let j = 0; j < currentChildren.length; j++) {
      console.log(currentChildren[j].text);
      console.log(textArray[i].direction)
      console.log(textArray[i].format)
      console.log(textArray[i].indent)
      console.log(textArray[i].type)
      console.log(textArray[i].tag)

      // "detail": 0,
      // "format": 0,
      // "mode": "normal",
      // "style": "",
      // "text": "Hello",
      // "type": "text",
      // "version": 1
    }
  }
  // console.log(resourceJSON.root.children[0].children[0])

  
  lines.forEach((line, index) => {
    if (yPos > 280) { // Check if the position exceeds page height (280 considering margins)
        doc.addPage(); // Add a new page
        yPos = 15; // Reset yPos for the new page
    }
    console.log(`resourceJSON.root.children.[index].tag ${resourceJSON.root.children[index].tag}`)
    if (resourceJSON.root.children[index].tag === 'h1') {
      doc.setFont('times', 'bold').setFontSize(18);
      doc.text(line, 10, yPos)
    } else if (resourceJSON.root.children[index].tag === 'h2') {
      doc.setFont('times', 'normal').setFontSize(16);
      doc.text(line, 10, yPos)
    } else if (resourceJSON.root.children[index].tag === undefined) {
      doc.setFont('times', 'normal').setFontSize(12);
      doc.text(line, 10, yPos)
    }
    // if (/^#{1,2}/.test(line)) {  //this is a header  # or ##
    //   doc.setFont('times', 'bold').setFontSize(18);
    //   line = line.replace(/^#+\s/gm, '')
    //   doc.text(line, 10, yPos)
    // } else if (/^-+/.test(line) || (/^\s+-+/)) {  //this is a bullet point
    //     const textSegments = line.split(/(\*\*.*?\*\*)/);
    //     let currentX = 0
    //     textSegments.forEach(segment => {
    //       if (segment.startsWith("**") && segment.endsWith("**")) {
    //           // Bold text
    //           doc.setFont("times", "bold").setFontSize(12);
    //           segment = segment.substring(2, segment.length - 2); // Remove ** from both ends
    //       } else if (/^\s+-+/.test(segment)) {
    //           segment = segment.replace(/^\s+-+/g, '  ')
    //       } else {
    //           // Normal text
    //           doc.setFont('times', 'normal').setFontSize(12)
    //           segment = segment.replace(/^-+/gm, '• ');
    //       }
    //               // Write the text segment
    //     doc.text(segment, currentX, yPos);
    //     currentX += doc.getStringUnitWidth(segment) * 12 / doc.internal.scaleFactor;
    // });
    // } else if (/^#{3}/.test(line)) {//this is a sub header
    //   doc.setFont('times', 'bold')
    //   doc.setFontSize(14)
    //   doc.text(line, 10, yPos)
    // } else if (/^`+/.test(line)) {
    //   line = line.replace(/^`+/gm, '') 
    // } else if (/^\*+/.test(line)){ {
    //   doc.setFont('times', 'bold').setFontSize(12)
    //   line = line.replace(/^\*+$\*+/, '')
    //   doc.text(line, 10, yPos)
    // }} else {
    //   doc.setFont('times', 'normal').setFontSize(12)
    //   doc.text(line, 10, yPos)
    // }
    yPos += lineHeight; // Increment the position for next line
  });
  doc.save(`${lines[0].replace(/^#+\s/gm, '')}.pdf`);
}

function OnChangePlugin({ onChange }) {
  // Access the editor through the LexicalComposerContext
  const [editor] = useLexicalComposerContext();
  // Wrap our listener in useEffect to handle the teardown and avoid stale references.
  useEffect(() => {
    // most listeners return a teardown function that can be called to clean them up.
    return editor.registerUpdateListener(({editorState}) => {
      // call onChange here to pass the latest state up to the parent.
      onChange(editorState);
    });
  }, [editor, onChange]);

}

export default function Editor() {

  const editorConfig = {
    editorState: () => {
      const root = $getRoot();
      root.clear();
      const p = $createParagraphNode();
      p.append($createTextNode("Insert Awesome Lesson Plan Here"));
      root.append(p);
    },
    // The editor theme
    theme: ExampleTheme,
    // Handling of errors during update
    onError(error) {
      throw error;
    },
    // Any custom nodes go here
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      AutoLinkNode,
      LinkNode
    ]
  };

  const [editorState, setEditorState] = useState();
  function onChange(editorState) {
    // Call toJSON on the EditorState object, which produces a serialization safe string
    const editorStateJSON = editorState.toJSON();
    // However, we still have a JavaScript object, so we need to convert it to an actual string with JSON.stringify
    setEditorState(JSON.stringify(editorStateJSON));
  }

  return (
    <>
    <h1 className='text-center pt-5'>Lexical</h1>
    <button onClick={() => {downloadLessonResource(editorState)}}>Download</button>
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-container">
        <ToolbarPlugin />
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <CodeHighlightPlugin />
          <ListPlugin />
          <LinkPlugin />
          <AutoLinkPlugin />
          <ListMaxIndentLevelPlugin maxDepth={7} />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <OnChangePlugin onChange={onChange} />
          
        </div>
      </div>
    </LexicalComposer>
    </>
  );
}

const obj = {
  "root": {
    "children": [
      {
        "children": [
          {
            "detail": 0,
            "format": 0,
            "mode": "normal",
            "style": "",
            "text": "Hello",
            "type": "text",
            "version": 1
          }
        ],
        "direction": "ltr",
        "format": "",
        "indent": 0,
        "type": "heading",
        "version": 1,
        "tag": "h1"
      },
      {
        "children": [],
        "direction": null,
        "fot": "",
        "indent": 0,
        "type": "paragraph",
        "version": 1
      },
      {
        "children": [
          {
            "detail": 0,
            "format": 0,
            "mode": "normal",
            "style": "",
            "text": "Hello number 2",
            "type": "text",
            "version": 1
          }
        ],
        "direction": "ltr",
        "format": "",
        "indent": 0,
        "type": "heading",
        "version": 1,
        "tag": "2"
      },
      {
        "children": [],
        "direction": null,
        "format": "",
        "indent": 0,
        "type": "paragraph",
        "version": 1
      },
      {
        "children": [
          {
            "detail": 0,
            "for": 0,
            "mode": "normal",
            "style": "",
            "text": "Hello number 3",
            "type": "text",
            "version": 1
          }
        ],
        "direction": "ltr",
        "format": "",
        "indent": 0,
        "type": "quote",
        "version": 1
      }
    ],
    "direction": null,
    "format": "",
    "indent": 0,
    "type": "root",
    "version": 1
  }
};