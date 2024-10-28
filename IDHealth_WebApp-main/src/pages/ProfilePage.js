import { Avatar, Grid, Paper, Typography, useTheme } from "@mui/material";
import ProfileForm from "../components/profile/ProfileForm";
import { useRecoilState, useRecoilValue } from "recoil";
import { profileState } from "../atom/profileState";
import dayjs from 'dayjs';
import { useSession } from "@inrupt/solid-ui-react";
import { getPatientInfo, saveFile } from "../utils/solidDataUtils";
import { getPatientTurtle } from "../utils/turtleInfo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { patientState } from "../atom/patientState";
import { loaderState } from "../atom/loaderState";
import errorState from "../atom/errorState";
import { MESSAGE_ERROR_COMMUNICATION_POD } from "../utils/constants";

const ProfilePage = () => {
    const profileInfo = useRecoilValue(profileState);
    const { session } = useSession()
    const [patientInfo, setPatientInfo] = useRecoilState(patientState);
    const [isLoading, setIsLoading] = useRecoilState(loaderState);
    const [error, setError] = useRecoilState(errorState);
    const theme = useTheme();

    const onSubmitProfileForm = async (data) => {
        const formattedBirthDate = dayjs(data.date, { locale: AdapterDayjs.locale }).format('YYYY-MM-DD');

        const newPatientInfo = {
            webId: session.info.webId, // Web ID del paziente
            nameSurname: `${data.name} ${data.surname}`, // Cognome del paziente
            name: `${data.name}`, // Nome del paziente
            surname: `${data.surname}`, // Cognome del paziente
            prefixName: `${data.prefix}`, // Prefisso del nome del paziente
            phoneNumber: `${data.phoneNumber}`, // Numero di telefono del paziente
            email: `${data.email}`, // Email del paziente
            gender: `${data.gender}`, // Genere del paziente
            birthDate: `${formattedBirthDate}`, // Data di nascita del paziente (formato AAAA-MM-GG)
            address: `${data.address}`, // Indirizzo del paziente
            city: `${data.city}`, // Città del paziente
            state: `${data.state}`, // Stato del paziente
            postalCode: `${data.postalCode}` // Codice postale del paziente
        }

        try {
            setIsLoading(true);
            await saveFile(`${profileInfo.storageUrl}/patient/Patient.ttl`, getPatientTurtle(newPatientInfo), session.fetch);
            const patient = await getPatientInfo(profileInfo.storageUrl, session.info.webId, session.fetch);
            setPatientInfo({ ...patient })
        } catch(error) {
            setError({
                isError: true,
                message: MESSAGE_ERROR_COMMUNICATION_POD
            })
        } finally {
            setIsLoading(false);
        }
    }

    return(
        <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
            <Paper
                sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%'
                }}
            >
                <Grid
                    container
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                    spacing={2}
                >
                    <Grid item>
                        <Avatar sx={{ width: 150, height: 150, fontSize: 50, border: "3px solid lightseagreen", backgroundColor: theme.palette.secondary.main }} variant="circle">{profileInfo?.name.charAt(0) || ""}</Avatar>
                    </Grid>
                    <Grid item>
                        <Typography sx={{ display: 'inline' }} component="div">
                            <b>Name:</b> {profileInfo?.name || ""}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography sx={{ display: 'inline' }} component="div">
                            <b>Email:</b> {profileInfo?.email || ""}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>
            </Grid>
            <Grid item xs={12} md={8}>
                <Paper
                    sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%'
                    }}
                >
                    <Typography variant="h5" align="center" gutterBottom>Profile Info</Typography>
                    <ProfileForm defaultValues={patientInfo ? {...patientInfo} : {...profileInfo}} onSubmit={onSubmitProfileForm} />
                </Paper>
            </Grid>
        </Grid>
    )
}

export default ProfilePage;