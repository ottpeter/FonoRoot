import React, { useState } from 'react';
import { setSeed } from '../utils';

export default function SetKey() {
  const [mnemonic, setMnemonic] = useState("");

  function saveMnemonic() {
    if (mnemonic.length === 0) return;
    setSeed(mnemonic);
  }

  // There should be some error handling, like is it likely that the string is a mnemonic or not
  // User has to be owner

  return (
    <>
      <div>Please set the Crust key!</div>
      <input onChange={(e) => setMnemonic(e.target.value)}></input>
      <button onClick={saveMnemonic}>SET</button>
    </>
  );
}
