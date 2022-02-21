import React, { useEffect, useState } from 'react';
import { getListForAccount, verify_sha256 } from '../utils';
import TransferModal from './TransferModal';


export default function MyNFTs({newAction}) {
  const [list, setList] = useState([]);
  const [images, setImages] = useState(Array(100).fill(null));
  const [showTransfer, setShowTransfer] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(async () => {
    const urlParams = window.location.search;
    let href = window.location.href;
    href = href.slice(0, href.indexOf("?"));
    history.pushState(null, "Admin", href + "?my-nfts");
    if (urlParams.includes('errorCode')) {
      newAction({
        errorMsg: "There was an error while processing the transaction!", errorMsgDesc: "errorCode",
      }); 
    } else if (urlParams.includes('transactionHashes')) {
      newAction({
        successMsg: "NFT transfered!", successMsgDesc: "You successfully transfered the NFT!",
      });
    }

    const nftList = await getListForAccount();
    setList(nftList);
    loadImages(nftList);
  }, []);

  function loadImages(nftList) {
    for (let i = 0; i < nftList.length; i++) {
      let xhr = new XMLHttpRequest();
      xhr.open("GET", "https://ipfs.io/ipfs/" + nftList[i].metadata.media);
      xhr.responseType = "blob";
      xhr.onload = function() {
        let blob = xhr.response;
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = async function(e) {
          const hash_correct = await verify_sha256(blob, nftList[i].metadata.media_hash);
          if (hash_correct) setImages((state) => {
            state[i] = e.target.result;
            return [...state];
          });
          else newAction({
            errorMsg: "There was an error while loading the image!", errorMsgDesc: "The image hash is incorrect.",
          });
        }
      }
      xhr.send();
    }
  }

  function openTransfer(index) {
    setSelected(index);
    setShowTransfer(true);
  }


  return (
    <main>
      <div id="listContainer">
        <ul>
          {list && list.map((item, i) => (
            <li key={"image-" + i}>
              <button onClick={() => openTransfer(i)} className="nftCard">
                <img src={images[i]} alt={i}></img>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {showTransfer && 
        <TransferModal 
          token={list[selected]} 
          newAction={newAction} 
          setOpenModal={setShowTransfer}
        />
      }
    </main>
  );
}
