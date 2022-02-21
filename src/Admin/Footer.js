import React from 'react';
import GitHub from '../FrameElements/GitHub';
import Twitter from '../FrameElements/Twitter';
import Telegram from '../FrameElements/Telegram';


export default function Footer() {
  return (
    <footer>
      <div className="logo"></div>
      <GitHub />
      <Twitter />
      <Telegram />
    </footer>
  )
}
