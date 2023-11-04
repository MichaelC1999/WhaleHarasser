const fsPromises = require("fs").promises;
const axios = require("axios");

(async () => {
    try {
        const iexecOut = process.env.IEXEC_OUT;

        // Append some results in /iexec_out/
        // Declare everything is computed
        const computedJsonObj = {
            "deterministic-output-path": `${iexecOut}/result.txt`,
        };

        const headers = {
            "content-type": "application/json",
        };
        const lendingQuery = {
            "operationName": "Positions",
            "query": `
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
            }`,
            "variables": { connectedAddress: process.argv[2] }

        };

        const dexQuery = {
            "operationName": "Swaps",
            "query": `
            query Swaps($connectedAddress: String) {
                account(id: $connectedAddress) {
                    swaps {
                        amountInUSD
                        amountOutUSD
                  }
                }
            }`,
            "variables": { connectedAddress: process.argv[2] }

        }
        // get endpoints as input/args, connectedAddress too
        const protocolsToQuery = [{ slug: "compound-v3-arbitrum", type: "lending" }, { slug: "compound-v3-ethereum", type: "lending" }, { slug: "aave-v3-ethereum", type: "lending" }, { slug: "aave-v3-polygon", type: "lending" }, { slug: "aave-v3-optimism", type: "lending" }, { slug: "aave-v3-arbitrum", type: "lending" }, { slug: "uniswap-v3-ethereum", type: "dex" }, { slug: "uniswap-v3-arbitrum", type: "dex" }, { slug: "uniswap-v3-polygon", type: "dex" }, { slug: "uniswap-v3-optimism", type: "dex" }, { slug: "sushiswap-v3-ethereum", type: "dex" }, { slug: "sushiswap-v3-arbitrum", type: "dex" }, { slug: "sushiswap-v3-polygon", type: "dex" }, { slug: "sushiswap-v3-optimism", type: "dex" }]
        const queryPromises = []
        protocolsToQuery.forEach(protocol => {
            const endpoint = "https://api.thegraph.com/subgraphs/name/messari/" + protocol.slug;
            const queryToUse = protocol.type === "lending" ? lendingQuery : dexQuery;

            const response = axios({
                url: endpoint,
                method: 'post',
                headers: headers,
                data: queryToUse
            });
            queryPromises.push(response)
        })

        const res = await Promise.all(queryPromises)
        const resObjects = (res.map(x => x.data.data))
        console.log(resObjects, process.argv)
        let currentPositionBalances = {};
        // CHANGE THIS TO MAXIMUM POSITION SIZE
        let maximumPositionSize = 0;
        let cumulativeSwapVolume = 0;

        resObjects.forEach(data => {
            if (data) {
                if (data.positions) {
                    if (data?.positions?.length > 0) {
                        data.positions.forEach((pos) => {
                            if (pos?.asset?.name && pos.side === "COLLATERAL") {
                                if (!currentPositionBalances[pos?.asset?.name]) {
                                    currentPositionBalances[pos?.asset?.name] = 0
                                }
                                currentPositionBalances[pos?.asset?.name] += Number((Number(pos.balance) / (10 ** Number(pos?.asset?.decimals))).toFixed(4))

                                if (pos?.snapshots?.length > 0) {
                                    pos?.snapshots?.forEach((snap) => {
                                        if (Number(snap.balanceUSD) > maximumPositionSize) {
                                            maximumPositionSize = Number(snap.balanceUSD);
                                        }
                                    })
                                }
                            }
                        })
                    }
                } else if (data.account) {
                    if (data?.account?.swaps?.length > 0) {
                        data?.account?.swaps?.forEach((swap) => {
                            cumulativeSwapVolume += Number(swap.amountInUSD)
                        })
                    }
                }
            }
        })
        console.log(cumulativeSwapVolume, maximumPositionSize, currentPositionBalances)
        let calculatedPricePerEngage = 0;
        if (cumulativeSwapVolume > 0 && cumulativeSwapVolume < 10000) {
            calculatedPricePerEngage += .1
        } else if (cumulativeSwapVolume >= 10000 && cumulativeSwapVolume < 100000) {
            calculatedPricePerEngage += .6
        } else if (cumulativeSwapVolume >= 100000 && cumulativeSwapVolume < 1000000) {
            calculatedPricePerEngage += 1.2
        } else if (cumulativeSwapVolume >= 1000000) {
            calculatedPricePerEngage += 2.5
        }

        if (maximumPositionSize > 0 && maximumPositionSize < 10000) {
            calculatedPricePerEngage += .1
        } else if (maximumPositionSize >= 10000 && maximumPositionSize < 100000) {
            calculatedPricePerEngage += .8
        } else if (maximumPositionSize >= 100000 && maximumPositionSize < 1000000) {
            calculatedPricePerEngage += 1.9
        } else if (maximumPositionSize >= 1000000) {
            calculatedPricePerEngage += 4.0
        }

        await fsPromises.writeFile(
            `${iexecOut}/computed.json`,
            JSON.stringify(computedJsonObj)
        );
        const returnObject = { protocolHistory: resObjects, cumulativeSwapVolume, maximumPositionSize, currentPositionBalances, calculatedPricePerEngage }
        console.log("DATA RETURNED", returnObject)
        await fsPromises.writeFile(`${iexecOut}/result.txt`, JSON.stringify(returnObject));
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
})();