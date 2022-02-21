import React from 'react';


export default function AudioPlayer({music}) {
  const playerRef = React.useRef();
  const timeoutId = setTimeout(timeoutFunc, 500);
  const [time, setTime] = React.useState("0");
  const [playing, setPlaying] = React.useState(false);
  const [mute, setMute] = React.useState(false);
  
  function timeoutFunc() {
    setTime(playerRef.current.currentTime);
  }
  
  React.useEffect(async () => {
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
    playerRef.current.pause();
  }

  function muteAudio() {
    console.log("mute")
    setMute(true);
    playerRef.current.volume = 0;
  }

  function giveBackAudio() {
    console.log("unmute")
    setMute(false);
    playerRef.current.volume = 0.50;
  }

  return (
    <>
      <audio style={{ display: "block" }} src={music} ref={playerRef} />
      {playing? 
        <button className="musicControlsButton" onClick={pauseClicked}><PauseIcon /></button>
      : 
        <button className="musicControlsButton" onClick={playClicked}><PlayIcon /></button>
      }
      {playerRef.current && 
        <input 
          className="musicControlsSlider"
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
      {mute?
        <button className="musicControlsButton" onClick={giveBackAudio}><NoVolumeIcon /></button>
      :
        <button className="musicControlsButton" onClick={muteAudio}><VolumeIcon /></button>
      }
    </>
  );
}


/** 
 * We used to have a problem with SVG loading
 * The path for the image asset became something like `https://ipfs.io/ipfs/volume.72f0adf8.svg` instead of something like 
 * `https://ipfs.io/ipfs/QmaFoGKANeVtwoYbdW3E7NB2wgLnmjXVJCoN7Xen4tJiYG/volume.72f0adf8.svg`. We don't have this problem in the footer.
 * After renaming `pause.svg` to `Pause.svg`, all of the problems got solved in an unexplainable way, but we do it with inline SVG for safety reasons.
 */
function PlayIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M6 20H8.43757V19.2H9.65827V18.4H10.877V17.6H12.0958V16.8H13.3146V16H14.5333V15.2H15.7501V14.4H16.9689V13.6H18.1896V12.8H19.0021V11.2H18.1896V10.4H16.9689V9.6H15.7501V8.8H14.5333V8H13.3146V7.2H12.0958V6.4H10.877V5.6H9.65827V4.8H8.43757V4H6V20Z" fill="#333333"/>
      <rect width="2" height="2" transform="matrix(1 0 0 -1 11 13)" fill="#333333"/>
    </svg>
  )
}

function PauseIcon() {
  return(
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M10 4H5V20H10V4ZM19 4H14V20H19V4Z" fill="#333333"/>
    </svg>
  )
}

function NoVolumeIcon() {
  return(
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M11 2H9V4H7V6H5V8H3H1V10V14V16H3H5V18H7V20H9V22H11V2ZM7 18V16H5V14H3V10H5V8H7V6H9V18H7ZM13 10H15V14H13V10ZM21 4H19V6H21V18H19V20H21V18H23V6H21V4ZM19 8H17V6H13V8H17V16H13V18H17V16H19V8ZM19 2H13V4H19V2ZM19 20H13V22H19V20Z" fill="#333333"/>
    </svg>
  )
}

function VolumeIcon() {
  return(
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M13 2H11V4H9V6H7V8H5H3V10V14V16H5H7V18H9V20H11V22H13V2ZM9 18V16H7V14H5V10H7V8H9V6H11V18H9ZM19.0002 11.2233H17.0005V9.22327H15.0005V11.2233H17.0002V13.2233L15.0005 13.2233V15.2233H17.0005V13.2233L19.0002 13.2233V15.2233H21.0002V13.2233L19.0002 13.2233V11.2233ZM19.0002 11.2233H21.0002V9.22327H19.0002V11.2233Z" fill="#333333"/>
    </svg>
  )
}
