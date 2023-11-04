import { ApolloClient, ApolloError, gql, HttpLink, InMemoryCache, useLazyQuery, useQuery } from "@apollo/client";

import { useEffect, useMemo, useState } from "react";



function GetMatchedUsers({ users, slug, protocolType, updateUserMetrics }: any) {

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
    query Positions($users: [String!]) {
        positions(where: {account_in: $users}, first: 1000) {
          account {
            id
          }
            balance
          asset {
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
        query Swaps($users: [String!]) {
            swaps(where: {account_in: $users}) {
              account {
                id
              }
              amountInUSD
              amountOutUSD
            }
          }`
  }

  const [getMainQueryData, { data, loading, error }] = useLazyQuery(queryMain, { variables: { users }, client });

  useEffect(() => {
    getMainQueryData()
  }, [])

  useEffect(() => {
    console.log(data, error, users)
    // Process the data according to criteria
    const userData: any = {}
    const usersMetricValues: any = {}

    let fieldKey = "positions"
    if (protocolType === "dex") {
      fieldKey = "swaps"
    }
    data?.[fieldKey]?.forEach((x: any) => {
      const user = x?.account?.id;
      if (!Object.keys(userData).includes(user)) {
        userData[user] = []
      } else {
        userData[user].push(x)
      }
    })

    if (protocolType === "lending") {
      Object.keys(userData).forEach((user: any) => {
        usersMetricValues[user] = { maximumPositionSize: 0 }
        userData[user].forEach((pos: any) => {
          pos?.snapshots?.forEach((snap: any) => {
            if (Number(snap.balanceUSD) > usersMetricValues[user]["maximumPositionSize"]) {
              usersMetricValues[user]["maximumPositionSize"] = Number(snap.balanceUSD);
            }
          })
        })
      })
    } else {
      Object.keys(userData).forEach((user: any) => {
        usersMetricValues[user] = { cumulativeSwapVolume: 0 }
        userData[user].forEach((swap: any) => {
          usersMetricValues[user]["cumulativeSwapVolume"] += Number(swap.amountInUSD)
        })
      })
    }
    updateUserMetrics(usersMetricValues)

  }, [data, error])

  return null;
}

export default GetMatchedUsers;
