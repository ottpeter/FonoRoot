import React from 'react';
import { useDropzone } from 'react-dropzone';
import uploadLogo from '../assets/Upload.svg';

export default function MediaDropzone({ onDrop, accept }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept
  });

  const getClassName = (className, isActive) => {
    if (!isActive) return className;
    return `${className} ${className}-active`;
  };


  return (
    <div {...getRootProps()}>
      <input className={getClassName("dropzone", isDragActive)} {...getInputProps()} />
      <div className="text-center">
        {isDragActive ? (
          <div className="imageDropZone">
            <img src={uploadLogo}></img>
          </div>
        ) : (
          <div className="imageDropZone imageDropZoneActive">
            <img src={uploadLogo}></img>
          </div>
        )}
      </div>
    </div>
  )
}
