"use client"

import { Editor } from "novel";

export default function App() {
  return <Editor defaultValue = 'Super duper awesome lesson plan here' onUpdate = {() => { console.log(Editor)}} />;
}