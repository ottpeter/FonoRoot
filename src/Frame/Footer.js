import React from 'react';
import GitHub from './GitHub';
import Twitter from './Twitter';
import Telegram from './Telegram';


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
