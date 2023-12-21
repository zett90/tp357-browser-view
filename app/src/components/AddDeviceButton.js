import React, { useContext } from 'react';
import { BleDeviceContext } from '../contexts/BleDeviceContext';
import Button from '@mui/material/Button';




const AddDeviceButton = ({...props}) => {
    const {startAddNewDevice} = useContext(BleDeviceContext);
    const [loading, setLoading] = React.useState(false);

    const handleAddDevice = async () => {
        setLoading(true);
        // Add device logic here
        await startAddNewDevice()
        setLoading(false);
    };

    return (
        <Button onClick={handleAddDevice} variant="contained" disabled={loading} {...props}>Gerät hinzufügen</Button>
    );
};

export {AddDeviceButton};


