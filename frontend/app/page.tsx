"use client"

import React, { useEffect, useMemo, useState } from "react";
import { Button, Container, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Interaction from "./components/Interaction";
import { NetworkSwitcher } from "./components/NetworkSwitcher";
import { ethers } from "ethers";
import ConnectButton from "./components/ConnectButton";
import ErrorPopup from "./components/ErrorPopup";
import { Fade } from '@mui/material';


const HomePage = () => {
  const windowOverride: any = typeof window !== 'undefined' ? window : null;
  const bridgingConduitAddress: string = process.env.NEXT_PUBLIC_CONDUIT_ADDRESS || "";
  const [connected, setConnected] = useState<Boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [currentProtocolSlug, setCurrentProtocolSlug] = useState("");
  const [currentPoolId, setCurrentPoolId] = useState("");
  const [currentStrategy, setCurrentStrategy] = useState("");
  const [showMovePropose, setShowMovePropose] = useState(false);

  const classes = useStyles({ connected });

  useEffect(() => {
    // Initialize the injected provider event listeners to execute behaviors if account/chain/unlock changes in Metamask 
    windowOverride?.ethereum?.on("chainChanged", () => {
      if (typeof window !== 'undefined') {
        return window.location.reload();
      }
    });
    windowOverride?.ethereum?.on("accountsChanged", () => {
      if (windowOverride?.ethereum?.selectedAddress) {
        setConnected(true);
      }
    });
    checkUnlock();
  }, [])

  // const provider: ethers.BrowserProvider = useMemo(() => {
  //   return new ethers.BrowserProvider(windowOverride?.ethereum);
  // }, [windowOverride]);

  const checkUnlock = async () => {
    const isUnlocked = await windowOverride?.ethereum?._metamask?.isUnlocked();
    setConnected(isUnlocked);
  }

  return (
    <Fade in appear timeout={1500}>
      <div className={classes.root}>
        <NetworkSwitcher />
        <ErrorPopup errorMessage={errorMessage} errorMessageCallback={() => setErrorMessage("")} />
        <div className={classes.buttonDiv}>
          <ConnectButton connected={connected} setErrorMessage={(msg: string) => setErrorMessage(msg)} />
        </div>
        <Container maxWidth="lg" className={classes.contentContainer}>
          <Typography className={classes.header}>
            WhaleWhisper Protocol
          </Typography>

          <div className={classes.childContainer}>

            <Interaction setErrorMessage={(msg: string) => setErrorMessage(msg)} />
          </div>
        </Container>
      </div>
    </Fade>
  );
};

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%",
    height: "100%",
    minHeight: "100vh",
    backgroundColor: "black",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center center",
  },
  buttonDiv: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "16px"
  },
  toggleButton: {
    border: 'red 2px solid',
    padding: "4px 20px",
    fontSize: "16px",
    borderRadius: '4px',
    backgroundColor: 'red',
    color: 'black',
    marginBottom: '16px',
    alignSelf: 'stretch',
    "&:disabled": {
      cursor: "none"
    },
    "&:hover": {
      color: 'red'
    }
  },
  contentContainer: {
    marginLeft: "84px",
    width: "100%",
    marginTop: "32px"
  },
  header: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: "68px",
    marginBottom: "66px"
  },
  childContainer: {
    display: "flex",
    width: "100%",
    marginTop: "120px",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
}));

export default HomePage;
