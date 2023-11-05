import React, { useEffect, useMemo, useState } from 'react';
import { Button, CircularProgress, IconButton, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { IExecDataProtector } from "@iexec/dataprotector";
import { IExecWeb3mail } from "@iexec/web3mail";
import Criteria from './Criteria';
import GetMatchedUsers from './GetMatchedUsers';

interface MarketerProps {
    setErrorMessage: (message: string) => void;
}

const Marketer = ({ setErrorMessage }: MarketerProps) => {
    const windowOverride: any = typeof window !== 'undefined' ? window : null;

    const [isEthereumAvailable, setIsEthereumAvailable] = useState(false);
    const classes = useStyles();

    const subgraphsToCheck: any = [{ slug: "compound-v3-arbitrum", type: "lending" }, { slug: "compound-v3-ethereum", type: "lending" }, { slug: "aave-v3-arbitrum", type: "lending" }, { slug: "aave-v3-polygon", type: "lending" }, { slug: "aave-v3-optimism", type: "lending" }, { slug: "aave-v3-ethereum", type: "lending" }, { slug: "uniswap-v3-ethereum", type: "dex" }, { slug: "uniswap-v3-arbitrum", type: "dex" }, { slug: "uniswap-v3-polygon", type: "dex" }, { slug: "uniswap-v3-optimism", type: "dex" }, { slug: "sushiswap-v3-ethereum", type: "dex" }, { slug: "sushiswap-v3-arbitrum", type: "dex" }, { slug: "sushiswap-v3-polygon", type: "dex" }, { slug: "sushiswap-v3-optimism", type: "dex" }] //slugs of protocols whose subgraphs should have history checked for user
    const subgraphLoadedObj: any = {}
    subgraphsToCheck.forEach((x: any) => {
        subgraphLoadedObj[x.slug] = false;
    })
    const [subgraphsLoaded, setSubgraphsLoaded] = useState<any>(subgraphLoadedObj)
    const [accessibleUsers, setAccessibleUsers] = useState<string[]>([])
    const [matchedUsers, setMatchedUsers] = useState<string[]>([])
    const [usersMetrics, setUsersMetrics] = useState<any>({})
    const [criteria, setCriteria] = useState<any>([])
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [emailsSent, setEmailsSent] = useState<string[]>([]);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'ethereum' in window) {
            setIsEthereumAvailable(true);
        }
    }, [])

    useEffect(() => {
        const matchedUsersLocal = Object.keys(usersMetrics).filter((userAddr: any) => {
            let matched = true;
            criteria.forEach((item: any) => {
                if (item.field === "Max Historic Position Size" && item.value > usersMetrics[userAddr].maximumPositionSize) {
                    matched = false;
                }
                if (item.field === "Cumulative Swap Volume" && item.value > usersMetrics[userAddr].cumulativeSwapVolume) {
                    matched = false;
                }
            })
            return matched
        })
        setMatchedUsers(matchedUsersLocal)
    }, [subgraphsLoaded])

    const emailMatchedUsers = async () => {
        // Take the selectedUsers in the state
        // Map through selectedUsers
        // Fetch the protected data by owner value 
        // marketer uploads the html content to be emailed 
        // Send the emails with the protected data hash

        // const dataProtector = new IExecDataProtector(windowOverride.ethereum);
        // const web3mail = new IExecWeb3mail(windowOverride.ethereum);
        // const ownerDataPromises = selectedUsers.map(user => {
        //     return (dataProtector.fetchProtectedData({
        //         owner: user
        //     }))
        // })
        // const protectedDataAddresses = (await Promise.all(ownerDataPromises)).map(x => x[0].address) //From this extract the data addresses
        // const emailPromises = protectedDataAddresses.map(addr => {
        //     return web3mail.sendEmail({
        //         protectedData: addr,
        //         emailSubject: 'Hello Whale',
        //         emailContent: 'Shilling my new project'
        //     })
        // })
        // await Promise.all(emailPromises)

        // put in dummy email sent behavior
        setEmailsSent(selectedUsers)
    }

    const handleTableRowClick = (user: string) => {
        // Check if the user is already selected, and add or remove them from the selectedUsers state.
        if (selectedUsers.includes(user)) {
            setSelectedUsers(selectedUsers.filter((userAddr) => userAddr !== user));
        } else {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    const fetchAllUsers = async () => {
        try {
            // fetchProtectedData with the special metadata schema
            // const dataProtector = new IExecDataProtector(windowOverride.ethereum);
            // const usersMetaData =  = await dataProtector.fetchProtectedData({
            //     schema: {
            //         "email": "string",
            //         "whaleHarasser": "boolean"
            //     }
            // })

            // dummy protected data return
            const usersMetaData = [
                {
                    name: 'Whale 1',
                    address: '0xb865f760b9b8ca1627af371d32b10e8c22c56bf9',
                    owner: '0x1CA2b10c61D0d92f2096209385c6cB33E3691b5E',
                    creationTimestamp: 1687528535,
                    schema: {
                        "email": "string",
                        "whaleHarasser": "boolean"
                    }
                },
                {
                    name: 'Whale 2',
                    address: '0xb865f760b9b8ca1627af371d32b10e8c22c56bf9',
                    owner: '0xF80cAb395657197967EaEdf94bD7f8a75Ad8F373',
                    creationTimestamp: 1687528535,
                    schema: {
                        "email": "string",
                        "whaleHarasser": "boolean"
                    }
                },
                {
                    name: 'Whale 3',
                    address: '0xb865f760b9b8ca1627af371d32b10e8c22c56bf9',
                    owner: '0x30CF84E121F2105e638746dCcCffebCE65B18F7C',
                    creationTimestamp: 1687528535,
                    schema: {
                        "email": "string",
                        "whaleHarasser": "boolean"
                    }
                }
            ];

            const users = usersMetaData.map(x => x.owner);
            setAccessibleUsers(users)
        } catch (err) {
            console.log(err)
        }
    }

    if (!isEthereumAvailable) {
        return <></>;
    }

    let findUserButton = null;
    if (Object.values(subgraphsLoaded).find(x => !x)) {
        // loading element
    } else if (accessibleUsers.length === 0) {
        findUserButton = <Button className={classes.depoButton} disabled={criteria.length === 0 || Object.keys(usersMetrics)?.length > 0} onClick={() => fetchAllUsers()}>Find Users</Button>;
    }

    let usersComponent = null;
    if (accessibleUsers.length > 0) {
        usersComponent = subgraphsToCheck.map((x: any) => {
            return <GetMatchedUsers
                key={x.slug}
                users={accessibleUsers}
                slug={x.slug}
                protocolType={x.type}
                updateUserMetrics={(usersMetrics: any) => {
                    setSubgraphsLoaded((prevState: any) => ({ ...prevState, [x.slug]: true }))
                    return setUsersMetrics((prevState: any) => {
                        const users = Object.keys(usersMetrics)
                        const stateToSet = { ...prevState }
                        users.forEach((user: any) => {
                            if (!Object.keys(stateToSet).includes(user)) {
                                stateToSet[user] = { maximumPositionSize: 0, cumulativeSwapVolume: 0 }
                            }
                            if ((!stateToSet[user]?.maximumPositionSize || usersMetrics[user]?.maximumPositionSize > stateToSet[user]?.maximumPositionSize) && usersMetrics[user]?.maximumPositionSize > 0) {
                                stateToSet[user].maximumPositionSize = usersMetrics[user]?.maximumPositionSize
                            }

                            if (usersMetrics[user]?.cumulativeSwapVolume > 0) {
                                stateToSet[user].cumulativeSwapVolume += usersMetrics[user]?.cumulativeSwapVolume
                            }
                        })
                        return stateToSet;
                    })
                }} />
        })
    }


    let usersTable = null
    let introHeader = null
    if (Object.keys(usersMetrics)?.length > 0) {
        usersTable = Object.keys(usersMetrics).filter((userAddr: any) => {
            let matched = true;
            criteria.forEach((item: any) => {
                if (item.field === "Max Historic Position Size" && item.value > usersMetrics[userAddr].maximumPositionSize) {
                    matched = false;
                }
                if (item.field === "Cumulative Swap Volume" && item.value > usersMetrics[userAddr].cumulativeSwapVolume) {
                    matched = false;
                }
            })
            return matched
        }).map((user: any, index: number) => {
            return (
                <TableRow key={user + index} style={{ border: selectedUsers.includes(user) ? "red 2px solid" : "none", padding: selectedUsers.includes(user) ? "0px" : "2px" }} onClick={() => handleTableRowClick(user)}>
                    <TableCell style={{ backgroundColor: selectedUsers.includes(user) ? "white" : "black", color: 'red' }}>{user}</TableCell>
                    <TableCell style={{ backgroundColor: selectedUsers.includes(user) ? "white" : "black", color: 'red' }}>${(usersMetrics[user].maximumPositionSize).toFixed(2)}</TableCell>
                    <TableCell style={{ backgroundColor: selectedUsers.includes(user) ? "white" : "black", color: 'red' }}>${(usersMetrics[user].cumulativeSwapVolume).toFixed(2)}</TableCell>
                </TableRow>
            )
        })
        if (usersTable.length === 0) {
            usersTable = <Typography variant="h3">No Found Matching Criteria With Email Approved</Typography>
        } else {
            usersTable = (<>
                <Typography variant="h3">Matching Users</Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ color: 'red' }}>User Address</TableCell>
                                <TableCell style={{ color: 'red' }}>Maximum Historic Position</TableCell>
                                <TableCell style={{ color: 'red' }}>Cumulative Swap Volume</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {usersTable}
                        </TableBody>
                    </Table>
                </TableContainer>
            </>)
        }
    } else {
        introHeader = (<>
            <Typography variant="h3">New Email Campaign</Typography>
            <div className={classes.headerContainer}>
                <span>Unlock high-quality users for your marketing campaign with WhaleHarasser. Our platform allows users to share their DeFi transaction history and provide their email. With this information, you can establish customized criteria to target users based on their transaction behavior and history. Once your audience has been selected, you can send them emails while compensating them for their engagement. Configure the parameters below to precisely tailor your marketing strategy:</span>
            </div>
        </>)
    }

    let emailElement = null
    if (Object.keys(usersMetrics)?.length > 0) {
        emailElement = <Button disabled={!(selectedUsers?.length > 0)} className={classes.depoButton} onClick={() => emailMatchedUsers()}>Email Selected Users</Button>
    }
    if (emailsSent?.length > 0) {
        emailElement = <Typography style={{ marginTop: "20px" }} variant="h5">Emails successfully sent to {emailsSent.join(", ")}</Typography>
    }

    return (<>
        {introHeader}
        <div className={classes.depo}>
            <Criteria criteria={criteria} passCriteria={(x: any) => setCriteria(x)} hasUserMetrics={Object.keys(usersMetrics)?.length > 0} />
            {findUserButton}
            {usersComponent}
            {usersTable}
            {emailElement}
        </div>
    </>);
};

const useStyles = makeStyles(() => ({
    depo: {
        width: "100%",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    input: {
        borderRadius: '4px',
        border: 'white 1px solid',
        marginBottom: '16px',
        width: '100%',
        '& .MuiOutlinedInput-adornment': {
            position: 'absolute',
            right: '0',
        },
    },
    inputText: {
        color: 'white',
    },
    headerContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        margin: "10px 0px"
    },
    depoButton: {
        border: 'red 2px solid',
        padding: "4px 20px",
        fontSize: "16px",
        borderRadius: '4px',
        backgroundColor: 'red',
        color: 'black',
        marginTop: "30px",

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
    customTooltip: {
        fontSize: "1.2rem",
        backgroundColor: "black",
        padding: "10px 15px",
    },
    loadingButton: {
        padding: "8px 20px",
        fontSize: "16px",
        borderRadius: '4px',
        backgroundColor: 'black',
        color: 'white',
        marginBottom: '16px',
        alignSelf: 'stretch',
        "&:disabled": {
            cursor: "not-allowed",
        },
        "&:hover": {
            color: 'red'
        },
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    spinner: {
        color: '#fff',
    },
}));

export default Marketer;