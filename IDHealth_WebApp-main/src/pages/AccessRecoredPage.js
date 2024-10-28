import { Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { getGlobalState } from "../store/web3Store";
import { useRecoilValue } from "recoil";
import { profileState } from "../atom/profileState";
import { getAccesses } from "../utils/contractsBlockchainFetch";

const AccessRecoredPage = () => {
    const [access, setAccess] = useState();
    const profile = useRecoilValue(profileState);

    useEffect(() => {
        handleAccessEvent()
    }, [])

    useEffect(() => {
        fetchAccess(profile.storageUrl);
    }, [profile])

    const handleAccessEvent = () => {
        const contract = getGlobalState('contract')

        contract.events.PodAccessRecorded().on('data', async (data) => {
            if(data.returnValues.podUrl === profile.storageUrl) {
                fetchAccess(profile.storageUrl);
            }
        })
    }
    const fetchAccess = async (storageUrl) => {
        if (!storageUrl) return;
    
        try {
            const response = await getAccesses(storageUrl);
    
            // Verifica se la risposta è un array
            if (!Array.isArray(response)) {
                throw new Error('La risposta non è un array');
            }
    
            const accessMapped = response.map(item => {
                // Verifica se `item` ha una proprietà `timestamp` valida
                if (item.timestamp == null || isNaN(Number(item.timestamp))) {
                    throw new Error('Timestamp non valido');
                }
    
                // Crea un oggetto Date utilizzando il timestamp
                const date = new Date(Number(item.timestamp) * 1000); // eslint-disable-line
    
                // Formatta la data
                const formattedDate = date.toLocaleString();
                return { server: item.server, timestamp: formattedDate };
            });
    
            setAccess(accessMapped);
        } catch (error) {
            console.error('Errore durante il recupero degli accessi:', error);
            // Gestisci l'errore come meglio credi, ad esempio impostando uno stato di errore
        }
    };
    

    return (
        <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="flex-start"
            spacing={2} >
                <Grid item xs={12}>
                    <AccessRecoredDataTable data={access} />
                </Grid>
      </Grid>
    )
}

export default AccessRecoredPage;