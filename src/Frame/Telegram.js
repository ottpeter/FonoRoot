import React from 'react';
import icon from '../assets/Telegram.svg'


export default function Telegram() {
  return (
    <>
      <div className="controls">
        <button className="controlsButton controlsLast">
          <a href={"https://t.me/near_tr"} target={"_blank"}>
            <img src={icon}></img>
          </a>
        </button>
      </div>
    </>
  ); 
}
