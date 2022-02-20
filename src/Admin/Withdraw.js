import React, { useState } from 'react';
import { withdrawFunds } from '../utils';


export default function Withdraw() {
  const [withdrawAmount, setWithdrawAmount] = useState(0);

  async function startWithdraw() {
    const res = await withdrawFunds(withdrawAmount);
    console.log("Res: ", res);
  }
  
  return (
    <main id="adminMain" style={{ paddingTop: "90px", }}>
      <input 
        type={"number"} 
        onChange={(e) => setWithdrawAmount(e.target.value)} 
        value={withdrawAmount} 
        
      />
      <button onClick={startWithdraw}>WITHDRAW</button>    
    </main>
  );
}
