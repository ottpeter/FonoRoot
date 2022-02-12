import React from 'react';
import { useLocation } from 'react-router-dom';


export default function NoPage() {
  // This would only make sense if we would have a normal router (not url params)
  const location = useLocation();
  console.log(location.pathname); // path is /contact

  return (
    <>
      404
      This is the current path: {location.pathname}
    </>
  )
}
