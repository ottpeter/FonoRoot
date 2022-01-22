import React from 'react';
import { Outlet, Link } from "react-router-dom";
import TopMenu from "./TopMenu";
import Footer from "./Footer";

export default function Layout() {
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