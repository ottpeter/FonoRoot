import React, { useEffect, useState } from 'react';
import { getListForAccount } from '../utils';
import TransferModal from './TransferModal';


export default function MyNFTs({newAction}) {
  const [list, setList] = useState([]);
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
    console.log("lista: ", nftList);
    setList(nftList);
  }, []);

  function openTransfer(index) {
    setSelected(index);
    setShowTransfer(true);
  }


  return (
    <>
      <div>
        List
        <ul>
          {list && list.map((item, i) => (
            <li>
              <button onClick={() => openTransfer(i)}>
                <p>{item.token_id}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {showTransfer && 
        <TransferModal 
          token={list[selected]} 
          newAction={newAction} 
        />
      }
    </>
  );
}
