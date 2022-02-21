import React from 'react';

export default function Message({title, desc}) {

 
  return (
    <section>
      <p className="messageTitle">{title}</p>
      <p className="messageDesc">{desc}</p>
    </section>
  );
}
