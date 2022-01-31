import React from 'react';
import icon from '../assets/Twitter.svg'


export default function Twitter() {
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
