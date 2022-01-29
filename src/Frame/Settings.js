import React from 'react';
import icon from '../assets/Settings.svg'

// We don't know if this will really exists or not
export default function Settings() {
  return (
    <>
      <div className="controls">
        <button>
          <img src={icon}></img>
        </button>
      </div>
    </>
  ); 
}
