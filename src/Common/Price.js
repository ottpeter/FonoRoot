import React from 'react';
import nearLogo from '../assets/logo-black.svg';

export default function Price({price}) {
  function formatNumber(number, maxDecimal) {
    return Math.round(number * Math.pow(10,maxDecimal)) / Math.pow(10,maxDecimal)
  }
  
  const formatedPrice = formatNumber(price, 3)

  return (
    <div id="previewBoxPrice" className="price">
      <p  className="priceP">
        {formatedPrice}
      </p>
      <img src={nearLogo} width={"32px"}></img>
    </div>
  );
}
