import React, { useEffect, useMemo, useState } from 'react';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import SubgraphQueryEntry from './SubgraphQueryEntry';
import { IExecDataProtector } from "@iexec/dataprotector";
import IExecOrderModule from "iexec/IExecOrderModule"

interface BuildDefiHistoryProps {
    setErrorMessage: (message: string) => void;
}

const BuildDefiHistory = ({ setErrorMessage }: BuildDefiHistoryProps) => {
    const windowOverride: any = typeof window !== 'undefined' ? window : null;
    const [isEthereumAvailable, setIsEthereumAvailable] = useState(false);
    const [queryExecutionTriggered, setQueryExecutionTriggered] = useState<boolean>(false)
    const classes = useStyles();

    const subgraphsToCheck: any = [{ slug: "compound-v3-arbitrum", type: "lending" }, { slug: "compound-v3-ethereum", type: "lending" }, { slug: "aave-v3-arbitrum", type: "lending" }, { slug: "aave-v3-optimism", type: "lending" }, { slug: "aave-v3-polygon", type: "lending" }, { slug: "aave-v3-ethereum", type: "lending" }, { slug: "uniswap-v3-ethereum", type: "dex" }, { slug: "uniswap-v3-arbitrum", type: "dex" }, { slug: "uniswap-v3-polygon", type: "dex" }, { slug: "uniswap-v3-optimism", type: "dex" }, { slug: "sushiswap-v3-ethereum", type: "dex" }, { slug: "sushiswap-v3-arbitrum", type: "dex" }, { slug: "sushiswap-v3-polygon", type: "dex" }, { slug: "sushiswap-v3-optimism", type: "dex" }] //slugs of protocols whose subgraphs should have history checked for user
    const subgraphLoadedObj: any = {}
    subgraphsToCheck.forEach((x: any) => {
        subgraphLoadedObj[x.slug] = null;
    })
    const [subgraphsLoaded, setSubgraphsLoaded] = useState<any>(subgraphLoadedObj)
    const [totalCalculatedPrice, setTotalCalculatedPrice] = useState<number>(0)
    const [email, setEmail] = useState<String>("")

    useEffect(() => {
        if (typeof window !== 'undefined' && 'ethereum' in window) {
            setIsEthereumAvailable(true);
        }
    }, [])

    useEffect(() => {
        if (Object.values(subgraphsLoaded).find(x => x === null)) {
            // loading element
        } else {
            let totalCalculatedPriceTemp = 0
            Object.values(subgraphsLoaded).forEach((x: any) => {
                totalCalculatedPriceTemp += x
            })
            setTotalCalculatedPrice(totalCalculatedPriceTemp)
        }
    }, [subgraphsLoaded])

    const deployUserEmailData = async () => {
        try {
            // const dataProtector = new IExecDataProtector(windowOverride.ethereum);
            // const protectedData = await dataProtector.protectData({
            //     data: {
            //         email,
            //         whaleHarasser: true
            //     }
            // })

        } catch (err) {
            console.log(err)
        }
    }

    const getSubgraphData = async () => {
        const iExecInstance = new IExecOrderModule({ ethProvider: windowOverride.ethereum })
        const apporderTemplate = await iExecInstance.createRequestorder({ app: "0xD6cD8C017FB1dFF1C54fE9769C8D2C296996566c", category: 0, params: { iexec_args: 'hello world, 0x30CF84E121F2105e638746dCcCffebCE65B18F7C' } });
    }

    let button: React.JSX.Element = <Button disabled={!windowOverride?.ethereum?.selectedAddress} className={classes.depoButton} onClick={() => setQueryExecutionTriggered(true)}>View My DeFi History</Button>;
    if (queryExecutionTriggered) {
        button = <Typography variant="h4">DeFi Summary of {windowOverride?.ethereum?.selectedAddress}</Typography>
    }

    if (!isEthereumAvailable) {
        return <></>;
    }

    let buildDataButton = null;
    let totalCalculatedElement = null
    if (Object.values(subgraphsLoaded).find(x => x === null)) {
        // loading element
    } else {
        totalCalculatedElement = (<Typography style={{ marginTop: "15px", paddingBottom: "15px", borderBottom: "white 5px solid", width: "100%", color: "red" }} variant="h4">RLC per engagement: {totalCalculatedPrice}</Typography>)
        buildDataButton = (<>
            <span style={{ marginTop: "45px", marginBottom: "10px" }}>Add your email below to receive messages from marketers at a rate of {totalCalculatedPrice} RLC per message. Thanks to iExec DataProtector, your email stays secret. Using only your Ethereum address, marketers can send you quality, targeted emails for a price.</span>

            <TextField
                type="email"
                value={email}
                autoFocus
                onChange={(e: any) => setEmail(e.target.value)}
                className={classes.input}
            />
            <Button disabled={email ? false : true} className={classes.depoButton} onClick={() => deployUserEmailData()}>Authorize Emails</Button>
        </>);
    }

    let queryResultsDisplay = null;
    if (queryExecutionTriggered) {
        getSubgraphData()
        queryResultsDisplay = subgraphsToCheck.map((subgraph: any, index: number) => {
            return <SubgraphQueryEntry key={subgraph.slug + index} slug={subgraph.slug} connectedAddress={windowOverride.ethereum.selectedAddress} protocolType={subgraph.type} setLoaded={(calculatedPricePerEngage: Number) => {
                return setSubgraphsLoaded((prevState: any) => ({ ...prevState, [subgraph.slug]: calculatedPricePerEngage }))
            }} />
        })
        queryResultsDisplay = (<>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell style={{ color: 'red' }}>Protocol Name-Network</TableCell>
                            <TableCell style={{ color: 'red' }}>Current Position Balances</TableCell>
                            <TableCell style={{ color: 'red' }}>Maximum Historic Position</TableCell>
                            <TableCell style={{ color: 'red' }}>Cumulative Swap Volume</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {queryResultsDisplay}
                    </TableBody>
                </Table>
            </TableContainer>
            {totalCalculatedElement}
            {buildDataButton}
        </>)
    }

    return (
        <div className={classes.depo}>
            {button}
            {queryResultsDisplay}
        </div>
    );
};

const useStyles = makeStyles(() => ({
    depo: {
        width: "100%",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginTop: "25px"
    },
    input: {
        borderRadius: '4px',
        border: 'red 1px solid',
        marginBottom: '16px',
        width: '100%',
        '& .MuiOutlinedInput-adornment': {
            position: 'absolute',
            right: '0',
        },
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            border: 'none', // Remove inner blue border on input focus
        },
        '& input': {
            color: 'red', // Set font color to red
        },
    },

    inputText: {
        color: 'white',
    },
    depoButton: {
        border: 'red 2px solid',
        padding: "4px 20px",
        fontSize: "16px",
        borderRadius: '4px',
        backgroundColor: 'red',
        color: 'black',
        marginBottom: '16px',
        alignSelf: 'stretch',
        "&:disabled": {
            cursor: "none",
            backgroundColor: "white",

            border: "black 2px solid"
        },
        "&:hover": {
            color: 'red'
        }
    },
}));

export default BuildDefiHistory;