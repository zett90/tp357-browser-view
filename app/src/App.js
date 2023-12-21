import logo from './logo.svg';
import './App.css';
import { Container } from '@mui/material';
import { BleContextProvider } from './contexts/BleDeviceContext';
import BleDeviceList from './components/BleDeviceList';


function App() {
  return (
    <BleContextProvider>
      <Container maxWidth="lg">
        <BleDeviceList />
      </Container>
    </BleContextProvider>
  );
}

export default App;
