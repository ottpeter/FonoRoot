import React from 'react';
import icon from '../assets/Question-circle.svg';


// This component is currently not used
export default function Help() {
  const [showHelp, setShowHelp] = React.useState(false);
  
  return (
    <>
      <div className="controls controlsLast">
        <button className="controlsButton" onClick={() => setShowHelp(!showHelp)}>
          <img src={icon}></img>
        </button>
      </div>

      {showHelp && (
        <div id="helpModal" className="dropdownContainer">
          Help!
        </div>
      )}
    </>
  ); 
}
