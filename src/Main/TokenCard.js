import React from 'react';


export default function TokenCard({id, owner, title, desc}) {
  console.log(id)
  console.log(owner)
  console.log(title)
  console.log(desc)
  
  return (
    <div>
      <button>
        {id}<br></br>
        {owner}<br></br>
        {title}<br></br>
        {desc}<br></br>
      </button>
    </div>
  )
}
