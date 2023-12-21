const maxConnectAttempts = 5;
const maxUpdateAttempts = 3;
const storageItemName = 'thermoProDevices';

const askForThermoProDevice = async (knownDevices = []) => {
    try {
        let exclusionFilters = knownDevices.map((device) => ({ name: device.name }));
        if (exclusionFilters.length === 0) {
            exclusionFilters = undefined
        }
        const bleDevice = await navigator.bluetooth.requestDevice({ filters: [{ namePrefix: "TP3" }], optionalServices: ['00010203-0405-0607-0809-0a0b0c0d1910'], exclusionFilters });
        const isSDevice = bleDevice.name.indexOf('TP357S') > -1

        //get deviceName from localStorage
        const deviceSettings = JSON.parse(localStorage.getItem(storageItemName) || '{}');
        const deviceSetting = deviceSettings[bleDevice.name];
        const displayName = deviceSetting?.displayName || bleDevice.name;

        const device = { name: bleDevice.name, displayName, temperature: 0, humidity: 0, loading: true, bleDevice, isSDevice, currentAction: 'idle', onUpdate: null };
        device.update = () => updateDevice(device);
        if (isSDevice) {
            device.updateHistory = () => updateHistory(device);
        }
        device.updateWeekHistory = () => updateWeekHistory(device);
        device.updateDayHistory = () => updateDayHistory(device);
        device.setName = (name) => {
            device.displayName = name;
            saveDeviceSettings(device);
            device?.onUpdate(device);
        }
        return device;
    } catch (error) {
        console.log("error", error.message);
        return null;
    }
}

const saveDeviceSettings = (device) => {
    const deviceSettings = JSON.parse(localStorage.getItem(storageItemName) || '{}');
    deviceSettings[device.bleDevice.name] = { displayName: device.displayName }
    localStorage.setItem(storageItemName, JSON.stringify(deviceSettings));
}

const updateHistory = async (device, currentRetry = 0) => {
    try {
        device.loading = true;
        device.currentAction = 'updateHistory';
        device?.onUpdate(device);
        await connectToDevice(device);
        const { characteristicWrite, characteristicRead } = await getCharacteristics(device);
        characteristicRead.oncharacteristicvaluechanged = (event) => handleUpdate(device, event);
        characteristicRead.startNotifications();
        const historySendData = getHistorySendData(device);
        device.historyData = [];
        device.rawData = [];
        await characteristicWrite.writeValueWithoutResponse(historySendData);
    } catch (error) {
        if (currentRetry < maxUpdateAttempts) {
            console.log("retry updateHistory", currentRetry);
            await updateHistory(device, currentRetry + 1);
        } else {
            device.loading = false;
            device.currentAction = 'idle';
            device?.onUpdate(device);
            console.log("updateHistory failed", error.message);
        }

    }
}

const updateWeekHistory = async (device, currentRetry = 0) => {
    try {
        device.loading = true;
        device.currentAction = 'updateHistory';
        device?.onUpdate(device);
        await connectToDevice(device);
        const { characteristicWrite, characteristicRead } = await getCharacteristics(device);
        characteristicRead.oncharacteristicvaluechanged = (event) => handleUpdate(device, event);
        characteristicRead.startNotifications();
        const historySendData = new Uint8Array([166, 106]);
        device.parseWeekHistoryData = [];
        device.rawData = [];
        await characteristicWrite.writeValueWithoutResponse(historySendData);
    } catch (error) {
        if (currentRetry < maxUpdateAttempts) {
            console.log("retry updateHistory", currentRetry);
            await updateHistory(device, currentRetry + 1);
        } else {
            device.loading = false;
            device.currentAction = 'idle';
            device?.onUpdate(device);
            console.log("updateHistory failed", error.message);
        }

    }
}

const updateDayHistory = async (device, currentRetry = 0) => {
    try {
        device.loading = true;
        device.currentAction = 'updateHistory';
        device?.onUpdate(device);
        await connectToDevice(device);
        const { characteristicWrite, characteristicRead } = await getCharacteristics(device);
        characteristicRead.oncharacteristicvaluechanged = (event) => handleUpdate(device, event);
        characteristicRead.startNotifications();
        const historySendData = new Uint8Array([167, 122]);
        device.dayHistoryData = [];
        device.rawData = [];
        await characteristicWrite.writeValueWithoutResponse(historySendData);
    } catch (error) {
        if (currentRetry < maxUpdateAttempts) {
            console.log("retry updateHistory", currentRetry);
            await updateHistory(device, currentRetry + 1);
        } else {
            device.loading = false;
            device.currentAction = 'idle';
            device?.onUpdate(device);
            console.log("updateHistory failed", error.message);
        }

    }

}

const getHistorySendData = (device) => {
    const datapoints = 60 * 24 * 7;
    const data = [1, 9, 0, 0, 0]
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const currentDay = new Date().getDate();
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();
    const currentSecond = new Date().getSeconds();
    data.push(currentYear - 2000);
    data.push(currentMonth);
    data.push(currentDay);
    data.push(currentHour);
    data.push(currentMinute);
    data.push(currentSecond);
    data.push(datapoints % 256);
    data.push(Math.floor(datapoints / 256));
    const checksum = data.reduce((sum, value) => sum + value, 0);
    data.push(checksum);
    data.push(102);
    data.push(102);
    // add prefix
    data.unshift(204);
    data.unshift(204);
    console.log("send data", data);
    return new Uint8Array(data);


}
const updateDevice = async (device, currentRetry = 0) => {
    try {
        console.log("updateDevice for ", device.name);
        device.loading = true;
        device.currentAction = 'update';
        device?.onUpdate(device);
        await connectToDevice(device);
        const { characteristicRead } = await getCharacteristics(device);
        characteristicRead.oncharacteristicvaluechanged = (event) => handleUpdate(device, event);
        characteristicRead.startNotifications();
        console.log("updateDevice for ", device.name, " done -> waiting for data");
    } catch (error) {
        if (currentRetry < maxUpdateAttempts) {
            console.log("retry updateHistory", currentRetry);
            await updateHistory(device, currentRetry + 1);
        } else {
            device.loading = false;
            device.currentAction = 'idle';
            device?.onUpdate(device);
            console.log("updateHistory failed", error.message);
        }

    }

}

const getCharacteristics = async (device) => {
    const bleDevice = device.bleDevice;
    const gatt = bleDevice.gatt;
    const service = await gatt.getPrimaryService('00010203-0405-0607-0809-0a0b0c0d1910');
    const uuidWrite = "00010203-0405-0607-0809-0a0b0c0d2b11"
    const uuidRead = "00010203-0405-0607-0809-0a0b0c0d2b10"
    const characteristicWrite = await service.getCharacteristic(uuidWrite);
    const characteristicRead = await service.getCharacteristic(uuidRead);
    return { characteristicWrite, characteristicRead };
}

const connectToDevice = async ({ bleDevice }) => {
    let connectionAttempts = 0;
    while (connectionAttempts < maxConnectAttempts) {
        console.log('Connecting to device...', connectionAttempts);
        try {
            await bleDevice.gatt.connect();
            break;
        } catch (error) {
            console.log(`Connection attempt ${connectionAttempts} failed. (${error.message})`);
            connectionAttempts++;
        }
    }
    if (!bleDevice.gatt.connected) {
        throw new Error('Could not connect to device');
    }
}

const handleUpdate = async (device, event) => {
    const isSDevice = device.name.indexOf('TP357S') > -1;
    console.log("oncharacteristicvaluechanged for ", device.name);
    if (isSDevice) {
        await handleSDeviceData(device, event);
    } else {
        await handleDeviceData(device, event);
    }
}

const handleSDeviceData = async (device, event) => {
    console.log("handleSDeviceData for ", device.name);
    const value = event.target.value;
    const data = new Uint8Array(value.buffer);
    console.log(data);
    if (device.currentAction === 'update' && data[0] === 194) {
        const { temperature, humidity } = parseCurrentTemperature(data);
        device.temperature = temperature;
        device.humidity = humidity;
        device.loading = false;
        await device.bleDevice.gatt.disconnect();
        device.currentAction = 'idle';
        if (device.onUpdate) {
            device.onUpdate(device);
        }
    } else if (device.currentAction === 'updateHistory' && data[0] === 204 && data[1] === 204) {
        console.log("handleSDeviceData for ", device.name, " -> got history data");
        device.currentAction = 'receiveHistory';
        device.historyData = [];
        //skip first 7 bytes
        const historyData = data.slice(7);
        device.rawData = [];
        device.rawData.push(...historyData);
    } else if (device.currentAction === 'receiveHistory' && data.length !== 7) {
        console.log("handleSDeviceData for ", device.name, " -> receiveHistory");
        if (data[data.length - 2] === 102 && data[data.length - 1] === 102) {
            device.rawData.push(...data.slice(0, data.length - 3));
            device.historyData = parseSDeviceHistoryData(device);
            device.loading = false;
            await device.bleDevice.gatt.disconnect();
            device.currentAction = 'idle';
            if (device.onUpdate) {
                device.onUpdate(device);
            }
        } else {
            device.rawData.push(...data);
        }
    }
}

const parseSDeviceHistoryData = (device) => {
    console.log(`parseHistoryData for ${device.name} -> ${device.rawData.length} bytes`);
    let dataPoints = []
    for (let i = 0; i < device.rawData.length; i = i + 3) {
        const temperature = (device.rawData[i + 1] * 256 + device.rawData[i]) / 10;
        const humidity = device.rawData[i + 2];
        dataPoints.push({ temperature, humidity });
    }
    dataPoints = dataPoints.reverse();
    const dataPointsCount = dataPoints.length;
    dataPoints.forEach((dataPoint, index) => {
        const date = new Date();
        date.setMinutes(date.getMinutes() - (dataPointsCount - index));
        dataPoint.date = date;
    });
    console.log(`parseHistoryData for ${device.name} -> ${dataPoints.length} datapoints`);
    return dataPoints;
}

const handleDeviceData = async (device, event) => {
    console.log("handleDeviceData for ", device.name);
    const value = event.target.value;
    const data = new Uint8Array(value.buffer);
    console.log(data);
    if (device.currentAction === 'update' && data[0] === 194) {
        console.log("simple update");
        const { temperature, humidity } = parseCurrentTemperature(data);
        device.temperature = temperature;
        device.humidity = humidity;
        device.loading = false;
        await device.bleDevice.gatt.disconnect();
        device.currentAction = 'idle';
        if (device.onUpdate) {
            device.onUpdate(device);
        }
    } else if ((device.currentAction === 'updateHistory' || device.currentAction === 'receiveWeekHistory') && data[0] === 166) {
        console.log("handleDeviceData for ", device.name, " -> got history data");
        device.currentAction = 'receiveWeekHistory';
        //skip first 4 bytes
        const historyData = [...data.slice(4)];
        //remove last byte typed array has no pop
        historyData.pop();

        console.log("!!!!! history data: ", historyData);
        device.rawData.push(...historyData);
    } else if (device.currentAction === 'receiveWeekHistory' && data[0] !== 166) {
        console.log("handleDeviceData for ", device.name, " -> receiveWeekHistory");
        device.weekHistoryData = parseWeekHistoryData(device);
        device.loading = false;
        device.currentAction = 'idle';
        await device.bleDevice.gatt.disconnect();
        if (device.onUpdate) {
            device.onUpdate(device);
        }
    } else if ((device.currentAction === 'updateHistory' || device.currentAction === 'receiveDayHistory') && data[0] === 167) {
        console.log("handleDeviceData for ", device.name, " -> got history data");
        device.currentAction = 'receiveDayHistory';
        //skip first 4 bytes
        const historyData = [...data.slice(4)];
        //remove last byte
        historyData.pop();
        console.log("!!!!! history data: ", historyData);
        device.rawData.push(...historyData);
        const packetCount = data[2] * 256 + data[1];
        console.log("packetCount", packetCount);
        if (packetCount === 288) {
            device.dayHistoryData = parseDayHistoryData(device);
            device.loading = false;
            device.currentAction = 'idle';
            await device.bleDevice.gatt.disconnect();
            if (device.onUpdate) {
                device.onUpdate(device);
            }
        }
    } else if (device.currentAction === 'receiveDayHistory' && data[0] !== 167) {
        console.log("received unexpected data", data);
    }

}

const parseWeekHistoryData = (device) => {
    console.log(`parseWeekHistoryData for ${device.name} -> ${device.rawData.length} bytes`);
    let dataPoints = []
    for (let i = 0; i < device.rawData.length; i = i + 3) {
        const temperature = (device.rawData[i + 1] * 256 + device.rawData[i]) / 10;
        const humidity = device.rawData[i + 2];
        dataPoints.push({ temperature, humidity });
    }
    //dataPoints = dataPoints.reverse();
    const dataPointsCount = dataPoints.length;
    dataPoints.forEach((dataPoint, index) => {
        const date = new Date();
        date.setHours(date.getHours() - (dataPointsCount - index));
        dataPoint.date = date;
    });
    console.log(`parseWeekHistoryData for ${device.name} -> ${dataPoints.length} datapoints`);
    return dataPoints;
}

const parseDayHistoryData = (device) => {
    console.log(`parseDayHistoryData for ${device.name} -> ${device.rawData.length} bytes`);
    let dataPoints = []
    for (let i = 0; i < device.rawData.length; i = i + 3) {
        const temperature = (device.rawData[i + 1] * 256 + device.rawData[i]) / 10;
        const humidity = device.rawData[i + 2];
        dataPoints.push({ temperature, humidity });
    }
    //dataPoints = dataPoints.reverse();
    const dataPointsCount = dataPoints.length;
    dataPoints.forEach((dataPoint, index) => {
        const date = new Date();
        date.setMinutes(date.getMinutes() - (dataPointsCount - index));
        dataPoint.date = date;
    });
    console.log(`parseDayHistoryData for ${device.name} -> ${dataPoints.length} datapoints`);
    return dataPoints;
}

const parseCurrentTemperature = (data) => {
    if (data[0] !== 194) {
        throw new Error('Invalid data');
    }
    const temperature = (data[4] * 256 + data[3]) / 10;
    const humidity = data[5];
    return { temperature, humidity };
}

export { askForThermoProDevice };