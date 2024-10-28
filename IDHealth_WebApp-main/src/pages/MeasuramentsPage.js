import React, { useEffect, useState } from "react";
import { Grid, Box } from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from "dayjs";
import { useRecoilValue, useRecoilState } from "recoil";
import { profileState } from "../atom/profileState";
import { useSession } from "@inrupt/solid-ui-react";
import { getSolidDataset, getThingAll, getStringNoLocale, getDecimal } from "@inrupt/solid-client";
import MeasurementDataTable from "../components/measurament/MeasuramentDataTable";
import { loaderState } from "../atom/loaderState";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { removeThing, saveSolidDatasetAt } from "@inrupt/solid-client";

const MeasuramentsPage = () => {
  const profile = useRecoilValue(profileState);
  const { session } = useSession();
  const [dateValue, setDateValue] = useState(dayjs());
  const [measuraments, setMeasuraments] = useState([]);
  const [isLoading, setIsLoading] = useRecoilState(loaderState);

  useEffect(() => {
    if (!profile) return;
    fetchMeasurementsForDay();
  }, [dateValue]);

  async function handleDelete(item) {
    try {
      const formattedDate = dateValue.format("YYYY-MM-DD");
      const measuramentUrl = `${profile.storageUrl}measuraments/${formattedDate}/`;

      const dataset = await getSolidDataset(measuramentUrl, { fetch: session.fetch });
      const things = getThingAll(dataset);

      const thingToDelete = things.find(thing => thing.url === item.fileUrl);

      if (!thingToDelete) {
        console.error('Thing not found in dataset');
        return;
      }

      const updatedDataset = removeThing(dataset, thingToDelete);

      await saveSolidDatasetAt(measuramentUrl, updatedDataset, { fetch: session.fetch });

      console.log('Item successfully deleted');

      setMeasuraments(prevMeasuraments =>
        prevMeasuraments.filter(measurament => measurament.fileUrl !== item.fileUrl)
      );
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }

  async function fetchMeasurementsForDay() {
    try {
      setIsLoading(true);
      const formattedDate = dateValue.format("YYYY-MM-DD");
      const measuramentUrl = `${profile.storageUrl}measuraments/${formattedDate}/`;
  
      const dataset = await getSolidDataset(measuramentUrl, { fetch: session.fetch });
      const things = getThingAll(dataset);
  
      const results = things
        .map(thing => {
          // controlla se il thing ha le proprietà richieste
          const value = getDecimal(thing, "http://schema.org/glucoseValue");
          const dateTime = getStringNoLocale(thing, "http://schema.org/time");
          const timestamp = getStringNoLocale(thing, "http://schema.org/timestamp");
  
          // elimina i things che non hanno dati validi
          if (value !== null && dateTime !== null && timestamp !== null) {
            return {
              fileUrl: thing.url,
              value,
              dateTime,
              date: formattedDate,
              timestamp,
            };
          }
  
          return null; // escludi i Things null
        })
        .filter(item => item !== null);
  
      console.log("Data to display:", results);
      setMeasuraments(results);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setMeasuraments([]);
      } else {
        console.error('Errore durante il recupero dei dati dal pod:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item xs={12}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            sx={{ backgroundColor: '#FFF', borderRadius: 1 }}
            label="Select Date"
            value={dateValue}
            onChange={(newValue) => setDateValue(newValue)}
          />
        </LocalizationProvider>
      </Grid>
      <Grid item xs={12}>
        <MeasurementDataTable
          data={measuraments}
          isLoading={isLoading}
          handleDelete={handleDelete} 
        />
      </Grid>
    </Grid>
  );
};

export default MeasuramentsPage;
