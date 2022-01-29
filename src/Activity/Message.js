import React from 'react';

export default function Message({title, desc}) {
  console.log("title: ", title);
  console.log("desc: ", desc);

 
 return (
  <section>
    <p className="messageTitle">{title}</p>
    <p className="messageDesc">{desc}</p>
  </section>
  );
}
