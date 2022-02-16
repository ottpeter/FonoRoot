import React from 'react';
import GitHub from '../Frame/GitHub';
import Twitter from '../Frame/Twitter';
import Discord from '../Frame/Discord';
import Insta from '../Frame/Insta';
import logo from '../assets/BottomLeftLogo.png';
import guestBookIcon from '../assets/guestbook.png';


/** Footer for Main */
export default function Footer() {
  return (
    <footer id="mainFooter">
      <img src={logo} alt='Logo' className="leftLogo" id="bottomLeftImage" />
      <div className="logo">        
        <Twitter />
        <Discord />
        <Insta />
        <GitHub />
      </div>
      <img src={guestBookIcon} alt='Guestbook'  className="rightLogo" id="bottomRightImage" />
    </footer>
  )
}
