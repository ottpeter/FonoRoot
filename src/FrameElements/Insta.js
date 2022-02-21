import React from 'react';
import icon from '../assets/insta.svg';


export default function Insta() {
  return (
    <>
      <div className="controls">
        <button className="controlsButton">
          <a href={"https://instagram.com"}  target={"_blank"}>
            <img src={icon}></img>
          </a>
        </button>
      </div>
    </>
  ); 
}
