"use client"

import Link from 'next/link';
import Image from 'next/image'
import React from 'react';
import Draftjs from './Draftjs'

export default function Home() {
  return (
  <>
    <nav>
      <ul>
        <li>
          <Link className="inline-link" href='./lexical'>Lexical</Link>
        </li>
        <li>
          <Link className="inline-link" href='./novel'>Novel</Link>
        </li>
        <li>
          <Link className="inline-link" href='./tiptap'>Tiptap</Link>
        </li>
      </ul>
    </nav>  
    <h1 >Draft.js</h1>
    <ul>
      <li>hi</li>
      <li>bye</li>
    </ul>
    <div className='border-2'>
        <Draftjs />
    </div>
  </>
  )
}

