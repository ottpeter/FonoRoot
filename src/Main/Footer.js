import React from 'react';
import GitHub from '../Frame/GitHub';
import Twitter from '../Frame/Twitter';
import Telegram from '../Frame/Telegram';


/** Footer for Main */
export default function Footer() {
  return (
    <footer id="mainFooter">
      <div className="logo"></div>
      <GitHub />
      <Twitter />
      <Telegram />
    </footer>
  )
}
