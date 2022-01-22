import React from 'react';
import { useLocation } from 'react-router-dom';


export default function NoPage() {
  const location = useLocation();
  console.log(location.pathname); // path is /contact

  return (
    <>
      404
      This is the current path: {location.pathname}
    </>
  )
}
