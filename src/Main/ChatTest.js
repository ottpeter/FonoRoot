import React, { useState, useEffect } from 'react'

export default function ChatTest({ipfs, orbitDB}) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({name: null, message: ""});

  const globalTopic = "fono-root-chat-all";
  const instaTopic = "fono-root-chat-instance-0";

  function messageReceiver(msg) {
    const messageObj = JSON.parse(msg.data);
    console.log("messageObj: ", messageObj);
    setMessages((state) => {
      state.push({
        name: msg.from,
        message: messageObj.message
      })
      return [...state];
    });
  }
  const receiveMsg = (msg) => console.log(msg)

  async function sendMessage() {
    const message = {
      name: window.accountId,
      message: newMessage.message
    }
    const messageJSON = JSON.stringify(message);
    //const finalMessage = new TextEncoder().encode(messageJSON);
    const result = await ipfs.pubsub.publish(globalTopic, messageJSON);
  }

  useEffect(async () => {
    if (!ipfs) {
      console.error("ipfs object is null");
      return;
    }
    await ipfs.pubsub.subscribe(globalTopic, messageReceiver);

    //const db = await orbitDB.log("")
    /*db.put({name: window.accountId, message: "HelloWorld!"});
    const all = db.iterator({ limit: -1 })
      .collect()
      .map((e) => e.payload.value)
    console.log("all: ", all)*/
  }, []);

  const messagesStyle = {
    backgroundColor: "#bbbbbb",
    width: "100%",
    height: "500px",
    overflow: scroll,
  }

  const messageStyle = {
    backgroundColor: "#333333",
    width: "100%",
    height: "100px",
  }

  return (
    <div>
      ChatTest
      <div id="chatMessages" style={messagesStyle}>
        {messages.map((item) => 
          <div>
            <p>{item.name}</p>
            <p>{item.message}</p>
          </div>
        )}
      </div>
      <div id="newMessage" style={messagesStyle}>
        <input type={"text"} value={newMessage.message} 
          onChange={(e) => setNewMessage({
            name: window.accountId,
            message: e.target.value
          })}>
        </input>
        <button onClick={sendMessage}>SEND!</button>
      </div>
    </div>
  )
}
