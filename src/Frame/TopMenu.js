import React from 'react';
import { utils } from 'near-api-js';
import 'regenerator-runtime/runtime';
import Logo from './Logo';
import Notifications from '../Activity/Notifications';
import Wallet from '../Wallet/Wallet';
import Settings from './Settings';
import Help from './Help';


export default function TopMenu({setShowActivity, showActivity, actionHistory, setShowWallet, showWallet}) {
  return (
    <nav>
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
      <Settings />
      <Help />      
    </nav>
  )
}
