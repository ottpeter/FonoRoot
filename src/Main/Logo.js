import React from 'react';
import logo from '../assets/TopLeftLogo.png'


export default function Logo() {
  function goToHome() {
    let href = window.location.href;
    if (href.includes("?")) {
      href = href.slice(0, href.indexOf("?"));
    }
    //window.location = href;
    history.replaceState(null, "Home", href);
  }

  return (
    <div className="leftLogo">
      <button onClick={() => goToHome()} className="logo controlsButton">
        <img src={logo} alt='Logo' id="topLeftImage" />
      </button>
    </div>
  );
}
