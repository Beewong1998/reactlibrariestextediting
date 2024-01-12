"use client"

import Image from 'next/image'
import React from 'react';
import Draftjs from './Draftjs'

export default function Home() {
  return (
  <>
    <h1 >Draft.js</h1>
    <div className='border-2'>
        <Draftjs />
      </div>
  </>
  )
}
