import React from 'react';
import icon from '../assets/Twitter.svg'


export default function Twitter() {
  return (
    <>
      <div className="controls">
        <button className="controlsButton">
          <a href={"https://twitter.com"} target={"_blank"}>
            <img src={icon}></img>
          </a>
        </button>
      </div>
    </>
  ); 
}
