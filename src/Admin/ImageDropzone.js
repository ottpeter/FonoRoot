import React from 'react';
import { useDropzone } from 'react-dropzone';

export default function ImageDropzone({ onDrop, accept }) {
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
          <p className="dropzone-content">Release to drop the file here</p>
        ) : (
          <p className="dropzone-content">DROPZONE FOR IMAGE</p>
        )}
      </div>
    </div>
  )
}
