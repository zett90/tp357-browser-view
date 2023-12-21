import React, { useContext } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, CircularProgress, Button, Grid } from '@mui/material';
import { BleDeviceContext } from '../contexts/BleDeviceContext';
import { AddDeviceButton } from './AddDeviceButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SDeviceBox } from './SDeviceBox';
import { NormalDeviceBox } from './NormalDeviceBox';
import { tr } from 'date-fns/locale';


const BleDeviceList = () => {
    const { devices } = useContext(BleDeviceContext);
    console.log("rerender list", devices);
    return (
        <Box sx={{ marginTop: 5 }}>
            {devices.map((device, index) => (
                <Accordion key={`${device.name}-${index}`}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        {device.loading ? <CircularProgress size={20} sx={{ marginRight: 2 }} /> : null}
                        <Typography>{device.displayName} - {device.temperature}°C - {device.humidity}%</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {device.isSDevice ? <SDeviceBox device={device} /> : <NormalDeviceBox device={device} />}
                    </AccordionDetails>
                </Accordion>
            ))}
            <AddDeviceButton sx={{ marginTop: 3 }} />
        </Box>
    );
};

export default BleDeviceList;
