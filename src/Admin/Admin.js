import React, { useState, useCallback } from 'react';
import ImageDropzone from './ImageDropzone';
import MusicDropzone from './MusicDropzone';
import { mintRootNFT } from '../utils';

// cuid is a simple library to generate unique IDs
import cuid from "cuid";


export default function Admin() {
  const [title, setTitle] = useState("theTitle");
  const [desc, setDesc] = useState("This theTitl the desc");
  const [price, setPrice] = useState(0);
  
  // For the image
  const [image, setImage] = useState({});                     // This will store actual data
  const [imageCID, setImageCID] = useState("Qmc7CvMB8VnUqv6KRqQokqJoHVDcsmQvNdRwgJysJJVvAa");
  const [imageHash, setImageHash] = useState("34f2da457c32e30c251a8239ef9b7e7b2d4d1e87864029d1b7f44e3d2bac4e3f");
  
  // For the music
  const [music, setMusic] = useState({});                     // This will store actual data
  const [musicCID, setMusicCID] = useState("QmU51uX3B44Z4pH2XimaJ6eScRgAzG4XUrKfsz1yWVCo6f");
  const [musicHash, setMusicHash] = useState("96e8eb14216d03a8131ed8c561a82af25daf5786b53de4e304b133fe014eaf8d");

  
  const onDropImage = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];                            // We can only accept 1 file
    const reader = new FileReader();
    reader.onload = function(e) {                             // onload callback gets called after the reader reads the file data
      setImage({ id: cuid(), src: e.target.result });
    };
    reader.readAsDataURL(file);                               // Read the file as Data URL (since we accept only images)
    return file;
  }, []);

  const onDropMusic = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];                            // We can only accept 1 file
    const reader = new FileReader();
    reader.onload = function(e) {                             // onload callback gets called after the reader reads the file data
      setMusic({ id: cuid(), src: e.target.result });
    }
    reader.readAsDataURL(file);                               // Read the file as Data URL (since we accept only images)
    return file;
  })


  return (
    <div>
      <h1>Admin.</h1>
      
      <input type={"text"} value={title} onChange={(e) => setTitle(e.target.value)} /><br></br>
      <input type={"textarea"} value={desc} onChange={(e) => setDesc(e.target.value)} /><br></br>
      
      <ImageDropzone onDrop={onDropImage} accept={"image/*"} />
      <img alt={`img - ${image.id}`} src={image.src} className="file-img" />      
      
      <MusicDropzone onDrop={onDropMusic} accept={"audio/*"} multiple={false} /><br></br>
      <input type={"number"} min={0} value={price} onChange={(e) => setPrice(e.target.value)} /><br></br>
      
      <button onClick={() => mintRootNFT(title, desc, imageCID, imageHash, musicCID, musicHash)}>CREATE</button>
    </div>
  )
}
