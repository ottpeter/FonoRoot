import React from 'react';

export default function Logo() {
  function goToHome() {
    let href = window.location.href;
    if (href.includes("?")) {
      href = href.slice(0, href.indexOf("?"));
    }
    history.replaceState(null, "Home", href);
  }

  return (
    <div className="logo">
      <button onClick={() => goToHome()} className="logo controlsButton">
        TROACO
      </button>
    </div>
  );
}
