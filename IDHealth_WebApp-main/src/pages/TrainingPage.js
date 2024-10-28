import React, { useState, useEffect } from 'react';
import { useSession } from '@inrupt/solid-ui-react';
import dayjs from 'dayjs';
import {
    getSolidDataset,
    getThingAll,
    createSolidDataset,
    createContainerAt,
    getStringNoLocale
} from '@inrupt/solid-client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button, Grid, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Stack } from '@mui/material';
import { saveTrainingDate, fetchTrainingDates } from './TrainingDateUtils';

const TrainingPage = () => {
    const { session } = useSession();
    const [uniqueValues, setUniqueValues] = useState([]);
    const [trainingDates, setTrainingDates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPredictions = async () => {
        const currentDate = dayjs().format('YYYY-MM-DD');
        const predictionsUrl = `https://storage.inrupt.com/4cafa5fa-474c-4525-8f86-0acb32d377f0/prediction/${currentDate}/`;

        try {
            let predictionsDataset;
            try {
                predictionsDataset = await getSolidDataset(predictionsUrl, { fetch: session.fetch });
                console.log("Dataset delle predizioni caricato:", predictionsUrl);
            } catch (error) {
                if (error.statusCode === 404) {
                    console.log("Dataset delle predizioni non trovato, creazione nuovo dataset...");
                    await createContainerAt(predictionsUrl, { fetch: session.fetch });
                    predictionsDataset = createSolidDataset();
                } else {
                    throw error;
                }
            }

            const things = getThingAll(predictionsDataset);
            const values = things.map(thing => getStringNoLocale(thing, "http://schema.org/predictedInsulin"))
                                .filter(value => value !== null && value !== undefined);

            const uniqueValues = Array.from(new Set(values));
            setUniqueValues(uniqueValues);
            setLoading(false);

            if (uniqueValues.length === 0) {
                toast.warn('Nessun valore trovato nelle predizioni, impossibile addestrare! Calcolare predizioni.');
            }

        } catch (error) {
            console.error("Errore durante il fetch dei dati delle predizioni:", error);
            setError(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPredictions();
    }, []);

    useEffect(() => {
        const fetchDates = async () => {
            const dates = await fetchTrainingDates(session.fetch);
            setTrainingDates(dates);
        };
        fetchDates();
    }, []);

    const sendTrainingData = async () => {
        if (uniqueValues.length < 6) {
            // Mostra un errore se ci sono meno di 6 valori
            toast.error('Mancano valori sufficienti per l\'addestramento. Aggiungere predizione dell\'orario mancante!.');
            console.log('Errore: Mancano valori sufficienti per l\'addestramento.'); // Log errore
            return; // Non eseguire ulteriori operazioni
        }
    
        console.log('Inizio processo di addestramento...'); // Log inizio addestramento
    
        const currentDate = dayjs().format('YYYY-MM-DD');
        const formattedData = uniqueValues.map(value => ({
            feature1: parseFloat(value),
            feature2: parseFloat(value),
            'Insulina al Risveglio (07:00)': parseFloat(value),
            'Insulina alle 09:30': parseFloat(value),
            'Insulina alle 13:00': parseFloat(value),
            'Insulina alle 15:00': parseFloat(value),
            'Insulina alle 18:00': parseFloat(value),
            'Insulina alle 23:00': parseFloat(value)
        }));
    
        try {
            const response = await fetch('http://localhost:5000/train', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ features: formattedData })
            });
    
            const result = await response.json();
    
            if (response.ok) {
                console.log('Addestramento completato con successo.'); // Log successo addestramento
                console.log('Risultato:', result.message || result.error); // Log risultato addestramento
                toast.success("Addestramento completato con successo!");
                
                // Salva la data di addestramento
                await saveTrainingDate(session.fetch);
                
                // Recupera e aggiorna le date di addestramento
                const dates = await fetchTrainingDates(session.fetch);
                setTrainingDates(dates);
            } else {
                console.log('Errore durante l\'addestramento:', result.error || 'Errore sconosciuto'); // Log errore risposta
            }
        } catch (error) {
            console.error('Errore nella richiesta di addestramento:', error); // Log errore richiesta
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <Grid container spacing={3} justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
            <Grid item xs={12} md={12}>
                <Paper sx={{ p: 4 }}>
                    <Stack alignItems="center" sx={{ mb: 4 }}>
                        <img src="/weight-lifting.svg" 
                             alt="Weight Lifting Icon" 
                             style={{ width: '50px', height: '50px', filter: 'invert(30%) sepia(77%) saturate(6683%) hue-rotate(178deg) brightness(95%) contrast(107%)' }} />
                    </Stack>

                    <Typography variant="h5" align="center" color="primary" gutterBottom sx={{ mb: 4 }}>Training Page</Typography>

                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={6}>
                            <TableContainer component={Paper} sx={{ maxWidth: 400, margin: '0 auto', marginBottom: 4 }}>
                                <Table sx={{ width: '100%' }} aria-label="insulin values table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center" sx={{ fontWeight: 'bold', width: '100%' }}>Predicted Insulin Values</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {uniqueValues.length > 0 ? (
                                            uniqueValues.map((value, index) => (
                                                <TableRow 
                                                    key={index} 
                                                    sx={{ 
                                                        backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#e0e0e0'
                                                    }}>
                                                    <TableCell align="center">
                                                        Insulin: {parseFloat(value).toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell align="center">No insuline value found.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TableContainer component={Paper} sx={{ maxWidth: 400, margin: '0 auto', marginBottom: 4, maxHeight: 300, overflowY: 'auto' }}>
                                <Table stickyHeader sx={{ width: '100%' }} aria-label="training dates table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center" sx={{ fontWeight: 'bold', width: '100%' }}>Training Date Time</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {trainingDates.length > 0 ? (
                                            trainingDates.map((date, index) => (
                                                <TableRow 
                                                    key={index} 
                                                    sx={{ 
                                                        backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#e0e0e0'
                                                    }}>
                                                    <TableCell align="center">
                                                        {date}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell align="center">No training date found!.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                    </Grid>

                    <Stack direction="row" spacing={2} justifyContent="center">
                        <Button variant="contained" color="primary" onClick={sendTrainingData}>
                            Training Data
                        </Button>
                    </Stack>

                    <ToastContainer />
                </Paper>
            </Grid>
        </Grid>
    );
};

export default TrainingPage;
