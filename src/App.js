import React from 'react';
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import Layout from './Layout';
import Admin from './Admin/Admin';
import NoPage from './NoPage';
import Main from './Main/Main';
import TopMenu from './TopMenu';
import Footer from './Footer';


export default function App() {
  const location = window.location.pathname;
  console.log("location: ", location);

  const urlParams = window.location.search;//new URLSearchParams(location.search);
  if (urlParams.includes('admin')) {
    return (
      <>
        <TopMenu />
        <main>
          <Admin />
        </main>
        <Footer />
      </>
    );
  } else {
    return (
      <>
        <TopMenu />
        <main>
          <Main />
        </main>
        <Footer />
      </>
    );    
  }

  console.log(urlParams)

  
  return (
    <BrowserRouter>
      <Routes>
        <Route path={location} element={<Layout />}>
          <Route index element={<Main />} />
          <Route path={"?admin"} element={<Admin />} />
          <Route path={"*"} element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
