import React from 'react';
import { login, logout, getBalance } from '../utils';

export default function Wallet({setShowWallet, showWallet}) {
  const [balance, setBalance] = React.useState("NaN");

  React.useEffect(async () => {
    const result = await getBalance();
    setBalance(result);
  }, [])

  function formatNumber(number, maxDecimal) {
    return Math.round(number * Math.pow(10,maxDecimal)) / Math.pow(10,maxDecimal)
  }

  let network = "Error";
  if (window.accountId.slice(-8) === ".testnet") network = "Testnet";
  if (window.accountId.slice(-5) === ".near") network = "Mainnet";

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
            {network === "Error" ? <span className="dot redDot"></span>  : <span className="dot blueDot"></span> } 
            {network} {window.accountId}
          </button>
        </div>

        {showWallet && (
          <div id="wallet" className="dropdownContainer">
            <h3 id="walletTitle" className="dropdownTitle">Wallet</h3>
              <p className="upperWalletLine">testline</p>
              <p className="upperWalletLine">{window.accountId}</p>
            <hr id="walletLine" className="dropdownLine" />
            
              <div className="accountBalanceBox">
                <p className="accountBalanceBoxUpper">Available balance</p>
                <p className="accountBalanceBoxDowner">{formatNumber(balance, 3)} NEAR</p>
              </div>
              <button onClick={logout} id="disconnectButton" className="mainButton">Disconnect</button>
          </div>
        )}
      </>
    )
  }
}
