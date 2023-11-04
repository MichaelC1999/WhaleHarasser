import React, { useState, useEffect } from 'react';
import { makeStyles } from '@mui/styles';
import BuildDefiHistory from './BuildDefiHistory';
import { Button, Typography } from '@mui/material';
import Marketer from './Marketer';

interface InteractionProps {
    setErrorMessage: (message: string) => void;
}

const Interaction = ({ setErrorMessage }: InteractionProps) => {
    const classes = useStyles();
    const [displayType, setDisplayType] = useState<"user" | "marketer">("user");

    const changeDisplay = () => {
        setDisplayType(displayType === "user" ? "marketer" : "user")
    }

    let display = null;
    if (displayType === "user") {
        display = (<>
            <div className={classes.headerContainer}>
                <span>Query your transaction history and get a quote on your data! WhaleHarasser checks historical DeFi Protocol data to get a detailed picture of how valuable you are as a DeFi consumer. After presenting you a quote, you can approve to be approached by DeFi marketers paying that quote each time!</span>
            </div>
            <BuildDefiHistory setErrorMessage={setErrorMessage} />
        </>)
    } else {
        display = <Marketer setErrorMessage={setErrorMessage} />
    }

    return (
        <div className={classes.interaction}>
            <Button className={classes.loadingButton} onClick={() => changeDisplay()}>Change To {displayType === "user" ? "marketer" : "user"}</Button>
            {display}
        </div>
    );
};

const useStyles = makeStyles(theme => ({
    interaction: {
        width: "100%",
        padding: "0px 30px 0px 0px",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    loadingButton: {
        border: 'red 2px solid',
        padding: "4px 20px",
        fontSize: "16px",
        borderRadius: '4px',
        backgroundColor: 'red',
        color: 'black',
        marginBottom: '36px',
        "&:disabled": {
            cursor: "none"
        },
        "&:hover": {
            color: 'red'
        }
    },
    headerContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        margin: "10px 0px"
    },

}))

export default Interaction;