import React, { useEffect, useState } from 'react';
import Notifications from '../Activity/Notifications';
import Wallet from './Wallet';
import Settings from '../Frame/Settings';
import Help from '../Frame/Help';
import { totalMinted } from '../utils';
import logo from '../assets/TopLeftLogo.png'


/** Top Menu for Main */
export default function TopMenu({setShowActivity, showActivity, actionHistory, setShowWallet, showWallet, changePage, testJSON}) {
  const [nftCount, setNftCount] = useState(0);
  const [digits, setDigits] = useState([]);

  useEffect(async () => {
    let count = await totalMinted();
    if (count === -1) count = 0;
    else {
      console.log("count: ", count);
      let digitArray = [0, 0, 0, 0, 0, 0];
      let divider = 1000000;
      for (let i = 0; i < digitArray.length; i++) {
        divider = divider / 10;
        digitArray[i] = Math.floor(count / divider);
        count = count - (digitArray[i] * divider);
      }
      setDigits(digitArray);
      console.log("digitArray: ", digitArray);
    };
  }, []);

  function goToMyNfts() {
    let href = window.location.href;
    href = href.slice(0, href.indexOf("?"));
    history.pushState(null, "MyNFTs", href + "?my-nfts=1");
    changePage();
  }

  function goToHome() {
    let href = window.location.href;
    href = href.slice(0, href.indexOf("?"));
    history.pushState(null, "Home", href);
    changePage();
  }


  return (
    <nav id="mainNav">
      <div className="leftLogo">
        <button onClick={goToHome} className="logo controlsButton">
          <img src={logo} alt='Logo' id="topLeftImage" />
        </button>
      </div>

      <div className="logo">
        <div id="counter">
          <div className="digitLabel">TOTAL MINTED </div>
          <div className="digit">{digits[0]}</div>
          <div className="digit">{digits[1]}</div>
          <div className="digit">{digits[2]}</div>
          <div className="digit">{digits[3]}</div>
          <div className="digit">{digits[4]}</div>
          <div className="digit">{digits[5]}</div>
        </div>
      </div>
      
      <button onClick={goToMyNfts} className="controlsButton menuButton" >MY NFTS</button>
      <Wallet 
        setShowWallet={setShowWallet}
        showWallet={showWallet}
      />
    </nav>
  )
}
