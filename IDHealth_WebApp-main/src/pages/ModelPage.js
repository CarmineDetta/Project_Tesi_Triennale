import React, { useState } from 'react';
import { Button, Paper, Stack, Typography, MenuItem, Select, FormControl, InputLabel, Box } from "@mui/material";
import IconExample from "@mui/icons-material/AssignmentInd";
import { getSolidDataset, getThingAll, getStringNoLocale, getLiteral, createSolidDataset, createThing, setThing, setStringNoLocale, saveSolidDatasetAt, createContainerAt } from '@inrupt/solid-client';
import { useSession } from '@inrupt/solid-ui-react';
import dayjs from 'dayjs';
import ModelValueGraph from './ModelValueGraph'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

const ModelPage = () => {
    const { session } = useSession();
    const [selectedOption, setSelectedOption] = useState('');
    const [glucoseValue, setGlucoseValue] = useState(null);
    const [predictedInsulin, setPredictedInsulin] = useState(null);
    const [calculatedInsulin, setCalculatedInsulin] = useState(null);
    const [adviceMessage, setAdviceMessage] = useState('');

    const handleSelectChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const handlePredict = async () => {
        console.log('Opzione selezionata:', selectedOption);
    
        const currentDate = dayjs().format('YYYY-MM-DD');
        // Cartella pod per prelevare le misurazioni del glucosio fatte
        const measurementsUrl = `https://storage.inrupt.com/4cafa5fa-474c-4525-8f86-0acb32d377f0/measuraments/${currentDate}/`;
        // Cartella per inserire le predizioni fatte
        const predictionsUrl = `https://storage.inrupt.com/4cafa5fa-474c-4525-8f86-0acb32d377f0/prediction/${currentDate}/`;
    
        try {
            const dataset = await getSolidDataset(measurementsUrl, { fetch: session.fetch });
            const things = getThingAll(dataset); // tutti i dati
            const latestThing = findLatestData(things, selectedOption); // i dati relativi al più recente di orario
    
            if (latestThing) {
                const glucoseValueLiteral = getLiteral(latestThing, "http://schema.org/glucoseValue");
                const glucoseValue = glucoseValueLiteral ? parseFloat(glucoseValueLiteral.value) : null;
                const time = getStringNoLocale(latestThing, "http://schema.org/time"); 
    
                console.log("Valore di glucosio:", glucoseValue);
                console.log("Valore di time:", time); 
    
                //ATTENZIONE: trasformo in MMOL
                if (glucoseValue !== null) {
                    const glucoseValueInMmol = glucoseValue / 18;
                    console.log("Valore di glucosio in mg/dL:", glucoseValue);
                    console.log("Valore di glucosio in mmol/L:", glucoseValueInMmol);
    
                    setGlucoseValue(glucoseValue);
    
                    //ATTENZIONE: valuto insulina basale
                    if (glucoseValue <= 100) {
                        setAdviceMessage('Assumere insulina basale');
                        setPredictedInsulin(null);
                        setCalculatedInsulin(null);
                        toast.success('Assumere insulina basale'); 
                    } else {
                        setAdviceMessage('');
    
                        const insulinFactor = 0.2;
                        const calculatedInsulin = glucoseValueInMmol * insulinFactor;
                        setCalculatedInsulin(calculatedInsulin);
    
                        console.log("Insulina calcolata dall'algoritmo:", calculatedInsulin.toFixed(2));
    
                        // Parte della chiamata al server Flask
                        const postData = {
                            ID: 0,
                            settimana: 1,
                            giornoSettimana: 1,
                            'Glucosio al Risveglio (07:00)': selectedOption === 'G at Waking' ? glucoseValueInMmol : 4,
                            'Glucosio alle 09:30': selectedOption === 'G at 09:30' ? glucoseValueInMmol : 4,
                            'Glucosio alle 13:00': selectedOption === 'G at 13:00' ? glucoseValueInMmol : 4,
                            'Glucosio alle 15:00': selectedOption === 'G at 15:00' ? glucoseValueInMmol : 4,
                            'Glucosio alle 18:00': selectedOption === 'G at 18:00' ? glucoseValueInMmol : 4,
                            'Glucosio alle 20:00': selectedOption === 'G at 20:00' ? glucoseValueInMmol : 4
                        };
    
                        console.log("Dati inviati al server:", postData);
    
                        try {
                            const response = await fetch('http://localhost:5001/predict', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(postData)
                            });
    
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
    
                            const result = await response.json();
                            console.log("Predizione ricevuta dal server:", result.prediction);
                            
    
                        } catch (error) {
                            console.error("Errore durante la chiamata al server Flask:", error);
                        }
    
                        let predictionDataset;
                        try {
                            predictionDataset = await getSolidDataset(predictionsUrl, { fetch: session.fetch });
                            console.log("Dataset esistente caricato:", predictionsUrl);
                        } catch (error) {
                            if (error.statusCode === 404) {
                                console.log("Dataset non trovato, creazione nuovo dataset...");
                                await createContainerAt(predictionsUrl, { fetch: session.fetch });
                                predictionDataset = createSolidDataset();
                            } else {
                                throw error;
                            }
                        }
    
                        let predictionThing = createThing({ name: `insulin-prediction-${dayjs().format('HH-mm-ss')}` });
                        predictionThing = setStringNoLocale(predictionThing, "http://schema.org/predictedInsulin", calculatedInsulin.toString());
                        predictionThing = setStringNoLocale(predictionThing, "http://schema.org/glucoseValue", glucoseValue.toString());
                        predictionThing = setStringNoLocale(predictionThing, "http://schema.org/time", time); // Salva il valore di time
                        predictionDataset = setThing(predictionDataset, predictionThing);
    
                        try {
                            await saveSolidDatasetAt(predictionsUrl, predictionDataset, { fetch: session.fetch });
                            console.log("Salvataggio riuscito nel POD.");
                            console.log("Valore predetto salvato nel POD:");
                            console.log("Cartella:", predictionsUrl);
                            console.log("Dati salvati:", {
                                predictedInsulin: calculatedInsulin.toString(),
                                glucoseValue: glucoseValue.toString(),
                                time: time 
                            });
                            toast.success('Predizione di insulina salvata con successo'); // Toast di successo
                        } catch (error) {
                            console.error("Errore durante il salvataggio nel POD:", error);
                            toast.error('Errore durante il salvataggio nel POD'); // Toast di errore
                        }
                    }
                } else {
                    console.log("Valore di glucosio non valido");
                    setPredictedInsulin(null);
                    setCalculatedInsulin(null);
                    setAdviceMessage('');
                }
            } else {
                console.log("Dato non trovato");
                toast.warn("Dato non presente, inserire misurazione relativa all'ora selezionata!");
                setPredictedInsulin(null);
                setCalculatedInsulin(null);
                setAdviceMessage('');
            }
        } catch (error) {
            console.error("Errore durante il fetch dei dati dal POD:", error);
            toast.error('Errore durante il fetch dei dati dal POD');
        }
    };
    
    

    const findLatestData = (things, selectedOption) => {
        let latestThing = null;
        let latestTimestamp = null;

        things.forEach(thing => {
            console.log("Contenuto completo del thing:", thing);
            console.log("Tutte le chiavi presenti nel thing:", Object.keys(thing.predicates));

            const time = getStringNoLocale(thing, "http://schema.org/time");
            const timestampLiteral = getLiteral(thing, "http://schema.org/timestamp");
            const glucoseValueLiteral = getLiteral(thing, "http://schema.org/glucoseValue");

            const timestamp = timestampLiteral ? timestampLiteral.value : null;
            const glucoseValue = glucoseValueLiteral ? glucoseValueLiteral.value : null;

            console.log("Valore di time trovato:", time); // Log del valore di time
            console.log("Valore di timestamp trovato:", timestamp); // Log del valore di timestamp
            console.log("Valore di glucosio trovato:", glucoseValue); // Log del valore di glucosio

            if (!time || !timestamp || !glucoseValue) {
                console.warn("Valore mancante in uno o più campi:", { time, timestamp, glucoseValue });
            } else {
                console.log("Verifica dato corretto:", { time, timestamp, glucoseValue });
            }

            if (time === selectedOption && (latestTimestamp === null || (timestamp && timestamp > latestTimestamp))) {
                latestTimestamp = timestamp;
                latestThing = thing;
            }
        });

        return latestThing;
    };

    return (
        <Paper
            sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <Stack
                direction="column"
                justifyContent="center"
                alignItems="center"
                spacing={2}
            >
                <Stack>
                    <IconExample sx={{ color: 'primary.dark', fontSize: 55 }} />
                </Stack>
                <Stack>
                    <Typography align="center" variant="h6" color="primary" gutterBottom>
                        Insulin Prediction
                    </Typography>
                </Stack>
                <FormControl fullWidth sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel id="select-label">Seleziona Opzione</InputLabel>
                    <Select
                        labelId="select-label"
                        value={selectedOption}
                        onChange={handleSelectChange}
                        label="Seleziona Opzione"
                    >
                        <MenuItem value="G at Waking">Insulina al Risveglio (07:00)</MenuItem>
                        <MenuItem value="G at 09:30">Insulina alle 09:30</MenuItem>
                        <MenuItem value="G at 13:00">Insulina alle 13:00</MenuItem>
                        <MenuItem value="G at 15:00">Insulina alle 15:00</MenuItem>
                        <MenuItem value="G at 18:00">Insulina alle 18:00</MenuItem>
                        <MenuItem value="G at 20:00">Insulina alle 20:00</MenuItem>
                    </Select>
                </FormControl>
                <Button variant="contained" color="primary" onClick={handlePredict}>
                    Predict
                </Button>
                {glucoseValue !== null && glucoseValue <= 100 && adviceMessage && (
                    <Box
                        sx={{
                            mt: 3,
                            p: 2,
                            backgroundColor: '#4caf50',
                            color: 'white',
                            width: '100%',
                            borderRadius: 2,
                            textAlign: 'center',
                            boxShadow: 3,
                        }}
                    >
                        <Typography align="center" variant="h5">
                            {adviceMessage}
                        </Typography>
                    </Box>
                )}
                {calculatedInsulin !== null && (
                    <Box
                        sx={{
                            mt: 3,
                            p: 2,
                            backgroundColor: '#ffeb3b',
                            color: 'black',
                            width: '100%',
                            borderRadius: 2,
                            textAlign: 'center',
                            boxShadow: 3,
                        }}
                    >
                        <Typography align="center" variant="h6">
                            Insulina calcolata: {calculatedInsulin.toFixed(2)} U
                        </Typography>
                    </Box>
                )}
                {glucoseValue !== null && (
                    <Box
                        sx={{
                            mt: 3,
                            p: 2,
                            backgroundColor: '#2196f3',
                            color: 'white',
                            width: '100%',
                            borderRadius: 2,
                            textAlign: 'center',
                            boxShadow: 3,
                        }}
                    >
                        <Typography align="center" variant="h6">
                            Valore di glucosio: {glucoseValue} mg/dL
                        </Typography>
                    </Box>
                )}
            </Stack>

            {/* box per il grafico */}
            <Box
                sx={{
                    width: '100%',
                    height: '500px',
                    mt: 10, 
                }}
            >
                <ModelValueGraph />
            </Box>

            <ToastContainer />
            
        </Paper>
    );
};

export default ModelPage;
