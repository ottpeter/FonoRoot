import React from 'react';
import Logo from '../Frame/Logo';
import Notifications from '../Activity/Notifications';
import Wallet from '../Wallet/Wallet';
import Settings from '../Frame/Settings';
import Help from '../Frame/Help';


/** Top Menu for Main */
export default function TopMenu({setShowActivity, showActivity, actionHistory, setShowWallet, showWallet, testJSON}) {
  return (
    <nav id="mainNav">
      <Logo />
      <Wallet 
        setShowWallet={setShowWallet}
        showWallet={showWallet}
      />
      <Notifications 
        setShowActivity={setShowActivity} 
        showActivity={showActivity}
        actionHistory={actionHistory} 
      />
      <Settings settingsOpen={false}/>
      <Help />      
    </nav>
  )
}
