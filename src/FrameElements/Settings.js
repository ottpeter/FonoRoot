import React, { useState } from 'react';
import icon from '../assets/Settings.svg'

/**
 * This is not used at the moment. The IPFS-side of site cloning works,
 * but we were not able to create a new contract instance from front-end, so it 
 * is not possible to clone the site.
 * */
export default function Settings({settingsOpen}) {
  const [years, setYears] = useState(1);
  const [copies, setCopies] = useState(5);
  
  function buyMoreCopies() {
    console.log(`I would like to buy ${copies} more storage copies for ${years} years.`);
  }
  // Crust does not have an API that we would need for this to work.

  return (
    <>
      <div className="controls">
        <button className="controlsButton">
          <img src={icon}></img>
        </button>
      </div>

      {settingsOpen && (
        <div className="nftDetailsModal">
          <p>Buy more storage copies TODO</p>
          <input type={"checkbox"}></input><label>NFTs</label>
          <input type={"checkbox"}></input><label>Site</label>
          <p>
            I would like to have
            <input type={"number"} onChange={(e) => setYears(e.target.value)} value={copies}></input> 
            more storage copies for
            <input type={"number"} onChange={(e) => setCopies(e.target.value)} value={years}></input>
            years.
          </p>
          <button onClick={buyMoreCopies}>Buy</button>

          <p>Create new project</p>

          in 
          <button>Clone!</button>
        </div>
      )}
    </>
  ); 
}
