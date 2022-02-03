import React, { useState } from 'react';
import TokenModal from './TokenModal';


export default function TokenCard({id, owner, metadata}) {
  console.log(id)
  console.log(owner)
  console.log("metadata: ", metadata)

  const [openModal, setOpenModal] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const extra = JSON.parse(metadata.extra);

  function loadImage() {
    // SHA VERIFICATION SHOULD HAPPEN SOMEWHERE
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://ipfs.io/ipfs/" + metadata.media);
    xhr.responseType = "blob";
    xhr.onload = function() {
      let blob = xhr.response;
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = function(e) {
        setImageSrc(e.target.result);
      }
    }
    xhr.send();
  }
  loadImage();

  
  return (
    <div>
      <button onClick={() => setOpenModal(true)} >
        {id}<br></br>
        {owner}<br></br>
        {metadata.title}<br></br>
        {metadata.description}<br></br>
        generation: {extra.generation}<br></br>
        <img id="nft-image" className="temporaryCARD" src={imageSrc}></img>
        <audio controls style={{ display: "block" }} >
          <source src={"https://ipfs.io/ipfs/" + extra.music_cid} type="audio/mpeg" />
        </audio>
      </button>
      
      {openModal && <TokenModal 
        id={id}
        owner={owner}
        metadata={metadata}
        extra={extra}
        image={imageSrc}
        setOpenModal={setOpenModal}
      />}
    </div>
  )
}
