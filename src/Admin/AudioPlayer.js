import React from 'react';

export default function AudioPlayer({music}) {
  const playerRef = React.useRef();
  const timeoutId = setTimeout(timeoutFunc, 500);
  const [time, setTime] = React.useState("0");
  const [playing, setPlaying] = React.useState(false);
  
  function timeoutFunc() {
    console.log("tick");
    console.log("playerRef.current.duration: ", playerRef.current.currentTime);
    setTime(playerRef.current.currentTime);
  }
  
  React.useEffect(() => {
    return () => {
      clearTimeout(timeoutId)
    };
  }, [playing]);

  function playClicked() {
    setPlaying(true);
    playerRef.current.play();
  }

  function pauseClicked() {
    setPlaying(false);
    playerRef.current.pause()
  }

  return (
    <div>
      <audio style={{ display: "block" }} src={music.src} ref={playerRef} />
      {playing? 
        <button onClick={pauseClicked}>Pause</button>
      : 
        <button onClick={playClicked}>Play</button>
      }
      {playerRef.current && 
        <input 
          type={"range"}
          min={"0"}
          max={playerRef.current.duration}
          value={time}
          onChange={(e) => {
            playerRef.current.currentTime = e.target.value;
            setTime(playerRef.current.currentTime);
          }}
        />
      }          
    </div>
  );
}
