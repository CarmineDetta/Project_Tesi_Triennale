// Importa le librerie necessarie
import { handleIncomingRedirect, login, fetch } from "@inrupt/solid-client-authn-browser";
import { useEffect, useState } from "react";
import { 
  createSolidDataset, 
  createThing, 
  setThing, 
  saveSolidDatasetAt, 
  setStringNoLocale, 
  getPodUrlAll, getSolidDataset, getThing, getUrlAll } from '@inrupt/solid-client';
import { Fhir } from 'fhir';

const patientObject = {
  resourceType: "Patient",
  id: "WebIDPOD",
  name: [
    {
      use: "official",
      family: ["Lisa"],
      given: ["Lisa", "Rossi"],
      prefix: ["Mrs."]
    }
  ],
  telecom: [
    {
      system: "phone",
      value: "800-258-4431",
      use: "home"
    },
    {
      system: "email",
      value: "lisa.coleman@example.com"
    }
  ],
  gender: "female",
  birthDate: "1948-04-14",
  address: [
    {
      use: "home",
      line: ["1 Main St", "Apt 16"],
      city: "Bixby",
      state: "OK",
      postalCode: "74008",
      country: "USA"
    }
  ]
};

const App = () => {
  const [session, setSession] = useState();

  useEffect(() => {
    // Gestisce il reindirizzamento dopo il login
    handleIncomingRedirect().then((session) => {
      if (session) {
        setSession(session);
        ('session', session)
      }

      const fhirInstance = new Fhir();
      const xml = fhirInstance.objToXml(patientObject);

    // Puoi fare qualsiasi cosa con l'istanza FHIR
    ('Istanza FHIR creata:', fhirInstance.validate(xml));
    });
  }, []);

  const uploadFileToPod = async () => {
    try {
      if (session && session.isLoggedIn) {
        ('fetch', fetch)
        const rawProfile = await (
          await fetch(session.webId)
        ).text();
        ('raw', rawProfile)
        // Creare un nuovo dataset Solid
        const newDataset = createSolidDataset();

        // Creare una "cosa" (oggetto RDF) nel dataset
        const newDataThing = createThing({ url: `${session.webId}#newThing` });

        // Contenuto TTL
        const ttlContent = `@prefix : <#>.
                            :newThing :hasTitle "Nuova Attività".`;

        // Aggiungere il contenuto TTL all'oggetto Thing
        const updatedDataThing = setStringNoLocale(newDataThing, "http://www.w3.org/2000/01/rdf-schema#label", ttlContent);

        // Aggiungere l'oggetto al dataset
        const updatedDataset = setThing(newDataset, updatedDataThing);

        const mypods = await getPodUrlAll(session.webId, { fetch: fetch });

        // Salvare il dataset nel pod
        const updatedPodDataset = await saveSolidDatasetAt(`${mypods}`, updatedDataset, { fetch: fetch(session.webId) });

        ('File TTL caricato con successo nel pod:', updatedPodDataset);
      } else {
        console.error('L\'utente non è autenticato.');
      }
    } catch (error) {
      console.error('Errore durante il caricamento del file TTL nel pod:', error);
    }
  };

  async function getOrCreateTodoList(containerUri, fetch) {
    const indexUrl = `${containerUri}index.ttl`;
    try {
      const todoList = await getSolidDataset(indexUrl, { fetch });
      return todoList;
    } catch (error) {
      if (error.statusCode === 404) {
        const todoList = await saveSolidDatasetAt(
          indexUrl,
          createSolidDataset(),
          {
            fetch,
          }
        );
        return todoList;
      }
    }
  }

  useEffect(() => {
    if (!session) return;
    (async () => {
      const profileDataset = await getSolidDataset(session.webId, {
        fetch: fetch,
      });
      const profileThing = getThing(profileDataset, session.webId);
      const podsUrls = getUrlAll(
        profileThing,
        "http://www.w3.org/ns/pim/space#storage"
      );
      const pod = podsUrls[0];
      const containerUri = `${pod}todos/`;
      const list = await getOrCreateTodoList(containerUri, fetch);
      ('list', list)
    })();
  }, [session]);

  // Funzione per avviare il processo di login
  const startLogin = async () => {
    const x = await login({
      oidcIssuer: "https://login.inrupt.com", // Sostituisci con il tuo fornitore Solid
      redirectUrl: window.location.href,
      clientName: "Il tuo nome app",
    });
    ('x', x)
  };

  return (
    <div>
      {session && session.isLoggedIn ? (
        <div>
          <p>Ciao, {session.webId}!</p>
          <button onClick={uploadFileToPod}>Fetch dati dal Pod</button>
        </div>
      ) : (
        <button onClick={startLogin}>Effettua il Login</button>
      )}
    </div>
)};


export default App;