import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { getSolidDataset, getThingAll, getLiteral, getStringNoLocale } from '@inrupt/solid-client';
import { useSession } from '@inrupt/solid-ui-react';
import dayjs from 'dayjs';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, zoomPlugin);

const ModelValueGraph = () => {
    const { session } = useSession();
    const [labels, setLabels] = useState([]);
    const [values, setValues] = useState([]);
    const [glucoseValues, setGlucoseValues] = useState([]);
    const [times, setTimes] = useState([]); // Stato per memorizzare i valori di time
    const [refresh, setRefresh] = useState(false); // Stato per triggerare il refresh

    const fetchData = async () => {
        const currentDate = dayjs().format('YYYY-MM-DD');
        const url = `https://storage.inrupt.com/4cafa5fa-474c-4525-8f86-0acb32d377f0/prediction/${currentDate}/`;

        console.log('Fetching data from:', url);

        try {
            const dataset = await getSolidDataset(url, { fetch: session.fetch });
            console.log('Dataset fetched:', dataset);

            const things = getThingAll(dataset);
            console.log('Things retrieved:', things);

            const dataMap = new Map();

            things.forEach(thing => {
                const insulinValueLiteral = getLiteral(thing, "http://schema.org/predictedInsulin");
                const glucoseValueLiteral = getLiteral(thing, "http://schema.org/glucoseValue");
                const timeLiteral = getStringNoLocale(thing, "http://schema.org/time"); // Preleva il valore di time

                console.log('Processing thing:', thing.url);
                console.log('Insulin value literal:', insulinValueLiteral);
                console.log('Glucose value literal:', glucoseValueLiteral);
                console.log('Time value literal:', timeLiteral);

                if (insulinValueLiteral && glucoseValueLiteral && timeLiteral) {
                    const insulinValue = parseFloat(insulinValueLiteral.value);
                    const glucoseValue = parseFloat(glucoseValueLiteral.value);
                    const time = timeLiteral;

                    // Storing glucose values and time associated with unique insulin values
                    if (!dataMap.has(insulinValue)) {
                        dataMap.set(insulinValue, { glucoseValue, time });
                    }
                }
            });

            // Converting map to arrays
            const newLabels = [];
            const newValues = [];
            const newGlucoseValues = [];
            const newTimes = [];

            dataMap.forEach(({ glucoseValue, time }, insulinValue) => {
                newLabels.push(`Insulin: ${insulinValue.toFixed(2)}`); // Format to 2 decimal places
                newValues.push(insulinValue);
                newGlucoseValues.push(glucoseValue);
                newTimes.push(time); // Add time values
            });

            console.log('Labels:', newLabels);
            console.log('Values:', newValues);
            console.log('Glucose Values:', newGlucoseValues);
            console.log('Times:', newTimes);

            setLabels(newLabels);
            setValues(newValues);
            setGlucoseValues(newGlucoseValues);
            setTimes(newTimes); // Set times

        } catch (error) {
            console.error("Errore durante il fetch dei dati dal POD:", error);
        }
    };

    useEffect(() => {
        fetchData(); // Fetch iniziale al montaggio del componente

        const fetchDataInterval = setInterval(() => {
            fetchData();
        }, 60000); // Aggiorna ogni 60.000 ms (60 secondi)

        return () => clearInterval(fetchDataInterval); // Cleanup dell'intervallo al momento dello smontaggio
    }, [session, refresh]); // Dipendenza da `refresh`

    // Funzione chiamata quando si preme il pulsante di aggiornamento
    const handleRefreshClick = () => {
        setRefresh(prev => !prev); // Triggera il refresh
    };

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'Valore di Insulina',
                data: values,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.dataset.label || '';
                        return `${label}: ${context.raw}`;
                    }
                }
            },
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'xy',
                },
                zoom: {
                    enabled: true,
                    mode: 'xy',
                    speed: 0.1,
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 10,
                    callback: function(value, index, values) {
                        // Display only the time value under each column
                        return times[index] || '';
                    }
                },
                barPercentage: 0.5, // Riduce la larghezza delle barre
                categoryPercentage: 0.5, // Riduce la larghezza delle barre
            },
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <div style={{ width: '80%', height: '500px', margin: '0 auto', position: 'relative' }}>
            <button 
                onClick={handleRefreshClick}
                style={{ 
                    position: 'absolute', 
                    top: '10px', 
                    right: '10px', 
                    border: 'none', 
                    background: 'transparent', 
                    cursor: 'pointer' 
                }}
            >
                <img 
                    src="https://www.svgrepo.com/show/487723/reload-ui-2.svg" 
                    alt="Refresh" 
                    style={{ width: '24px', height: '24px' }}
                />
            </button>
            <Bar
                data={chartData}
                options={options}
            />
        </div>
    );
};

export default ModelValueGraph;
