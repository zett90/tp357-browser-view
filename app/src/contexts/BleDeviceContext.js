
import React, { createContext, useCallback, useState } from 'react';
import { askForThermoProDevice } from '../utils/thermoPro';

const BleDeviceContext = createContext();

const BleContextProvider = ({ children }) => {
    // Add your provider logic here
    const placeHolderDevices = [

    ];

    const [devices, setDevices] = useState(placeHolderDevices);

    const handleUpdate = (device) => {
        setDevices(currentDevices => {
            const index = currentDevices.findIndex((d) => d.name === device.name);
            if (index > -1) {
                currentDevices[index] = device;
                console.log("handleUpdate for ", device.name, "found at index ", index);
                const newDevices = [...currentDevices];
                return newDevices;
            } else {
                console.log("handleUpdate for ", device.name, "not found");
                return currentDevices;
            }
        });
    }

    const startAddNewDevice = useCallback(async () => {
        const device = await askForThermoProDevice(devices);
        if(!device) {
            return;
        }
        device.onUpdate = handleUpdate;
        device.update();
        setDevices([...devices, device]);
    }, [devices, handleUpdate]);

    return (
        <BleDeviceContext.Provider value={{devices: devices, startAddNewDevice}}>
            {children}
        </BleDeviceContext.Provider>
    );
};

export { BleContextProvider, BleDeviceContext };



