import React from 'react';
import icon from '../assets/github.svg';


export default function GitHub() {
  return (
    <>
      <div className="controls">
        <button className="controlsButton">
          <a href={"https://github.com/ottpeter/FonoRoot"}  target={"_blank"}>
            <img src={icon}></img>
          </a>
        </button>
      </div>
    </>
  ); 
}
