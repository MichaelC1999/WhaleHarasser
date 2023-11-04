import React, { useState } from 'react';
import { Button, TextField, Select, MenuItem, Grid, Paper, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: "100%",
        margin: "20px 0px",
        padding: "10px"
    },
    input: {
        border: "red 1px solid",
        width: '100%',
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            border: 'none', // Remove inner blue border on input focus
        },
        '& input': {
            color: 'red', // Set font color to red
        },
    },
    select: {
        width: '100%',
        '& .MuiSelect-root': {
            color: 'red', // Set font color to red for the dropdown button
        },
        '& .MuiSelect-select:focus': {
            backgroundColor: 'transparent', // Remove blue background on focus
        },
        '& .MuiListItem-root.Mui-selected': {
            color: 'red', // Set font color to red for the selected option
        },
        '& .MuiSelect-select': {
            color: 'red'
        },
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            border: 'none', // Remove inner blue border on input focus
        },
        '& .MuiPopover-paper': {
            top: 'calc(100% + 12px)', // Offset the dropdown by 12px below the Select input
            maxHeight: '200px', // Set a maximum height for the dropdown
            overflowY: 'auto', // Enable vertical scrolling when the content exceeds the maximum height

            zIndex: 1301, // Adjust z-index to ensure the dropdown is displayed above other elements
        },
        border: "red solid 1px"
    },
    button: {
        width: '50%',
        border: '1px solid red',
        margin: "30px",
        color: 'black',
        backgroundColor: "red",
        "&:hover": {
            color: 'red',
            backgroundColor: "black",
        }

    },
}));
const Criteria = ({ criteria, passCriteria, hasUserMetrics }: any) => {
    const classes = useStyles(); // Use the makeStyles hook to access the defined styles

    const [field, setField] = useState('');
    const [number, setNumber] = useState('');
    const [multiSelect, setMultiSelect] = useState([]);


    const handleFieldChange = (event: any) => {
        setField(event.target.value);
    };

    const handleNumberChange = (event: any) => {
        setNumber(event.target.value);
    };

    const handleMultiSelectChange = (event: any) => {
        setMultiSelect(event.target.value);
    };

    const handleAddCriteria = () => {
        const newCriteria = {
            field,
            protocols: multiSelect,
            value: Number(number),
        };

        const alreadyInState = criteria.findIndex((x: any) => x.field === field);
        if (alreadyInState === -1) {
            passCriteria([...criteria, newCriteria]);
        } else {
            const updatedCriteria = [...criteria];
            updatedCriteria.splice(alreadyInState, 1);
            passCriteria([...updatedCriteria, newCriteria]);
        }
        setField('');
        setNumber('');
        setMultiSelect([])
    };

    const handleRemoveCriteria = (index: number) => {
        const updatedCriteria = [...criteria];
        updatedCriteria.splice(index, 1);
        passCriteria(updatedCriteria);
    };

    if (hasUserMetrics) {
        const arrayOfCriteria = (criteria.map((item: any, index: number) => {
            if (!item) {
                return null
            }
            return (
                <Paper key={index} elevation={3} style={{ padding: '8px', margin: '8px 0px' }}>
                    <Typography variant="subtitle1">
                        Users with {item.field} greater than {item.value} on protocols {item.protocols?.join(", ")}
                    </Typography>
                </Paper>
            )
        }))
        arrayOfCriteria.unshift(<Paper key={"test1"} elevation={3} style={{ padding: '8px', margin: '8px 0px' }}>
            <Typography variant="subtitle1">
                Users who have connected their Ethereum Address to an Email on WhaleHarasser
            </Typography>
        </Paper>)
        return (
            <div className={classes.container}>
                <Grid container spacing={2} alignItems="center">
                    <div>
                        <div style={{ borderTop: "3px white solid", width: "100%", paddingTop: "12px" }}>
                            <Typography variant="h4" style={{ color: "red" }}>User Criteria:</Typography>
                        </div>
                        {arrayOfCriteria}
                    </div>
                </Grid>
            </div>
        )
    }

    return (
        <div className={classes.container}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={4}>
                    <span>User has a ...</span>
                    <Select
                        value={field}
                        onChange={handleFieldChange}
                        className={classes.select}
                    >
                        <MenuItem value="Cumulative Swap Volume">Cumulative Swap Volume</MenuItem>
                        <MenuItem value="Max Historic Position Size">Max Historic Position Size</MenuItem>
                        <MenuItem value="Current Positions Amount">Current Positions Amount</MenuItem>
                    </Select>
                </Grid>
                <Grid item xs={4}>
                    <span>among protocols ...</span>
                    <Select
                        value={multiSelect}
                        onChange={handleMultiSelectChange}
                        multiple
                        className={classes.select}
                        MenuProps={{
                            disableScrollLock: true,
                        }}
                    >
                        <MenuItem value="compound-v3-ethereum">compound-v3-ethereum</MenuItem>
                        <MenuItem value="compound-v3-arbitrum">aave-v3-arbitrum</MenuItem>
                        <MenuItem value="aave-v3-ethereum">aave-v3-ethereum</MenuItem>
                        <MenuItem value="aave-v3-optimism">aave-v3-optimism</MenuItem>
                        <MenuItem value="aave-v3-polygon">aave-v3-polygon</MenuItem>
                        <MenuItem value="aave-v3-arbitrum">aave-v3-arbitrum</MenuItem>
                        <MenuItem value="uniswap-v3-ethereum">uniswap-v3-ethereum</MenuItem>
                        <MenuItem value="uniswap-v3-arbitrum">uniswap-v3-arbitrum</MenuItem>
                        <MenuItem value="uniswap-v3-polygon">uniswap-v3-polygon</MenuItem>
                        <MenuItem value="uniswap-v3-optimism">uniswap-v3-optimism</MenuItem>
                        <MenuItem value="sushiswap-v3-arbitrum">sushiswap-v3-arbitrum</MenuItem>
                        <MenuItem value="sushiswap-v3-polygon">sushiswap-v3-polygon</MenuItem>
                        <MenuItem value="sushiswap-v3-ethereum">sushiswap-v3-ethereum</MenuItem>
                        <MenuItem value="sushiswap-v3-optimism">sushiswap-v3-optimism</MenuItem>
                    </Select>
                </Grid>
                <Grid item xs={4}>
                    <span>with a value higher than... </span>

                    <TextField
                        type="number"
                        value={number}
                        onChange={handleNumberChange}
                        className={classes.input}
                    />
                </Grid>

            </Grid>
            <Button
                variant="contained"
                color="primary"
                onClick={handleAddCriteria}
                className={classes.button}
            >
                Add Criteria
            </Button>

            <div>
                {criteria.map((item: any, index: number) => {
                    if (!item) {
                        return null
                    }
                    return (
                        <Paper key={index} elevation={3} style={{ padding: '8px', margin: '8px' }}>
                            <Typography variant="subtitle1">
                                Users with {item.field} greater than {item.value} on protocols {item.protocols?.join(", ")}
                            </Typography>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => handleRemoveCriteria(index)}
                            >
                                Remove
                            </Button>
                        </Paper>
                    )
                })}
            </div>
        </div>
    );
};


export default Criteria;
