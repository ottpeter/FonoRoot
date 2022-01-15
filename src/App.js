import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from './Layout';
import Admin from './Admin/Admin';
import NoPage from './NoPage';
import Main from './Main/Main';
import './global.css';


export default function App() {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path={"/"} element={<Layout />}>
          <Route index element={<Main />} />
          <Route path={"admin"} element={<Admin />} />
          <Route path={"*"} element={<NoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
