import React from 'react';

export default function PreviewBox({title, image, price}) {
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
          <p id="previewBoxPrice" className="previewBoxPrice">{price} N</p>
        </div>
      </section>
    </div>
  );
}
