import React from 'react';
import { useState } from 'react/cjs/react.development';


export default function TokenCard({id, owner, metadata}) {
  console.log(id)
  console.log(owner)
  console.log("metadata: ", metadata)

  const [imageSrc, setImageSrc] = useState(null);

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
      <button>
        {id}<br></br>
        {owner}<br></br>
        {metadata.title}<br></br>
        {metadata.description}<br></br>
        <img id="nft-image" src={imageSrc}></img>
      </button>
    </div>
  )
}
