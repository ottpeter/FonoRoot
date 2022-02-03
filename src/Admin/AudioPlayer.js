import React from 'react';

export default function AudioPlayer({music}) {
  const playerRef = React.useRef();
  const [time, setTime] = React.useState("0");

  console.log("music: ", music)
  console.log("music.src: ", music.src)

  function log() {
    console.log("playerRef: ", playerRef);
    console.log("playerRef.current: ", playerRef.current);
  }


  React.useEffect(() => {
    if (playerRef.current && playerRef.current.currentTime) {
      console.log("setTimeout");
      setTimeout(() => {
        console.log("playerRef.current.duration: ", playerRef.current.currentTime);
        setTime(playerRef.current.currentTime);
      }, 500);
    }

    //playerRef.current.onplay = timeoutFunc;
    //playerRef.current.onstop = clearTimeout(timeoutFunc);
  }, [playerRef.current])

  

  return (
    <div>
      <audio controls style={{ display: "block" }} src={music.src} ref={playerRef} >
      </audio>
      <button onClick={() => playerRef.current.play()}>Exp3</button>
      {playerRef.current && <input 
        type={"range"}
        min={"0"}
        max={playerRef.current.duration}
        value={time}
        onChange={(e) => playerRef.current.currentTime = e.target.value}
      />}          
      <button onClick={() => log()}>Log</button>
    </div>
  );
}
