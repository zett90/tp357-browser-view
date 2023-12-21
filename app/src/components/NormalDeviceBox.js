import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import React, { useRef } from "react";
import { getOptions } from "../utils/chartoptions";

export const NormalDeviceBox = ({ device }) => {
    const [renameActive, setRenameActive] = React.useState(false);
    const nameRef = useRef('')
    return (
        <Box sx={{ marginTop: 5 }}>
            <Grid container spacing={2} sx={{ marginTop: 2 }}>
                {renameActive && <Grid item xs={12}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <TextField label="Name" placeholder={device.name} inputRef={nameRef} />
                        <Button disabled={device.loading} variant="contained" color="primary" sx={{ marginLeft: 2 }} onClick={() => {
                            device.setName(nameRef.current.value);
                            setRenameActive(false);
                        }}>Speichern</Button>
                    </Box>
                </Grid>}
                <Grid item>
                    <Button disabled={device.loading} variant="contained" color="primary" onClick={() => {
                        device.update();
                    }}>Aktualisieren</Button>
                </Grid>
                <Grid item>
                    <Button disabled={device.loading} variant="contained" color="primary" onClick={() => {
                        device.updateDayHistory();
                    }}>Tagesverlauf Aktualisieren</Button>
                </Grid>
                <Grid item>
                    <Button disabled={device.loading} variant="contained" color="primary" onClick={() => setRenameActive(true)} >Umbenennen</Button>
                </Grid>
            </Grid>
            <Box>
                <Typography sx={{ marginTop: 2 }} variant="h4" >1 Tag</Typography>
                <Typography sx={{ marginTop: 2 }}>Verlauf Temperatur</Typography>
                <Line
                    datasetIdKey='id'
                    options={getOptions('°C')}
                    data={{
                        labels: device.dayHistoryData?.map((dataPoint) => dataPoint.date),
                        datasets: [
                            {
                                id: 'temperature',
                                label: 'Temperatur',
                                data: device.dayHistoryData?.map((dataPoint) => dataPoint.temperature),
                                fill: false,
                                backgroundColor: 'rgb(54, 162, 235)',
                                borderColor: 'rgba(54, 162, 235, 0.2)',
                            },
                        ],
                    }}
                />
                <Typography sx={{ marginTop: 2 }}>Verlauf Luftfeuchtigkeit</Typography>
                <Line
                    datasetIdKey='id'
                    options={getOptions('%')}
                    data={{
                        labels: device.dayHistoryData?.map((dataPoint) => dataPoint.date),
                        datasets: [
                            {
                                id: 'humidity',
                                label: 'Luftfeuchtigkeit',
                                data: device.dayHistoryData?.map((dataPoint) => dataPoint.humidity),
                                fill: false,
                                backgroundColor: 'rgb(255, 99, 132)',
                                borderColor: 'rgba(255, 99, 132, 0.2)',
                            },
                        ],
                    }}
                />

            </Box>
            <Grid container spacing={2} sx={{ marginTop: 2 }}>
                <Grid item>
                    <Button disabled={device.loading} variant="contained" color="primary" onClick={() => {
                        device.updateWeekHistory();
                    }}>Wochenverlauf Aktualisieren</Button>
                </Grid>
            </Grid>
            <Box>
                <Typography sx={{ marginTop: 2 }} variant="h4">1 Woche</Typography>
                <Typography sx={{ marginTop: 2 }}>Verlauf Temperature</Typography>
                <Line
                    datasetIdKey='id'
                    options={getOptions('°C')}
                    data={{
                        labels: device.weekHistoryData?.map((dataPoint) => dataPoint.date),
                        datasets: [
                            {
                                id: 'temperature',
                                label: 'Temperatur',
                                data: device.weekHistoryData?.map((dataPoint) => dataPoint.temperature),
                                fill: false,
                                backgroundColor: 'rgb(54, 162, 235)',
                                borderColor: 'rgba(54, 162, 235, 0.2)',
                            },
                        ],
                    }}
                />
                <Typography sx={{ marginTop: 2 }}>Verlauf Luftfeuchtigkeit</Typography>
                <Line
                    datasetIdKey='id'
                    options={getOptions('%')}
                    data={{
                        labels: device.weekHistoryData?.map((dataPoint) => dataPoint.date),
                        datasets: [
                            {
                                id: 'humidity',
                                label: 'Luftfeuchtigkeit',
                                data: device.weekHistoryData?.map((dataPoint) => dataPoint.humidity),
                                fill: false,
                                backgroundColor: 'rgb(255, 99, 132)',
                                borderColor: 'rgba(255, 99, 132, 0.2)',
                            },
                        ],
                    }}
                />

            </Box>
        </Box>
    )
}