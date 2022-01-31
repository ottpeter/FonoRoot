import React from 'react';
import { login, logout, getBalance } from '../utils';

export default function Wallet({setShowWallet, showWallet}) {
  const [balance, setBalance] = React.useState("NaN");

  React.useEffect(async () => {
    const result = await getBalance();
    setBalance(result);
  }, [])


  if (!window.walletConnection.isSignedIn()) {
    return (
      <>
        <div className="controls">
          <button onClick={login} className="connectButton">Connect</button>
        </div>
      </>
    );
  } else {
    return (
      <>
        <div className="controls">
          <button className="walletBadge"
            onClick={() => setShowWallet(!showWallet)}
            onBlur={() => setShowWallet(false)}
            tabIndex={"0"}
          >
            * testnet {window.accountId}
          </button>
        </div>

        {showWallet && (
          <div id="wallet" className="dropdownContainer">
            <h3 id="walletTitle" className="dropdownTitle">The Wallet</h3>
              <p className="upperWalletLine">testline</p>
              <p className="upperWalletLine">{window.accountId}</p>
            <hr id="walletLine" className="dropdownLine" />
            
              <div className="accountBalanceBox">
                Available balance
                {balance} NEAR
              </div>
              <button onClick={logout} className="mainButton">Disconnect</button>
          </div>
        )}
      </>
    )
  }
}
