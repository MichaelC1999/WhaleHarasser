import { CircularProgress, TableCell, TableRow } from "@mui/material";
import { ApolloClient, ApolloError, gql, HttpLink, InMemoryCache, useLazyQuery } from "@apollo/client";
import React, { useEffect, useMemo, useState } from "react";

function SubgraphQueryEntry({ slug, protocolType, connectedAddress, setLoaded }: any) {
    const [currentPositionBalState, setCurrentPositionBalState] = useState<any>({})
    const [maxPosSize, setMaxPosSize] = useState<any>(0)
    const [cumulativeSwapVol, setCumulativeSwapVol] = useState<any>(0)

    let queryURL = "https://api.thegraph.com/subgraphs/name/messari/" + slug;

    const client = useMemo(() => {
        return new ApolloClient({
            link: new HttpLink({
                uri: queryURL,
            }),
            cache: new InMemoryCache(),
        });
    }, [slug]);

    let queryMain = gql`
        query Positions($connectedAddress: String) {
            positions(where: {account: $connectedAddress}) {
              id
              balance
              asset {
                id
                name
                decimals
              }
              snapshots {
                timestamp
                balance
                balanceUSD
              }
              side
            }
          }`

    if (protocolType === "dex") {
        queryMain = gql`
          query Swaps($connectedAddress: String) {
            account(id: $connectedAddress) {
              swaps {
                amountInUSD
                amountOutUSD
              }
            }
          }`
    }

    const [getMainQueryData, { data, loading, error }] = useLazyQuery(queryMain, { variables: { connectedAddress }, client });

    useEffect(() => {
        getMainQueryData()
    }, [])

    useEffect(() => {
        if (data) {
            if (protocolType === "lending") {
                if (data?.positions?.length > 0) {
                    let currentPositionBalances: any = {};
                    let maximumPositionSize: any = 0;
                    data.positions.forEach((pos: any) => {
                        if (pos?.asset?.name && pos.side === "COLLATERAL") {
                            if (!currentPositionBalances[pos?.asset?.name]) {
                                currentPositionBalances[pos?.asset?.name] = 0
                            }
                            currentPositionBalances[pos?.asset?.name] += Number((Number(pos.balance) / (10 ** Number(pos?.asset?.decimals))).toFixed(4))
                            if (pos?.snapshots?.length > 0) {
                                pos?.snapshots?.forEach((snap: any) => {
                                    if (Number(snap.balanceUSD) > maximumPositionSize) {
                                        maximumPositionSize = Number(snap.balanceUSD);
                                    }
                                })
                            }
                        }
                    })
                    setCurrentPositionBalState(currentPositionBalances)
                    setMaxPosSize(maximumPositionSize)
                }
            } else if (protocolType === "dex") {
                if (data?.account?.swaps?.length > 0) {
                    // CHANGE THIS TO MAXIMUM POSITION SIZE
                    let cumulativeSwapVolume: any = 0;
                    data?.account?.swaps?.forEach((swap: any) => {
                        cumulativeSwapVolume += Number(swap.amountInUSD)
                    })
                    setCumulativeSwapVol(cumulativeSwapVolume)
                }
            }
        }
    }, [data, error])

    useEffect(() => {
        let calculatedPricePerEngage = 0;
        if (cumulativeSwapVol > 0 && cumulativeSwapVol < 10000) {
            calculatedPricePerEngage += .1
        } else if (cumulativeSwapVol >= 10000 && cumulativeSwapVol < 100000) {
            calculatedPricePerEngage += .6
        } else if (cumulativeSwapVol >= 100000 && cumulativeSwapVol < 1000000) {
            calculatedPricePerEngage += 1.2
        } else if (cumulativeSwapVol >= 1000000) {
            calculatedPricePerEngage += 2.5
        }

        if (maxPosSize > 0 && maxPosSize < 10000) {
            calculatedPricePerEngage += .1
        } else if (maxPosSize >= 10000 && maxPosSize < 100000) {
            calculatedPricePerEngage += .8
        } else if (maxPosSize >= 100000 && maxPosSize < 1000000) {
            calculatedPricePerEngage += 1.9
        } else if (maxPosSize >= 1000000) {
            calculatedPricePerEngage += 4.0
        }
        setLoaded(calculatedPricePerEngage)

    }, [cumulativeSwapVol, maxPosSize])

    let render = null;
    if (data) {
        render = (
            <TableRow>
                <TableCell style={{ color: 'red' }}>{slug.split("messari/").join("")}</TableCell>
                <TableCell style={{ color: 'red' }}>{Object.keys(currentPositionBalState).map(x => {
                    return x + ": " + currentPositionBalState[x]
                }).join(" // ")}</TableCell>
                <TableCell style={{ color: 'red' }}>${maxPosSize.toFixed(2)}</TableCell>
                <TableCell style={{ color: 'red' }}>${cumulativeSwapVol.toFixed(2)}</TableCell>
            </TableRow>
        );
    }
    return render;

}

export default SubgraphQueryEntry;
