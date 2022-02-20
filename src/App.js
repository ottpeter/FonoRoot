import React from 'react';
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './Frame/Layout';
import Admin from './Admin/Admin';
import NoPage from './NoPage';
import Main from './Main/Main';
import TopMenu from './Frame/TopMenu';
import MainTopMenu from './Main/TopMenu';
import Footer from './Frame/Footer';
import MainFooter from './Main/Footer';
import Message from './Activity/Message';
import Pending from './Activity/Pending';
import Ok from './Activity/Ok';
import Err from './Activity/Err';
import MyNFTs from './Main/MyNFTs';
import GuestBook from './Main/GuestBook';
import all from 'it-all';


export default function App() {
  //const [currentPage, setCurrentPage] = React.useState('main');
  //const [location, SetLocation] = React.useState("");
  const [urlParams, setUrlParams] = React.useState(window.location.search);
  const [configObj, setConfigObj] = React.useState({});
  const [actionHistory, setActionHistory] = React.useState([]);
  const [showActivity, setShowActivity] = React.useState(false);
  const [openGuestBook, setGuestBook] = React.useState(false);
  const [showWallet, setShowWallet] = React.useState(false);

  React.useEffect(() => {
    doUrlParamsParsing();
  }, []);

  React.useEffect(async () => {
    const fetchObj = await fetch(window.location.origin + window.location.pathname + '/' + 'projectConfig.json')
    .then((response) => response.json())
    .catch((err) => console.error("Error while fetching projectConfig.json: ", err));
    setConfigObj(fetchObj);
  }, [])
  
  function doUrlParamsParsing() {
    //SetLocation(window.location.pathname);
    //console.log("location: ", location);
    //console.log("urlParams: ", urlParams);
    setUrlParams(window.location.search);
    if (urlParams.includes('guestbook')) setGuestBook(true);
  }

  function initContract() {
    const args = {
      owner_id: process.env.CONTRACT_NAME || configObj.contractName,
      admin: configObj.admin || "lelenmar.testnet"
    }
    // This could be 'new' for user provided init
    window.contract.new_default_meta(args)
      .then((msg) => console.log("Initialized! ", msg))
      .catch((err) => console.error(err))
      .finally(() => console.log("end."));
  }
  
  function newAction(actionObj) {
    //FireToast conditionally
    if (actionObj.thePromise) {
      toast.promise(
        actionObj.thePromise,
        {
          pending: {
            render() {
              return <div className="toastMargin"><Message title={actionObj.pendingPromiseTitle} desc={actionObj.pendingPromiseDesc} /></div>;
            }, 
            icon: <Pending />
          },
          success: {
            render({data}) {
              console.log("data", data)
              return <div className="toastMargin"><Message title={actionObj.successPromiseTitle} desc={actionObj.successPromiseDesc} /></div>
            },
            icon: <Ok />
          },
          error: {
            render({data}) {
              console.log("data", data)
              return <div className="toastMargin"><Message title={actionObj.errorPromiseTitle} desc={actionObj.errorPromiseDesc} /></div>
            },
            icon: <Err />
          }
        },
      ) // We set the history messages here
        .then(() => setActionHistory((prevArray) => {
          prevArray.push({ successMsg: actionObj.successPromiseTitle, successMsgDesc: actionObj.successPromiseDesc });
          return [...prevArray];
        }))
        .catch(() => setActionHistory((prevArray) => {
          prevArray.push({errorMsg: actionObj.errorPromiseTitle, errorMsgDesc: actionObj.errorPromiseDesc});
          return [...prevArray];
        }))
    } else {
      if (actionObj.errorMsg) toast.warn(actionObj.errorMsg);
      if (actionObj.successMsg) toast.success(actionObj.successMsg);
      if (actionObj.infoMsg) toast.info(actionObj.infoMsg);

      setActionHistory((prevArray) => {
        prevArray.push(actionObj);
        return [...prevArray];
      });
    }
  }

  
  /** We use url params instead of routes, because the IPFS gateways would think that we are looking for a file */
  if (urlParams.includes('init')) {
    return configObj.admin? 
      <button onClick={initContract}>INIT</button>
    :
      <p>loading...</p>
    ;
  }
  if (urlParams.includes('admin')) {
    return (
      <>
        <ToastContainer hideProgressBar={true} position="bottom-right" transition={Slide} />
        <TopMenu setShowActivity={setShowActivity} showActivity={showActivity} actionHistory={actionHistory} 
          setShowWallet={setShowWallet} showWallet={showWallet} />
        <Admin newAction={newAction} />
        <Footer />
      </>
    );
  } 
  if (urlParams.includes('my-nfts')) {
    return (
      <>
        {openGuestBook && ( <GuestBook openModal={openGuestBook} newAction={newAction} setOpenModal={setGuestBook} /> )}
        <ToastContainer hideProgressBar={true} position="bottom-right" transition={Slide} />
        <MainTopMenu setShowActivity={setShowActivity} showActivity={showActivity} actionHistory={actionHistory} 
          setShowWallet={setShowWallet} showWallet={showWallet} changePage={doUrlParamsParsing} />
        <MyNFTs newAction={newAction} />
        <MainFooter openGuestBook={openGuestBook} setGuestBook={setGuestBook} />
      </>
    );
  } else {
    return (
      <>
        {openGuestBook && ( <GuestBook openModal={openGuestBook} newAction={newAction} setOpenModal={setGuestBook} /> )}
        <ToastContainer position="bottom-right" autoClose={5000} />
        <MainTopMenu setShowActivity={setShowActivity} showActivity={showActivity} actionHistory={actionHistory} 
          setShowWallet={setShowWallet} showWallet={showWallet} changePage={doUrlParamsParsing} />
        <Main newAction={newAction} configObj={configObj} openGuestBook={openGuestBook} setGuestBook={setGuestBook} />
        <MainFooter openGuestBook={openGuestBook} setGuestBook={setGuestBook} />
      </>
    );    
  }
}
