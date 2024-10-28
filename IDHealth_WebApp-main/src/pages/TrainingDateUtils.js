import {
    getSolidDataset,
    getThingAll,
    createSolidDataset,
    saveSolidDatasetAt,
    createThing,
    setThing,
    setStringNoLocale,
    getStringNoLocale
} from '@inrupt/solid-client';
import dayjs from 'dayjs';

const trainingDateUrl = 'https://storage.inrupt.com/4cafa5fa-474c-4525-8f86-0acb32d377f0/training_date/';

// Funzione per salvare la data di addestramento
export const saveTrainingDate = async (fetch) => {
    try {
        let dataset;
        try {
            dataset = await getSolidDataset(trainingDateUrl, { fetch });
            console.log("Dataset delle date di addestramento caricato:", trainingDateUrl);
        } catch (error) {
            if (error.statusCode === 404) {
                console.log("Dataset delle date di addestramento non trovato, creazione nuovo dataset...");
                dataset = createSolidDataset();
                await saveSolidDatasetAt(trainingDateUrl, dataset, { fetch });
            } else {
                throw error;
            }
        }

        // Creazione di un nuovo "Thing" per la data di addestramento
        const dateString = dayjs().format('YYYY-MM-DDTHH:mm:ss');
        const newDateThing = createThing({ name: dateString });

        // Imposta la data come stringa all'interno del "Thing"
        const updatedThing = setStringNoLocale(newDateThing, 'http://www.w3.org/2001/XMLSchema#dateTime', dateString);
        
        // Aggiungi il "Thing" aggiornato al dataset
        dataset = setThing(dataset, updatedThing);
        
        // Salva il dataset aggiornato
        await saveSolidDatasetAt(trainingDateUrl, dataset, { fetch });
        console.log("Data di addestramento salvata:", dateString);
    } catch (error) {
        console.error('Errore durante il salvataggio della data di addestramento:', error);
    }
};

export const fetchTrainingDates = async (fetch) => {
    try {
        const dataset = await getSolidDataset(trainingDateUrl, { fetch });
        const things = getThingAll(dataset);

        // Recupera le date e formattale
        const dates = things.map(thing => {
            const date = getStringNoLocale(thing, 'http://www.w3.org/2001/XMLSchema#dateTime');
            return date ? dayjs(date).format('DD MMMM YYYY -- HH:mm') : null;
        }).filter(date => date !== null);

        console.log('Date di addestramento recuperate:', dates);
        return dates;
    } catch (error) {
        console.error('Errore durante il recupero delle date di addestramento:', error);
        return [];
    }
};