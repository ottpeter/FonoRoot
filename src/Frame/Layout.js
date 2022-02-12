import React from 'react';
import { Outlet, Link } from "react-router-dom";
import TopMenu from "./TopMenu";
import Footer from "./Footer";

export default function Layout() {
  // We are not using this 
  return(
    <>
      <TopMenu />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}