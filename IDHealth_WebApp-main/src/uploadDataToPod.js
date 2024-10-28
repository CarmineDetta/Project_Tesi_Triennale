import {
  createSolidDataset,
  createThing,
  setThing,
  saveSolidDatasetAt,
  getSolidDataset,
  addStringNoLocale,
  addDecimal
} from '@inrupt/solid-client';
import { getDefaultSession } from '@inrupt/solid-client-authn-browser';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

/**
 * prende i dati dalla pagina di inserimento per caricarli nel pod
 * @param {string} datasetUrl - L'URL del dataset nel pod.
 * @param {Object} dataToUpload - Oggetto contenente i dati da caricare.
 */
export const uploadDataToPod = async (datasetUrl, dataToUpload) => {
  const session = getDefaultSession();

  if (!session.info.isLoggedIn) {
    toast.error('L\'utente non è autenticato.');
    return;
  }

  let dataset;
  try {
    dataset = await getSolidDataset(datasetUrl, { fetch: session.fetch });
    console.log('Dataset esistente recuperato dal pod.');
  } catch (error) {
    if (error.statusCode === 404) {   //controlla se lo spazio nel POD è già esistente, se non c'è lo crea
      dataset = createSolidDataset();
      console.log('Nuovo dataset creato.');
    } else {
      return;
    }
  }

  //in ordine sono: ora di inserimento, valore di glucosio e tempo di misurazione del glucosio
  let newDataThing = createThing({ name: `measurement-${Date.now()}` });
  newDataThing = addStringNoLocale(newDataThing, "http://schema.org/time", dataToUpload.selectedTime);
  newDataThing = addDecimal(newDataThing, "http://schema.org/glucoseValue", parseFloat(dataToUpload.glucoseValue));
  newDataThing = addStringNoLocale(newDataThing, "http://schema.org/timestamp", dataToUpload.timestamp);

  const updatedDataset = setThing(dataset, newDataThing);

  try {
    await saveSolidDatasetAt(datasetUrl, updatedDataset, { fetch: session.fetch });
    console.log('Dati caricati con successo nel pod.');
  } catch (error) {
    if (error.statusCode === 412) {
    } else {
    }
    console.error('Errore durante il salvataggio del dataset nel pod:', error.message);
  }

  try {
    const podDataset = await getSolidDataset(datasetUrl, { fetch: session.fetch });
    console.log('Dati recuperati dal pod per verifica:', podDataset);
  } catch (error) {
    console.error('Errore durante il recupero dei dati dal pod per la verifica:', error.message);
  }
};
