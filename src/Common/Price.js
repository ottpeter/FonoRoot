import React from 'react';
import nearLogo from '../assets/logo-black.svg';

export default function Price({price}) {
  function formatNumber(number, maxDecimal) {
    return Math.round(number * Math.pow(10,maxDecimal)) / Math.pow(10,maxDecimal)
  }
  
  const formatedPrice = formatNumber(price, 3)

  return (
    <div>
      <p id="previewBoxPrice" className="previewBoxPrice">
        {formatedPrice}
      </p>
      <img src={nearLogo} width={"32px"}></img>
    </div>
  );
}
