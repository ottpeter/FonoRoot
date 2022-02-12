import React from 'react';
import Price from '../Common/Price';
import AudioPlayer from '../Common/AudioPlayer';

export default function PreviewBox({title, image, music, price}) {
  return (
    <div id="preview" className="preview">
      <section id="previewBox" className="previewBox">
        <div className="previewBoxItem">
          <img src={image.src} className="previewImage" />
        </div>
        <div className="previewBoxItem">
          <p id="previewBoxTitle" className="previewBoxTitle">{title}</p>
        </div>
        <div className="previewBoxItem">
          {image.name}
        </div>
        <div className="previewBoxItem">
          {music.name}
        </div>
        <div className="previewBoxItem">
          <AudioPlayer music={music.src} />
        </div>
        <div className="previewBoxItem">
          <Price price={price}/>
        </div>
      </section>
    </div>
  );
}
