import React from 'react';
import icon from '../assets/github.svg';


export default function GitHub() {
/*
<img src={icon}></img>

*/

  return (
    <>
      <div className="controls">
        <button className="controlsButton">
          <img src={icon}></img>
        </button>
      </div>
    </>
  ); 
}
