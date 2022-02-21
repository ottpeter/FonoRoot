import React from 'react';
import GitHub from '../FrameElements/GitHub';
import Twitter from '../FrameElements/Twitter';
import Discord from '../FrameElements/Discord';
import Insta from '../FrameElements/Insta';
import logo from '../assets/BottomLeftLogo.png';
import guestBookIcon from '../assets/guestbook.png';


/** Footer for Main */
export default function Footer({openGuestBook, setGuestBook}) {
  return (
    <footer id="mainFooter">
      <button className="controlsButton">
        <img src={logo} alt='Logo' className="leftLogo" id="bottomLeftImage" />
      </button>
      <div className="logo">        
        <Twitter />
        <Discord />
        <Insta />
        <GitHub />
      </div>
      <button onClick={() => setGuestBook(!openGuestBook)} className="controlsButton">
        <img src={guestBookIcon} alt='Guestbook' className="rightLogo" id="bottomRightImage" />
      </button>
    </footer>
  )
}
