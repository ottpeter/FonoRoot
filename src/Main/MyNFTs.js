import React, { useEffect, useState } from 'react';
import { getListForAccount } from '../utils';
import TransferModal from './TransferModal';


export default function MyNFTs() {
  const [list, setList] = useState([]);
  const [showTransfer, setShowTransfer] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(async () => {
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

      {showTransfer && <TransferModal token={list[selected]} />}
    </>
  );
}
