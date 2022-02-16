import React from 'react';
import pauseIcon from '../assets/pause.svg';
import playIcon from '../assets/play.svg';
import noVolumeIcon from '../assets/no-volume.svg';
//import volumeIcon from '../assets/volume.svg';

export default function AudioPlayer({music}) {
  const playerRef = React.useRef();
  const timeoutId = setTimeout(timeoutFunc, 500);
  const [time, setTime] = React.useState("0");
  const [playing, setPlaying] = React.useState(false);
  const [mute, setMute] = React.useState(false);
  const [icons, setIcons] = React.useState({
    volume: null,
    noVolume: null,
    play: null,
    pause: null
  });
  const [test, setTest] = React.useState(null);
  
  function timeoutFunc() {
    setTime(playerRef.current.currentTime);
  }
  
  React.useEffect(async () => {
    const volumeIcon = await import('../assets/volume.svg');
    console.log(volumeIcon);
    setIcons((state) => {
      state.volume = volumeIcon;
      return Object.assign({}, state);
    });

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
        <button className="musicControlsButton" onClick={pauseClicked}><img src={pauseIcon} /></button>
      : 
        <button className="musicControlsButton" onClick={playClicked}><img src={playIcon} /></button>
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
        <button className="musicControlsButton" onClick={giveBackAudio}><img src={test} /></button>
      :
        <button className="musicControlsButton" onClick={muteAudio}><img src={icons.volume} /></button>
      }
    </>
  );
}
