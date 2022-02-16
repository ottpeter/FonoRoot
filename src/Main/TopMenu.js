import React, { useEffect, useState } from 'react';
import Logo from './Logo';
import Notifications from '../Activity/Notifications';
import Wallet from './Wallet';
import Settings from '../Frame/Settings';
import Help from '../Frame/Help';
import { totalMinted } from '../utils';


/** Top Menu for Main */
export default function TopMenu({setShowActivity, showActivity, actionHistory, setShowWallet, showWallet, testJSON}) {
  const [nftCount, setNftCount] = useState(0);
  const [digits, setDigits] = useState([]);

  useEffect(async () => {
    let count = await totalMinted();
    if (count === -1) setNftCount(0);
    else {
      setNftCount(count);
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
  }, [])


  return (
    <nav id="mainNav">
      <Logo />
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
      <p>MY NFTS</p>
      <Wallet 
        setShowWallet={setShowWallet}
        showWallet={showWallet}
      />
    </nav>
  )
}
