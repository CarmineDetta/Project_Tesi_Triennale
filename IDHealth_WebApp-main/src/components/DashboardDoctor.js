import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, Box, Paper } from "@mui/material";
import { useEffect, useState } from "react";
import { MESSAGE_ERROR_RETRIVE_MEASURE, NS_PIM_SPACE_STORAGE } from "../utils/constants";
import { getSolidDataset, getThing, getUrlAll, getContainedResourceUrlAll } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import { measuramentQl } from "../utils/solidDataUtils";
import { useRecoilState } from "recoil";
import { loaderState } from "../atom/loaderState";
import SparqlQueryExecutor from "../utils/sparqlQueryExecutor";
import errorState from "../atom/errorState";
import MeasuramentDataTable from "./measurament/MeasuramentDataTable";

const DashboardDoctor = () => {
    const [webIdPatient, setWebIdPatien] = useState(null);
    const [podPatientSelected, setPodPatientSelected] = useState(null)
    const [podsPatient, setPodsPatient] = useState([]);
    const [measuraments, setMeasuraments] = useState([]);
    const [isLoading, setIsLoading] = useRecoilState(loaderState);
    const [error, setError] = useRecoilState(errorState);
    const session = useSession();
    const sparqlExecutor = new SparqlQueryExecutor();

    useEffect(() => {
        if(!webIdPatient) return;

        fetchPodPatient(webIdPatient);
    }, [webIdPatient])

    useEffect(() => {
        if(!podPatientSelected) return;

        fetchMeasurementsPatient(podPatientSelected);
    }, [podPatientSelected])

    const handleBlurWebIdPatient = (event) => {
        setWebIdPatien(event.target.value);
    }

    const handleChangePodPatient = (event) => {
        setPodPatientSelected(event.target.value)
    }

    const fetchPodPatient = async (webId) => {
        try {
            const datasetHealth = await getSolidDataset(webId, session.fetch);

            const thing = getThing(datasetHealth, webId);

            const pods = getUrlAll(thing, NS_PIM_SPACE_STORAGE);

            setPodsPatient(pods);
        } catch(error) {
            console.log('Error', error)
        }
    }

    async function fetchMeasurementsPatient(storageUrl) {
        try {
            setIsLoading(true);
    
            const measuramentsContainerUrl = `${storageUrl}measuraments/`;
    
            const dataset = await getSolidDataset(measuramentsContainerUrl, { fetch: session.fetch })
            const measuramentUrls = getContainedResourceUrlAll(dataset)
    
            const listMeasuraments = new Array();
    
            for(const measuramentUrl of measuramentUrls) {
              const datasetMeasuament = await getSolidDataset(measuramentUrl, { fetch: session.fetch })
              const measuramentDayUrls = getContainedResourceUrlAll(datasetMeasuament)
    
              for(const url of measuramentDayUrls) {
                // Trova l'ultima occorrenza di '/' nell'URL
                const lastIndex = url.lastIndexOf("/");
              
                // Estrai il nome del file utilizzando substring
                const fileName = url.substring(lastIndex + 1).replace(".ttl", "");
    
                const response = await sparqlExecutor.executeQuery(url, measuramentQl(fileName), session.fetch);
                listMeasuraments.push(response)
              }
            }
    
            setMeasuraments(listMeasuraments);
    
        } catch (error) {
            setMeasuraments([])
            setError({
              isError: true,
              message: MESSAGE_ERROR_RETRIVE_MEASURE
            })
            console.log('Error', error)
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Grid container spacing={2}>
            <Grid item xs={6}>
                <TextField
                    id="webId_patient"
                    label="Patient's WebID"
                    onBlur={handleBlurWebIdPatient}
                    component={Paper}
                    fullWidth
                />
            </Grid>
            <Grid item xs={6}>
                <Box component={Paper}>
                    <FormControl fullWidth>
                        <InputLabel id="podUrls_label">Patient's Pods</InputLabel>
                        <Select
                            labelId="podUrls_label"
                            id="podUrls"
                            onChange={handleChangePodPatient}
                            component={Paper} >
                            {podsPatient.map((podUrl) => (
                                <MenuItem value={podUrl}>{podUrl}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <MeasuramentDataTable data={measuraments} isDelete={false} />
            </Grid>
        </Grid>
    )
}

export default DashboardDoctor;