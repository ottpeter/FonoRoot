import React, { useState } from 'react';
import TokenModal from './TokenModal';


export default function TokenCard({id, owner, metadata, nftClicked}) {
  
  /* 
  DEAD
  {id}<br></br>
{owner}<br></br>

{metadata.description}<br></br>
generation: {extra.generation}<br></br>
<img id="nft-image" className="temporaryCARD" src={imageSrc}></img>
<audio controls style={{ display: "block" }} >
  <source src={"https://ipfs.io/ipfs/" + extra.music_cid} type="audio/mpeg" />
</audio>

*/
  
  return (
    <button onClick={nftClicked} >
      {metadata.title}<br></br>
    </button>
  )
}
