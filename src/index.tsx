import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import App from './pages';
import { BrowserRouter } from "react-router-dom";
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './utils/msalConfig';

// // Helper function to clean up basename by removing trailing slashes
// const cleanBasename = (basename: string | undefined): string => {
//   if (!basename) return '/';
//   // Remove trailing slashes and ensure it starts with a single slash
//   return basename.replace(/\/+$/, '');
// };


const currentPath = window.location.pathname;
const baseUrl = window.location.origin;
const desiredBasename = process.env.REACT_APP_PUBLIC_URL || "";


if (currentPath === '/' && !window.location.href.includes(desiredBasename)) {
  window.location.replace(`${baseUrl}${desiredBasename}`);
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const msalInstance = new PublicClientApplication(msalConfig);


const basename = desiredBasename;

root.render(
  <MsalProvider instance={msalInstance}>  
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </MsalProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
