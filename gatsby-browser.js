// import "@fontsource/fira-code";
import "@fontsource/jetbrains-mono";
// import "@fontsource/rubik";
import "@fontsource/ibm-plex-sans-condensed";

import '@carbonplan/components/globals.css';
import '@carbonplan/components/fonts.css';

import React from "react";
import { HelmetProvider } from "react-helmet-async";

export const wrapRootElement = ({ element }) => {
  return <HelmetProvider>{element}</HelmetProvider>;
};