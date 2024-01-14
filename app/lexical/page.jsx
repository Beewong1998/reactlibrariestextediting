// "use client"

// import Link from 'next/link';

// import {$getRoot, $getSelection} from 'lexical';
// import {useEffect, useState} from 'react';

// import ToolbarPlugin from "../plugins/ToolBarPlugin";
// import {LexicalComposer} from '@lexical/react/LexicalComposer';
// import {PlainTextPlugin} from '@lexical/react/LexicalPlainTextPlugin';
// import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin'
// import {ContentEditable} from '@lexical/react/LexicalContentEditable';
// import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
// import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
// import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';

// const theme = {
//   // Theme styling goes here

// }

// // Lexical React plugins are React components, which makes them
// // highly composable. Furthermore, you can lazy load plugins if
// // desired, so you don't pay the cost for plugins until you
// // actually use them.
// function MyCustomAutoFocusPlugin() {
//   const [editor] = useLexicalComposerContext();

//   useEffect(() => {
//     // Focus the editor when the effect fires!
//     editor.focus();
//   }, [editor]);

//   return null;
// }

// // Catch any errors that occur during Lexical updates and log them
// // or throw them as needed. If you don't throw them, Lexical will
// // try to recover gracefully without losing user data.
// function onError(error) {
//   console.error(error);
// }

// // When the editor changes, you can get notified via the
// // OnChangePlugin!
// function OnChangePlugin({ onChange }) {
//     // Access the editor through the LexicalComposerContext
//     const [editor] = useLexicalComposerContext();
//     // Wrap our listener in useEffect to handle the teardown and avoid stale references.
//     useEffect(() => {
//       // most listeners return a teardown function that can be called to clean them up.
//       return editor.registerUpdateListener(({editorState}) => {
//         // call onChange here to pass the latest state up to the parent.
//         onChange(editorState);
//       });
//     }, [editor, onChange]);
  
//   }

// export default function Editor() {
//   const initialConfig = {
//     namespace: 'MyEditor',
//     theme,
//     onError,
//   };

//   const [editorState, setEditorState] = useState();
//   function onChange(editorState) {
//     // Call toJSON on the EditorState object, which produces a serialization safe string
//     const editorStateJSON = editorState.toJSON();
//     // However, we still have a JavaScript object, so we need to convert it to an actual string with JSON.stringify
//     setEditorState(JSON.stringify(editorStateJSON));
//     console.log(`The Editor State is ${JSON.stringify(editorState, null, 2)}`)
//   }

//   return (
//     <>
//         <Link href='/'>Home</Link>
//         <h1>Lexical</h1>
//         <div className='border-2'>
//             <LexicalComposer initialConfig={initialConfig}>
//             <ToolbarPlugin />
//             <RichTextPlugin
//                 contentEditable={<ContentEditable className = 'p-4'/>}
//                 ErrorBoundary={LexicalErrorBoundary}
//             />
//             <HistoryPlugin />
//             {/* <OnChangePlugin onChange={onChange => console.log(onChange)}/> */}
//             <OnChangePlugin onChange={onChange} />
//             </LexicalComposer>
//         </div>
//     </>
//   );
// }

"use client"

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {useEffect, useState} from 'react';
import "../lexical.css"
import ExampleTheme from "../themes/ExampleTheme";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import ToolbarPlugin from "../plugins/ToolbarPlugin";
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

import ListMaxIndentLevelPlugin from "../plugins/ListMaxIndentLevelPlugin";
import CodeHighlightPlugin from "../plugins/CodeHighlightPlugin";
import AutoLinkPlugin from "../plugins/AutoLinkPlugin";

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
    console.log(`The Editor State is ${JSON.stringify(editorState, null, 2)}`)
  }

  return (
    <>
    <h1 className='text-center pt-5'>Lexical</h1>
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

