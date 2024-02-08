"use client";

import "./styles.css";

import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import { EditorProvider, useCurrentEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useState } from "react";
import {
  AlignmentType,
  convertInchesToTwip,
  Document,
  HeadingLevel,
  LevelFormat,
  Packer,
  Paragraph,
  TextRun,
  UnderlineType,
} from "docx";
import { saveAs } from "file-saver";

//converting html to markdown

// define your extension array
const MenuBar = () => {
  const { editor } = useCurrentEditor();
  MenuBar.displayName = "MenuBar";

  if (!editor) {
    return null;
  }

  return (
    <>
      <div className="menuBar">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "is-active" : ""}
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "is-active" : ""}
        >
          Italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()} // Add toggleUnderline() method
          disabled={!editor.can().chain().focus().toggleUnderline().run()} // Add toggleUnderline() method
          className={editor.isActive("underline") ? "is-active" : ""} // Update to "underline"
        >
          Underline
        </button>
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={editor.isActive("paragraph") ? "is-active" : ""}
        >
          Normal
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={
            editor.isActive("heading", { level: 1 }) ? "is-active" : ""
          }
        >
          H1
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 }) ? "is-active" : ""
          }
        >
          H2
        </button>
        {/* <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={
            editor.isActive("heading", { level: 3 }) ? "is-active" : ""
          }
        >
          h3
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }
          className={
            editor.isActive("heading", { level: 4 }) ? "is-active" : ""
          }
        >
          h4
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 5 }).run()
          }
          className={
            editor.isActive("heading", { level: 5 }) ? "is-active" : ""
          }
        >
          h5
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 6 }).run()
          }
          className={
            editor.isActive("heading", { level: 6 }) ? "is-active" : ""
          }
        >
          h6
        </button> */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "is-active" : ""}
        >
          Bullet list
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "is-active" : ""}
        >
          Number list
        </button>
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
        >
          Undo
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
        >
          Redo
        </button>
      </div>
    </>
  );
};

const extensions = [
  Color.configure({
    types: [
      TextStyle.name,
      ListItem.name,
      Underline.name,
      BulletList.name,
      OrderedList.name,
    ],
  }), // Add Underline.name to types
  TextStyle.configure({ types: [ListItem.name] }),
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
  }),
  Underline, // Add the Underline extension to the extensions array
];

const DownloadButton = () => {
  const { editor } = useCurrentEditor();

  const downloadLessonResource = async () => {
    if (!editor) {
      console.error("Editor instance not found.");
      return;
    }

    const editorHtml = editor.getHTML();
    console.log(editorHtml);

    const parser = new DOMParser();
    const doc = parser.parseFromString(editorHtml, "text/html"); //doc is the dom structure - trying to convert dom structure to docx

    function extractContentAndFormatting(
      node,
      currentContent = "",
      currentFormatting = []
    ) {
      for (var i = 0; i < node.childNodes.length; i++) {
        var child = node.childNodes[i];

        if (child.nodeType === Node.TEXT_NODE) {
          currentContent += child.textContent;
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          var tag = child.tagName.toLowerCase();
          var start = currentContent.length;

          // Recursively process child node
          var { innerContent, innerFormatting } =
            extractContentAndFormatting(child);

          // Adjust formatting positions for nested elements
          innerFormatting.forEach((format) => {
            format.start += start;
            format.end += start;
          });

          currentContent += innerContent;

          var end = currentContent.length;

          // Add formatting information
          currentFormatting.push({
            tag: tag,
            start: start,
            end: end,
          });

          // Append inner formatting
          currentFormatting = currentFormatting.concat(innerFormatting);
        }
      }

      return {
        innerContent: currentContent,
        innerFormatting: currentFormatting,
      };
    }
    // Get an array of all elements
    var elements = Array.from(doc.body.children);

    // Create an array of objects with tag type, content, and formatting
    var resultArray = elements.map((element) => {
      var { innerContent, innerFormatting } =
        extractContentAndFormatting(element);
      return {
        type: element.tagName.toLowerCase(),
        content: innerContent,
        formatting: innerFormatting,
      };
    });

    console.log(resultArray);

    let content = [];
    let numberingFormat = 1;
    let indentedNumberingFormat = 1;

    for (let i = 0; i < resultArray.length; i++) {
      let type = resultArray[i].type;
      let formattingArray = resultArray[i].formatting;
      if (type === "p") {
        let newParagraph = new Paragraph({
          heading: HeadingLevel.HEADING_4,
        });
        if (formattingArray.length !== 0) {
          let contentString = resultArray[i].content;
          let activeFormatting = {};

          for (let k = 0; k < contentString.length; k++) {
            // Reset formatting options for each character
            let charFormatting = { ...activeFormatting };

            for (let j = 0; j < formattingArray.length; j++) {
              let tag = formattingArray[j].tag;
              let start = formattingArray[j].start;
              let end = formattingArray[j].end;

              // Apply the formatting options within the current tag
              if (k >= start && k < end) {
                if (tag === "strong") {
                  charFormatting.bold = true;
                } else if (tag === "u") {
                  charFormatting.underline = true;
                } else if (tag === "em") {
                  charFormatting.italics = true;
                } else if (
                  tag.startsWith("h") &&
                  /^[1-4]$/.test(tag.substring(1))
                ) {
                  charFormatting.heading = true;
                  charFormatting.headingLevel = parseInt(tag.substring(1));
                }
              }
            }

            newParagraph.addChildElement(
              new TextRun({
                text: contentString[k],
                ...charFormatting,
              })
            );
          }
          content.push(newParagraph);
        } else {
          newParagraph.addChildElement(
            new TextRun({
              text: resultArray[i].content,
            })
          );
          content.push(newParagraph);
        }
      } else if (type === "h1") {
        let newParagraph = new Paragraph({
          heading: HeadingLevel.HEADING_1,
        });
        if (formattingArray.length !== 0) {
          let contentString = resultArray[i].content; //string of the content
          let activeFormatting = {};

          for (let k = 0; k < contentString.length; k++) {
            //loop through the content string
            // Reset formatting options for each character
            let charFormatting = { ...activeFormatting }; //each loop resets the charFormatting so each letter begins with no formatting

            for (let j = 0; j < formattingArray.length; j++) {
              //for each character in the contentString, loop through the formattingArray and apply the relevant style
              let tag = formattingArray[j].tag;
              let start = formattingArray[j].start;
              let end = formattingArray[j].end;

              // Apply the formatting options within the current tag
              if (k >= start && k < end) {
                //each letter has the relevant formatting applied to it. If the index of the character is smaller than the start of the formatting, then this is skipped and it is just added to the newParagraph with no formatting
                if (tag === "strong") {
                  charFormatting.bold = true;
                } else if (tag === "u") {
                  charFormatting.underline = true;
                } else if (tag === "em") {
                  charFormatting.italics = true;
                } else if (
                  tag.startsWith("h") &&
                  /^[1-4]$/.test(tag.substring(1))
                ) {
                  charFormatting.heading = true;
                  charFormatting.headingLevel = parseInt(tag.substring(1));
                }
              }
            }

            newParagraph.addChildElement(
              //the character is then added to the paragraph one by one with the correct formatting
              new TextRun({
                text: contentString[k],
                ...charFormatting,
              })
            );
          }
          content.push(newParagraph);
        } else {
          newParagraph.addChildElement(
            new TextRun({
              text: resultArray[i].content,
            })
          );
          content.push(newParagraph);
        }
      } else if (type === "h2") {
        let newParagraph = new Paragraph({
          heading: HeadingLevel.HEADING_2,
        });
        if (formattingArray.length !== 0) {
          let contentString = resultArray[i].content;
          let activeFormatting = {};

          for (let k = 0; k < contentString.length; k++) {
            // Reset formatting options for each character
            let charFormatting = { ...activeFormatting };

            for (let j = 0; j < formattingArray.length; j++) {
              let tag = formattingArray[j].tag;
              let start = formattingArray[j].start;
              let end = formattingArray[j].end;

              // Apply the formatting options within the current tag
              if (k >= start && k < end) {
                if (tag === "strong") {
                  charFormatting.bold = true;
                } else if (tag === "u") {
                  charFormatting.underline = true;
                } else if (tag === "em") {
                  charFormatting.italics = true;
                } else if (
                  tag.startsWith("h") &&
                  /^[1-4]$/.test(tag.substring(1))
                ) {
                  charFormatting.heading = true;
                  charFormatting.headingLevel = parseInt(tag.substring(1));
                }
              }
            }

            newParagraph.addChildElement(
              new TextRun({
                text: contentString[k],
                ...charFormatting,
              })
            );
          }
          content.push(newParagraph);
        } else {
          newParagraph.addChildElement(
            new TextRun({
              text: resultArray[i].content,
            })
          );
          content.push(newParagraph);
        }
      } else if (type === "h3") {
        let newParagraph = new Paragraph({
          heading: HeadingLevel.HEADING_3,
        });
        if (formattingArray.length !== 0) {
          let contentString = resultArray[i].content;
          let activeFormatting = {};

          for (let k = 0; k < contentString.length; k++) {
            // Reset formatting options for each character
            let charFormatting = { ...activeFormatting };

            for (let j = 0; j < formattingArray.length; j++) {
              let tag = formattingArray[j].tag;
              let start = formattingArray[j].start;
              let end = formattingArray[j].end;

              // Apply the formatting options within the current tag
              if (k >= start && k < end) {
                if (tag === "strong") {
                  charFormatting.bold = true;
                } else if (tag === "u") {
                  charFormatting.underline = true;
                } else if (tag === "em") {
                  charFormatting.italics = true;
                } else if (
                  tag.startsWith("h") &&
                  /^[1-4]$/.test(tag.substring(1))
                ) {
                  charFormatting.heading = true;
                  charFormatting.headingLevel = parseInt(tag.substring(1));
                }
              }
            }

            newParagraph.addChildElement(
              new TextRun({
                text: contentString[k],
                ...charFormatting,
              })
            );
          }
          content.push(newParagraph);
        } else {
          newParagraph.addChildElement(
            new TextRun({
              text: resultArray[i].content,
            })
          );
          content.push(newParagraph);
        }
      } else if (type === "ul") {
        let contentString = resultArray[i].content; //string of content
        let activeFormatting = {}; //empty formatting
        //ulChildren is an array containing the ul tags that are within this ul tag, which means it will need bullet point styling with larger indent
        let ulChildren = resultArray[i].formatting.filter(
          (array) => array.tag === "ul" || array.tag === "ol"
        );
        console.log(ulChildren);

        if (ulChildren.length != 0) {
          for (let o = 0; o < ulChildren.length; o++) {
            let ulStart = ulChildren[o].start;
            let ulEnd = ulChildren[o].end;

            for (let k = 0; k < formattingArray.length; k++) {
              let tag = formattingArray[k].tag;
              let tagStart = formattingArray[k].start;
              let tagEnd = formattingArray[k].end;
              //loop through the formattingArray to check for li
              if (
                formattingArray[k].tag === "p" &&
                tagStart >= ulStart &&
                tagEnd <= ulEnd &&
                ulChildren[o].tag === "ul"
              ) {
                //if there is a li tag then make a new paragraph with bulletpoint styling
                let newParagraph = new Paragraph({
                  heading: HeadingLevel.HEADING_4,
                  numbering: {
                    reference: "my-bullet-points",
                    level: 2,
                  },
                });
                let contentStringSection = resultArray[i].content.slice(
                  formattingArray[k].start,
                  formattingArray[k].end
                ); //create section of string that li is part of
                for (
                  let j = formattingArray[k].start;
                  j < formattingArray[k].end;
                  j++
                ) {
                  //loop through contentStringSection where the li is part of
                  let charFormatting = { ...activeFormatting };

                  for (let l = 0; l < formattingArray.length; l++) {
                    let tag = formattingArray[l].tag;
                    let start = formattingArray[l].start;
                    let end = formattingArray[l].end;
                    if (j >= start && j < end) {
                      if (tag === "strong") {
                        charFormatting.bold = true;
                      } else if (tag === "u") {
                        charFormatting.underline = true;
                      } else if (tag === "em") {
                        charFormatting.italics = true;
                      }
                    }
                  }
                  newParagraph.addChildElement(
                    new TextRun({
                      text: contentString[j],
                      ...charFormatting,
                    })
                  );
                }
                content.push(newParagraph);
                formattingArray[k] = {};
              } else if (
                formattingArray[k].tag === "p" &&
                tagStart >= ulStart &&
                tagEnd <= ulEnd &&
                ulChildren[o].tag === "ol"
              ) {
                //if there is a li tag then make a new paragraph with bulletpoint styling
                let newParagraph = new Paragraph({
                  heading: HeadingLevel.HEADING_4,
                  numbering: {
                    reference: "indentedNumbering",
                    level: indentedNumberingFormat,
                  },
                });
                let contentStringSection = resultArray[i].content.slice(
                  formattingArray[k].start,
                  formattingArray[k].end
                ); //create section of string that li is part of
                for (
                  let j = formattingArray[k].start;
                  j < formattingArray[k].end;
                  j++
                ) {
                  //loop through contentStringSection where the li is part of
                  let charFormatting = { ...activeFormatting };

                  for (let l = 0; l < formattingArray.length; l++) {
                    let tag = formattingArray[l].tag;
                    let start = formattingArray[l].start;
                    let end = formattingArray[l].end;
                    if (j >= start && j < end) {
                      if (tag === "strong") {
                        charFormatting.bold = true;
                      } else if (tag === "u") {
                        charFormatting.underline = true;
                      } else if (tag === "em") {
                        charFormatting.italics = true;
                      }
                    }
                  }
                  newParagraph.addChildElement(
                    new TextRun({
                      text: contentString[j],
                      ...charFormatting,
                    })
                  );
                }
                content.push(newParagraph);
                formattingArray[k] = {};
              } else if (formattingArray[k].tag === "p" && tagEnd <= ulStart) {
                let newParagraph = new Paragraph({
                  heading: HeadingLevel.HEADING_4,
                  numbering: {
                    reference: "my-bullet-points",
                    level: 1,
                  },
                });
                let contentStringSection = resultArray[i].content.slice(
                  formattingArray[k].start,
                  formattingArray[k].end
                ); //create section of string that li is part of
                for (
                  let j = formattingArray[k].start;
                  j < formattingArray[k].end;
                  j++
                ) {
                  //loop through contentStringSection where the li is part of
                  let charFormatting = { ...activeFormatting };

                  for (let l = 0; l < formattingArray.length; l++) {
                    let tag = formattingArray[l].tag;
                    let start = formattingArray[l].start;
                    let end = formattingArray[l].end;
                    if (j >= start && j < end) {
                      if (tag === "strong") {
                        charFormatting.bold = true;
                      } else if (tag === "u") {
                        charFormatting.underline = true;
                      } else if (tag === "em") {
                        charFormatting.italics = true;
                      }
                    }
                  }
                  newParagraph.addChildElement(
                    new TextRun({
                      text: contentString[j],
                      ...charFormatting,
                    })
                  );
                }
                content.push(newParagraph);
                formattingArray[k] = {};
              }
            }
            if (indentedNumberingFormat <= 8) {
              indentedNumberingFormat++;
            }
          }
          //code here for the left overs
          for (let k = 0; k < formattingArray.length; k++) {
            let tag = formattingArray[k].tag;
            //loop through the formattingArray to check for li
            if (formattingArray[k].tag === "p") {
              //if there is a li tag then make a new paragraph with bulletpoint styling
              let newParagraph = new Paragraph({
                heading: HeadingLevel.HEADING_4,
                numbering: {
                  reference: "my-bullet-points",
                  level: 1,
                },
              });
              let contentStringSection = resultArray[i].content.slice(
                formattingArray[k].start,
                formattingArray[k].end
              ); //create section of string that li is part of
              for (
                let j = formattingArray[k].start;
                j < formattingArray[k].end;
                j++
              ) {
                //loop through contentStringSection where the li is part of
                let charFormatting = { ...activeFormatting };

                for (let l = 0; l < formattingArray.length; l++) {
                  let tag = formattingArray[l].tag;
                  let start = formattingArray[l].start;
                  let end = formattingArray[l].end;
                  if (j >= start && j < end) {
                    if (tag === "strong") {
                      charFormatting.bold = true;
                    } else if (tag === "u") {
                      charFormatting.underline = true;
                    } else if (tag === "em") {
                      charFormatting.italics = true;
                    }
                  }
                }
                newParagraph.addChildElement(
                  new TextRun({
                    text: contentString[j],
                    ...charFormatting,
                  })
                );
              }
              content.push(newParagraph);
            }
          }
        } else {
          let contentString = resultArray[i].content; //string of content
          let activeFormatting = {}; //empty formatting

          for (let k = 0; k < formattingArray.length; k++) {
            let tag = formattingArray[k].tag;
            //loop through the formattingArray to check for li
            if (formattingArray[k].tag === "li") {
              //if there is a li tag then make a new paragraph with bulletpoint styling
              let newParagraph = new Paragraph({
                heading: HeadingLevel.HEADING_4,
                numbering: {
                  reference: "my-bullet-points",
                  level: 1,
                },
              });
              let contentStringSection = resultArray[i].content.slice(
                formattingArray[k].start,
                formattingArray[k].end
              ); //create section of string that li is part of
              for (
                let j = formattingArray[k].start;
                j < formattingArray[k].end;
                j++
              ) {
                //loop through contentStringSection where the li is part of
                let charFormatting = { ...activeFormatting };

                for (let l = 0; l < formattingArray.length; l++) {
                  let tag = formattingArray[l].tag;
                  let start = formattingArray[l].start;
                  let end = formattingArray[l].end;
                  if (j >= start && j < end) {
                    if (tag === "strong") {
                      charFormatting.bold = true;
                    } else if (tag === "u") {
                      charFormatting.underline = true;
                    } else if (tag === "em") {
                      charFormatting.italics = true;
                    }
                  }
                }
                newParagraph.addChildElement(
                  new TextRun({
                    text: contentString[j],
                    ...charFormatting,
                  })
                );
              }
              content.push(newParagraph);
            }
          }
        }
      } else if (type === "ol") {
        let contentString = resultArray[i].content; //string of content
        let activeFormatting = {}; //empty formatting
        //ulChildren is an array containing the ul tags that are within this ul tag, which means it will need bullet point styling with larger indent
        let olChildren = resultArray[i].formatting.filter(
          (array) => array.tag === "ol" || array.tag === "ul"
        );
        console.log(olChildren);

        if (olChildren.length != 0) {
          for (let o = 0; o < olChildren.length; o++) {
            let olStart = olChildren[o].start;
            let olEnd = olChildren[o].end;

            for (let k = 0; k < formattingArray.length; k++) {
              let tag = formattingArray[k].tag;
              let tagStart = formattingArray[k].start;
              let tagEnd = formattingArray[k].end;
              //loop through the formattingArray to check for li
              if (
                formattingArray[k].tag === "p" &&
                tagStart >= olStart &&
                tagEnd <= olEnd &&
                olChildren[o].tag === "ol"
              ) {
                //if there is a li tag then make a new paragraph with bulletpoint styling
                let newParagraph = new Paragraph({
                  heading: HeadingLevel.HEADING_4,
                  numbering: {
                    reference: "indentedNumbering",
                    level: indentedNumberingFormat,
                  },
                });
                let contentStringSection = resultArray[i].content.slice(
                  formattingArray[k].start,
                  formattingArray[k].end
                ); //create section of string that li is part of
                for (
                  let j = formattingArray[k].start;
                  j < formattingArray[k].end;
                  j++
                ) {
                  //loop through contentStringSection where the li is part of
                  let charFormatting = { ...activeFormatting };

                  for (let l = 0; l < formattingArray.length; l++) {
                    let tag = formattingArray[l].tag;
                    let start = formattingArray[l].start;
                    let end = formattingArray[l].end;
                    if (j >= start && j < end) {
                      if (tag === "strong") {
                        charFormatting.bold = true;
                      } else if (tag === "u") {
                        charFormatting.underline = true;
                      } else if (tag === "em") {
                        charFormatting.italics = true;
                      }
                    }
                  }
                  newParagraph.addChildElement(
                    new TextRun({
                      text: contentString[j],
                      ...charFormatting,
                    })
                  );
                }
                content.push(newParagraph);
                formattingArray[k] = {};
              } else if (
                formattingArray[k].tag === "p" &&
                tagStart >= olStart &&
                tagEnd <= olEnd &&
                olChildren[o].tag === "ul"
              ) {
                //if there is a li tag then make a new paragraph with bulletpoint styling
                let newParagraph = new Paragraph({
                  heading: HeadingLevel.HEADING_4,
                  numbering: {
                    reference: "my-bullet-points",
                    level: 2,
                  },
                });
                let contentStringSection = resultArray[i].content.slice(
                  formattingArray[k].start,
                  formattingArray[k].end
                ); //create section of string that li is part of
                for (
                  let j = formattingArray[k].start;
                  j < formattingArray[k].end;
                  j++
                ) {
                  //loop through contentStringSection where the li is part of
                  let charFormatting = { ...activeFormatting };

                  for (let l = 0; l < formattingArray.length; l++) {
                    let tag = formattingArray[l].tag;
                    let start = formattingArray[l].start;
                    let end = formattingArray[l].end;
                    if (j >= start && j < end) {
                      if (tag === "strong") {
                        charFormatting.bold = true;
                      } else if (tag === "u") {
                        charFormatting.underline = true;
                      } else if (tag === "em") {
                        charFormatting.italics = true;
                      }
                    }
                  }
                  newParagraph.addChildElement(
                    new TextRun({
                      text: contentString[j],
                      ...charFormatting,
                    })
                  );
                }
                content.push(newParagraph);
                formattingArray[k] = {};
              } else if (formattingArray[k].tag === "p" && tagEnd <= olStart) {
                let newParagraph = new Paragraph({
                  heading: HeadingLevel.HEADING_4,
                  numbering: {
                    reference: "numbering",
                    level: numberingFormat,
                  },
                });
                let contentStringSection = resultArray[i].content.slice(
                  formattingArray[k].start,
                  formattingArray[k].end
                ); //create section of string that li is part of
                for (
                  let j = formattingArray[k].start;
                  j < formattingArray[k].end;
                  j++
                ) {
                  //loop through contentStringSection where the li is part of
                  let charFormatting = { ...activeFormatting };

                  for (let l = 0; l < formattingArray.length; l++) {
                    let tag = formattingArray[l].tag;
                    let start = formattingArray[l].start;
                    let end = formattingArray[l].end;
                    if (j >= start && j < end) {
                      if (tag === "strong") {
                        charFormatting.bold = true;
                      } else if (tag === "u") {
                        charFormatting.underline = true;
                      } else if (tag === "em") {
                        charFormatting.italics = true;
                      }
                    }
                  }
                  newParagraph.addChildElement(
                    new TextRun({
                      text: contentString[j],
                      ...charFormatting,
                    })
                  );
                }
                content.push(newParagraph);
                formattingArray[k] = {};
              }
            }
            if (indentedNumberingFormat <= 8) {
              indentedNumberingFormat++;
            }
            console.log(indentedNumberingFormat);
          }
          for (let k = 0; k < formattingArray.length; k++) {
            let tag = formattingArray[k].tag;
            //loop through the formattingArray to check for li
            if (formattingArray[k].tag === "p") {
              //if there is a li tag then make a new paragraph with bulletpoint styling
              let newParagraph = new Paragraph({
                heading: HeadingLevel.HEADING_4,
                numbering: {
                  reference: "numbering",
                  level: numberingFormat,
                },
              });
              let contentStringSection = resultArray[i].content.slice(
                formattingArray[k].start,
                formattingArray[k].end
              ); //create section of string that li is part of
              for (
                let j = formattingArray[k].start;
                j < formattingArray[k].end;
                j++
              ) {
                //loop through contentStringSection where the li is part of
                let charFormatting = { ...activeFormatting };

                for (let l = 0; l < formattingArray.length; l++) {
                  let tag = formattingArray[l].tag;
                  let start = formattingArray[l].start;
                  let end = formattingArray[l].end;
                  if (j >= start && j < end) {
                    if (tag === "strong") {
                      charFormatting.bold = true;
                    } else if (tag === "u") {
                      charFormatting.underline = true;
                    } else if (tag === "em") {
                      charFormatting.italics = true;
                    }
                  }
                }
                newParagraph.addChildElement(
                  new TextRun({
                    text: contentString[j],
                    ...charFormatting,
                  })
                );
              }
              content.push(newParagraph);
            }
          }
          if (numberingFormat <= 8) {
            numberingFormat++;
          }
        }
        //if the olformat array is empty
        else {
          let contentString = resultArray[i].content; //string of content
          let activeFormatting = {}; //empty formatting

          for (let k = 0; k < formattingArray.length; k++) {
            let tag = formattingArray[k].tag;
            //loop through the formattingArray to check for li
            if (formattingArray[k].tag === "li") {
              //if there is a li tag then make a new paragraph with bulletpoint styling
              let newParagraph = new Paragraph({
                heading: HeadingLevel.HEADING_4,
                numbering: {
                  reference: "numbering",
                  level: numberingFormat,
                },
              });
              let contentStringSection = resultArray[i].content.slice(
                formattingArray[k].start,
                formattingArray[k].end
              ); //create section of string that li is part of
              for (
                let j = formattingArray[k].start;
                j < formattingArray[k].end;
                j++
              ) {
                //loop through contentStringSection where the li is part of
                let charFormatting = { ...activeFormatting };

                for (let l = 0; l < formattingArray.length; l++) {
                  let tag = formattingArray[l].tag;
                  let start = formattingArray[l].start;
                  let end = formattingArray[l].end;
                  if (j >= start && j < end) {
                    if (tag === "strong") {
                      charFormatting.bold = true;
                    } else if (tag === "u") {
                      charFormatting.underline = true;
                    } else if (tag === "em") {
                      charFormatting.italics = true;
                    }
                  }
                }
                newParagraph.addChildElement(
                  new TextRun({
                    text: contentString[j],
                    ...charFormatting,
                  })
                );
              }
              content.push(newParagraph);
            }
          }
          if (numberingFormat <= 8) {
            numberingFormat++;
          }
        }
      }
    }

    console.log(content);

    const docx = new Document({
      styles: {
        default: {
          heading1: {
            run: {
              size: 30,
              bold: true,
            },
            paragraph: {
              spacing: {
                before: 50,
                after: 100,
              },
            },
          },
          heading2: {
            run: {
              size: 25,
              bold: true,
            },
            paragraph: {
              spacing: {
                before: 50,
                after: 100,
              },
            },
          },
          heading3: {
            run: {
              size: 23,
            },
          },
          //styling for the normal paragraph text
          heading4: {
            run: {
              size: 18,
            },
          },
          //the styling of bullet points
          listParagraph: {
            run: {
              color: "#000000",
              size: 18,
            },
            paragraph: {
              spacing: {
                before: 100,
                after: 100,
              },
            },
          },
          document: {
            run: {
              size: "11pt",
              font: "Calibri",
            },
            paragraph: {
              alignment: AlignmentType.LEFT,
              spacing: {
                before: 30,
                after: 30,
              },
            },
          },
        },
        characterStyles: [
          {
            id: "strikeUnderlineCharacter",
            name: "Strike Underline",
            basedOn: "Normal",
            quickFormat: true,
            run: {
              strike: true,
              underline: {
                type: UnderlineType.SINGLE,
              },
            },
          },
        ],
      },
      numbering: {
        config: [
          {
            reference: "numbering",
            levels: [
              {
                level: 1,
                format: LevelFormat.DECIMAL,
                alignment: AlignmentType.START,
                text: "%2)",
                style: {
                  paragraph: {
                    indent: {
                      left: convertInchesToTwip(0.5),
                      hanging: convertInchesToTwip(0.18),
                    },
                  },
                },
              },
              {
                level: 2,
                format: LevelFormat.DECIMAL,
                text: "%3)",
                alignment: AlignmentType.START,
                style: {
                  paragraph: {
                    indent: {
                      left: convertInchesToTwip(0.5),
                      hanging: convertInchesToTwip(0.18),
                    },
                  },
                },
              },
              {
                level: 3,
                format: LevelFormat.DECIMAL,
                text: "%4)",
                alignment: AlignmentType.START,
                style: {
                  paragraph: {
                    indent: {
                      left: convertInchesToTwip(0.5),
                      hanging: convertInchesToTwip(0.18),
                    },
                  },
                },
              },
              {
                level: 4,
                format: LevelFormat.DECIMAL,
                text: "%5)",
                alignment: AlignmentType.START,
                style: {
                  paragraph: {
                    indent: {
                      left: convertInchesToTwip(0.5),
                      hanging: convertInchesToTwip(0.18),
                    },
                  },
                },
              },
              {
                level: 5,
                format: LevelFormat.DECIMAL,
                text: "%6)",
                alignment: AlignmentType.START,
                style: {
                  paragraph: {
                    indent: {
                      left: convertInchesToTwip(0.5),
                      hanging: convertInchesToTwip(0.18),
                    },
                  },
                },
              },
              {
                level: 6,
                format: LevelFormat.DECIMAL,
                text: "%7)",
                alignment: AlignmentType.START,
                style: {
                  paragraph: {
                    indent: {
                      left: convertInchesToTwip(0.5),
                      hanging: convertInchesToTwip(0.18),
                    },
                  },
                },
              },
              {
                level: 7,
                format: LevelFormat.DECIMAL,
                text: "%8)",
                alignment: AlignmentType.START,
                style: {
                  paragraph: {
                    indent: {
                      left: convertInchesToTwip(0.5),
                      hanging: convertInchesToTwip(0.18),
                    },
                  },
                },
              },
              {
                level: 8,
                format: LevelFormat.DECIMAL,
                text: "%9)",
                alignment: AlignmentType.START,
                style: {
                  paragraph: {
                    indent: {
                      left: convertInchesToTwip(0.5),
                      hanging: convertInchesToTwip(0.18),
                    },
                  },
                },
              },
            ],
          },
          {
            reference: "indentedNumbering",
            levels: [
              {
                level: 1,
                format: LevelFormat.DECIMAL,
                text: "%2)",
                alignment: AlignmentType.START,
                style: {
                  paragraph: {
                    indent: {
                      left: 1000,
                      hanging: convertInchesToTwip(0.18),
                    },
                  },
                },
              },
              {
                level: 2,
                format: LevelFormat.DECIMAL,
                text: "%3)",
                alignment: AlignmentType.START,
                style: {
                  paragraph: {
                    indent: {
                      left: 1000,
                      hanging: convertInchesToTwip(0.18),
                    },
                  },
                },
              },
              {
                level: 3,
                format: LevelFormat.DECIMAL,
                text: "%4)",
                alignment: AlignmentType.START,
                style: {
                  paragraph: {
                    indent: {
                      left: 1000,
                      hanging: convertInchesToTwip(0.18),
                    },
                  },
                },
              },
              {
                level: 4,
                format: LevelFormat.DECIMAL,
                text: "%5)",
                alignment: AlignmentType.START,
                style: {
                  paragraph: {
                    indent: {
                      left: 1000,
                      hanging: convertInchesToTwip(0.18),
                    },
                  },
                },
              },
              {
                level: 5,
                format: LevelFormat.DECIMAL,
                text: "%6)",
                alignment: AlignmentType.START,
                style: {
                  paragraph: {
                    indent: {
                      left: 1000,
                      hanging: convertInchesToTwip(0.18),
                    },
                  },
                },
              },
              {
                level: 6,
                format: LevelFormat.DECIMAL,
                text: "%7)",
                alignment: AlignmentType.START,
                style: {
                  paragraph: {
                    indent: {
                      left: 1000,
                      hanging: convertInchesToTwip(0.18),
                    },
                  },
                },
              },
              {
                level: 7,
                format: LevelFormat.DECIMAL,
                text: "%8)",
                alignment: AlignmentType.START,
                style: {
                  paragraph: {
                    indent: {
                      left: 1000,
                      hanging: convertInchesToTwip(0.18),
                    },
                  },
                },
              },
              {
                level: 8,
                format: LevelFormat.DECIMAL,
                text: "%9)",
                alignment: AlignmentType.START,
                style: {
                  paragraph: {
                    indent: {
                      left: 1000,
                      hanging: convertInchesToTwip(0.18),
                    },
                  },
                },
              },
            ],
          },
          {
            reference: "my-bullet-points",
            levels: [
              {
                level: 1,
                format: LevelFormat.BULLET,
                text: "\u2022",
                alignment: AlignmentType.LEFT,
                style: {
                  paragraph: {
                    indent: {
                      left: convertInchesToTwip(0.5),
                      hanging: convertInchesToTwip(0.18),
                    },
                  },
                },
              },
              {
                level: 2,
                format: LevelFormat.BULLET,
                text: "\u26AC",
                alignment: AlignmentType.LEFT,
                style: {
                  paragraph: {
                    indent: {
                      left: 1000,
                      hanging: convertInchesToTwip(0.18),
                    },
                  },
                },
              },
              {
                level: 0,
                format: LevelFormat.BULLET,
                text: "\u1F60",
                alignment: AlignmentType.LEFT,
                style: {
                  paragraph: {
                    indent: {
                      left: convertInchesToTwip(0.5),
                      hanging: convertInchesToTwip(0.18),
                    },
                  },
                },
              },
            ],
          },
        ],
      },
      sections: [
        {
          properties: {},
          children: content,
        },
      ],
    });

    //ensures that the title of the document is not blank, otherwise it downloads it as a .txt file with gibberish
    function findFirstNonBlank(array) {
      for (let i = 0; i < array.length; i++) {
        const currentContent = array[i].content;
        if (currentContent.trim() !== "") {
          return currentContent;
        }
      }
    }

    let title = findFirstNonBlank(resultArray);

    Packer.toBuffer(docx).then((buffer) => {
      saveAs(new Blob([buffer]), `${title}.docx`);
    });

    // Add your logic for downloading or processing the HTML as needed
  };

  return (
    <>
      <button
        style={{
          width: "auto",
          height: "auto",
          marginTop: "10px",
          backgroundColor: "lightgreen",
          borderRadius: "10px",
          padding: "5px",
        }}
        onClick={downloadLessonResource}
      >
        Download Lesson Resource
      </button>
    </>
  );
};

const startingContent = `
  <h1>hello</h1>
  <h2>hi</h2>
  `;
let stack = [];

export default function Tiptap() {
  Tiptap.displayName = "Tiptap";
  return (
    <>
      <div
        style={{
          width: "750px",
          height: "400px",
          margin: "0 auto",
          overflow: "auto",
        }}
      >
        <EditorProvider
          slotBefore={<MenuBar />}
          slotAfter={<DownloadButton />}
          extensions={extensions}
          content={startingContent}
        ></EditorProvider>
      </div>
    </>
  );
}
