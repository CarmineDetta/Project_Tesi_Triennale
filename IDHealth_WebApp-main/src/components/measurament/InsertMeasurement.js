import React, { useState } from 'react';
import { Button, Grid, MenuItem, Paper, Select, TextField, Typography, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { uploadDataToPod } from '../../uploadDataToPod';
import dayjs from 'dayjs';
import { ToastContainer, toast } from 'react-toastify'; // Importa toast
import 'react-toastify/dist/ReactToastify.css';

const InsertMeasurement = () => {
  const navigate = useNavigate();
  const [selectedTime, setSelectedTime] = useState('');
  const [glucoseValue, setGlucoseValue] = useState('');

  const handleSubmit = async () => {
    const currentDate = dayjs().format("YYYY-MM-DD");
    const currentTime = dayjs().format("HH:mm:ss"); 

    const measurementData = {
      selectedTime,
      glucoseValue,
      date: currentDate,
      timestamp: currentTime 
    };

    console.log('Submitted Data:', measurementData);

    //carico i dati nella cartella measurement + data di oggi
    const datasetUrl = `https://storage.inrupt.com/4cafa5fa-474c-4525-8f86-0acb32d377f0/measuraments/${currentDate}/`;

    try {
      await uploadDataToPod(datasetUrl, measurementData);   //chiamata della funzione per caricare i dati nel pod
      
      navigate('/');
    } catch (error) {
      console.error('Error uploading data:', error);
    }

    navigate('/');
  };

  return (
    <Grid container spacing={3} justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" align="center" gutterBottom>Insert Glucose Measurement</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Stack spacing={2}>
                <Typography>Select Time of Day</Typography>
                <Select
                  fullWidth
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="" disabled>Select time</MenuItem>
                  <MenuItem value="G at Waking">Glucose at Waking</MenuItem>
                  <MenuItem value="G at 09:30">Glucose at 09:30</MenuItem>
                  <MenuItem value="G at 13:00">Glucose at 13:00</MenuItem>
                  <MenuItem value="G at 15:00">Glucose at 15:00</MenuItem>
                  <MenuItem value="G at 18:00">Glucose at 18:00</MenuItem>
                  <MenuItem value="G at 20:00">Glucose at 20:00</MenuItem>
                </Select>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={2}>
                <Typography>Enter Numeric Glucose Value</Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={glucoseValue}
                  onChange={(e) => setGlucoseValue(e.target.value)}
                  placeholder="Numeric Value of Glucose"
                />
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" fullWidth onClick={handleSubmit}>Insert Measurement</Button>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default InsertMeasurement;
