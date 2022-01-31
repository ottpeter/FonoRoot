import React from 'react';
import Message from './Message';
import icon from '../assets/bell_with_dot.svg'

export default function ActivityBox({setShowActivity, showActivity, actionHistory}) {
  /* This probably does not exist
  if (listItem.infoMsg) return <li className="infoNotification"><Message title={listItem.infoMsg} desc={listItem.infoMsgDesc} /></li>
  className="errorNotification" not used yet
   
  
  
  */
 let lastFive = [];
 if (actionHistory) lastFive = actionHistory.slice(-5).reverse();
 
 
 return (
   <>
      <div className="controls">
        <button
          className="controlsButton"
          onClick={() => setShowActivity(!showActivity)} 
          onBlur={() => setShowActivity(false)}
          tabIndex={"0"} >
            <img src={icon}></img>
        </button>
      </div>

      {showActivity && (
        <div id="activityBox" className="dropdownContainer"  >
          <h3 id="notificationsTitle" className="dropdownTitle">Notifications</h3>
          
          <hr id="notificationLine" className="dropdownLine" />
          
          <ul id="notificationList" className="notificationList">
            {lastFive.map((listItem) => {
              if (listItem.successMsg) return (
                <li className="successNotification">
                  <Message 
                    title={listItem.successMsg} 
                    desc={listItem.successMsgDesc} 
                  />
                </li>
              );
              if (listItem.errorMsg) return (
                <li className="errorNotification">
                  <Message 
                    title={listItem.errorMsg} 
                    desc={listItem.errorMsgDesc} 
                  />
                </li>
              );
              if (listItem.infoMsg) return (
                <li className="infoNotification">
                  <Message 
                    title={listItem.infoMsg} 
                    desc={listItem.infoMsgDesc} 
                  />
                </li>
              );
              return <li>{"No Notification"}</li>;                                 // This would be an error
            })}
          </ul>
        </div>
      )}
    </>
  );
}
