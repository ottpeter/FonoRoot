import React from 'react';
import icon from '../assets/Question-circle.svg';


export default function Help() {
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
