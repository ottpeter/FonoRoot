import React, { useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import { getGuestBookEntries, sendGuestBookEntry } from '../utils';
import close from '../assets/close.svg';


export default function GuestBook({id, metadata, newAction, openModal, setOpenModal}) {
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState("");
  
  useEffect(async () => {
    const fetchedEntries = await getGuestBookEntries();
    setEntries(fetchedEntries);
  }, [])
  
  function inputHandler(newText) {
    if ((new TextEncoder().encode(newText)).length < 160) {
      setText(newText);
    }
  }

  function sendEntry() {
    let href = window.location.href;
    href = href.slice(0, href.indexOf("?")+1);
    history.pushState(null, "Guestbook", href + "?guestbook=1");

    const sendPromise = new Promise(async (resolve, reject) => {
      const sendResult = await sendGuestBookEntry(text);
      if (sendResult) {
        resolve("Creating new guestbook entry was successfull (message from promise)");
      } else {
        reject("Creating new guestbook entry was not successull (message from promise)");
      }
    });
    newAction({
      thePromise: sendPromise, 
      pendingPromiseTitle: "Prepairing transaction...", pendingPromiseDesc: "plase wait",
      successPromiseTitle: "Redirecting to transaction", successPromiseDesc: "Please sign the transaction in the next screen!",
      errorPromiseTitle: "Redirecting to transaction", errorPromiseDesc: "Please sign the transaction in the next screen!"
    });
  }

 
 return (
   <>
      <Draggable handle={'#nftDetailsModalBar'} bounds={'main'} >
        <div className="nftDetailsModal"  >
          <div id="nftDetailsModalBar">
            <p>Guestbook</p>
            <button onClick={() => setOpenModal(false)}><img src={close} alt='X'></img></button>
          </div>
          <div id="nftDetailsModalContent">
            <div id="nftDetailsModalPicture">
              <div id="placeholderAtImageSide" className="nftDetailsModalMenuLine"></div>
              <div id="guestbookMessages">
                {entries.map((entry) => (
                  <div className="guestbookMessage">
                    <p className="guestbookMessageSender">{entry.sender}</p>
                    <p className="guestbookMessageTime">{(new Date(entry.date)).toLocaleString()}</p>
                    <p className="guestbookMessageMessage">{entry.message}</p>
                  </div>
                ))}
              </div>
            </div>
            <div id="nftDetailsModalRightSide">
              <div id="placeholderAtContentSide" className="nftDetailsModalMenuLine"></div>
                <div className="nftDetailsModalRightSideGenBox">
                  {window.accountId}
                </div>
                  <textarea onChange={(e) => inputHandler(e.target.value)} value={text} className="nftDetailsModalRightSideContent" >

                  </textarea>
              </div>
            <div id="nftDetailsModalButtons">
              <button onClick={sendEntry} className="buttonFrame">Send</button>
            </div>
          </div>
        </div>
      </Draggable>
    </>
  );
}
