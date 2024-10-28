import React, { useEffect, useState } from "react";
import { useSession } from "@inrupt/solid-ui-react";
import { getSolidDataset, getThing, getStringNoLocale, getUrlAll, getContainedResourceUrlAll, getFile } from "@inrupt/solid-client";
import { DOCTOR_ROLE, MESSAGE_ERROR_UNAUTHORIZED, NS_PIM_SPACE_STORAGE, PATIENT_ROLE, VCARD_PREDICATE } from "../utils/constants";
import { useNavigate } from "react-router-dom";
import { Button, Grid, Link, Paper, Skeleton, Stack, Typography, useTheme } from "@mui/material";
import SparqlQueryExecutor from "../utils/sparqlQueryExecutor";
import { useRecoilState } from "recoil";
import errorState from "../atom/errorState";
import { profileState } from "../atom/profileState";
import { patientState } from "../atom/patientState";
import { getPatientInfo, profileQl } from "../utils/solidDataUtils";
import dayjs from "dayjs";
import { loaderState } from "../atom/loaderState";
import { toast } from "react-toastify";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import DashboardDoctor from "./DashboardDoctor";
import { logout } from "@inrupt/solid-client-authn-browser";
import { handleIncomingRedirect } from "@inrupt/solid-client-authn-browser";

const Dashboard = () => {
  const { session } = useSession();
  const navigate = useNavigate();
  const [error, setError] = useRecoilState(errorState);
  const [profile, setProfile] = useRecoilState(profileState);
  const [patient, setPatient] = useRecoilState(patientState);
  const [isLoading, setIsLoading] = useRecoilState(loaderState);
  const [totalMeasure, setTotalMeasure] = useState(null);
  const theme = useTheme();

  const sparqlExecutor = new SparqlQueryExecutor();

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Initial session info:", session.info);
        if (!session.info.isLoggedIn) {
          await handleIncomingRedirect();
          console.log("Post redirect session info:", session.info);
          if (!session.info.isLoggedIn) {
            navigate("/login"); // Reindirizza al login se la sessione non è attiva
            return;
          }
        }
        console.log("Sessione attiva:", session.info);
        console.log("Fetch function:", session.fetch);
        console.log("WebId:", session.info.webId);
      } catch (error) {
        console.error("Errore durante il check della sessione:", error);
      }
    };

    checkSession();

    if (session.info.webId) {
      fetchProfileInfo(session.info.webId);
    }
  }, [session, navigate]);

  useEffect(() => {
    if (profile && profile.storageUrl) {
      console.log("Fetching patient info with storageUrl:", profile.storageUrl);
      fetchPatientInfo(profile.storageUrl, session.info.webId, session.fetch);
      if (profile.role === PATIENT_ROLE) {
        fetchCountMeasure(profile.storageUrl, session.fetch);
      }
    }
  }, [profile]);

  const fetchProfileInfo = async (webId) => {
    try {
      setIsLoading(true);
      console.log("Fetching profile info for webId:", webId);
      const dataset = await getSolidDataset(webId, { fetch: session.fetch });
      const profileThing = getThing(dataset, webId);
      const podsUrls = getUrlAll(profileThing, NS_PIM_SPACE_STORAGE);
      const pod = podsUrls[0];
      
      console.log("Profile pods URLs:", podsUrls);
      console.log("Selected pod:", pod);

      const profileInfo = await sparqlExecutor.executeQuery(`${pod}profile`, profileQl(pod), session.fetch);
      console.log("Profile info:", profileInfo);

      const role = await getRole(pod, webId);
      console.log("User role:", role);

      if (!role || ![PATIENT_ROLE, DOCTOR_ROLE].includes(role.trim().toLowerCase())) {
        console.log("Unauthorized role detected:", role);
        setError({
          isError: true,
          message: MESSAGE_ERROR_UNAUTHORIZED,
        });
        await logOut();
        return;
      }

      setProfile({
        name: profileInfo.name,
        email: profileInfo.email.replace("mailto:", ""),
        storageUrl: pod,
        role: role.trim().toLowerCase(),
      });
    } catch (error) {
      console.error("Error fetching profile:", error.message);
      setError({
        isError: true,
        message: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRole = async (pod, id) => {
    try {
      console.log("Fetching role from pod:", pod, "with id:", id);
      const dataset = await getSolidDataset(`${pod}profile`, { fetch: session.fetch });
      const profileThingX = getThing(dataset, id);
      const role = getStringNoLocale(profileThingX, `${VCARD_PREDICATE}role`);
      console.log("Role retrieved:", role);
      return role;
    } catch (error) {
      console.error("Error fetching role:", error.message);
      setError({
        isError: true,
        message: error.message,
      });
      return null;
    }
  };

  const logOut = async () => {
    try {
      console.log("Logging out...");
      await logout();
      localStorage.removeItem("session");
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error.message);
    }
  };

  async function fetchPatientInfo(storageUrl, webId, sessionFetch) {
    try {
      setIsLoading(true);
      const patientFolderUrl = `${storageUrl}/patient/Patient.ttl`;
      console.log("Checking existence of patient file at:", patientFolderUrl);
      const isExisting = await getFile(patientFolderUrl, { fetch: session.fetch });

      if (!isExisting) {
        console.log("Patient file does not exist at:", patientFolderUrl);
        return false;
      }

      const patient = await getPatientInfo(storageUrl, webId, sessionFetch);
      console.log("Patient info fetched:", patient);
      setPatient({ ...patient });

      return patient;
    } catch (error) {
      console.error("Error fetching patient info:", error.message);
      setError({
        isError: true,
        message: error.message,
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  const fetchCountMeasure = async (storageUrl, fetch) => {
    try {
      setIsLoading(true);
      let totalCount = 0;
      const measuramentUrl = `${storageUrl}measuraments`;

      console.log("Fetching measurements from URL:", measuramentUrl);
      const dataset = await getSolidDataset(measuramentUrl, { fetch });
      const containedResourceUrls = getContainedResourceUrlAll(dataset, { fetch });
      console.log("Contained resource URLs:", containedResourceUrls);

      for (const containedResourceUrl of containedResourceUrls) {
        const datasetDayMeasure = await getSolidDataset(containedResourceUrl, { fetch });
        const containedResourceDayMeasure = getContainedResourceUrlAll(datasetDayMeasure, { fetch });
        console.log("Contained resource day measure URLs:", containedResourceDayMeasure);
        totalCount += containedResourceDayMeasure.length;
      }

      console.log("Total measurements count:", totalCount);
      setTotalMeasure(totalCount);
    } catch (error) {
      if (error.message.includes("401")) {
        console.error("Unauthorized access - 401. Redirecting to login.");
        toast.error("Session expired. Please log in again.");
        await logOut();
      } else {
        console.error("Error fetching measurements count:", error.message);
        setError({
          isError: true,
          message: error.message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMeasurement = () => {
    navigate("/measurament/insert");
  };

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} md={profile && profile.role === PATIENT_ROLE ? 6 : 12}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              height: 270,
              justifyContent: "center"
            }}>
            <Stack
              direction="column"
              justifyContent="center"
              alignItems="center"
              spacing={2}
            >
              <Stack><AssignmentIndIcon sx={{ color: theme.palette.primary.dark, fontSize: 55 }} /></Stack>
              <Stack>
                <Typography align="center" variant="h6" color="primary" gutterBottom> Welcome {profile?.name}!</Typography>
              </Stack>
              <Stack>
                {isLoading ? (<Skeleton animation="wave"></Skeleton>)
                  : (<Typography gutterBottom><strong>WebId:</strong> <i>{session?.info?.webId}</i></Typography>)}
              </Stack>
              <Stack>
                {isLoading ? (<Skeleton animation="wave"></Skeleton>)
                  : (<Typography gutterBottom><strong>Email:</strong> <i>{profile?.email}</i></Typography>)}
              </Stack>
              {!patient && profile?.role === PATIENT_ROLE &&
                (<Stack><Typography>To use the application <Link onClick={() => navigate("/profile")}>set up your profile</Link></Typography></Stack>)}
            </Stack>
          </Paper>
        </Grid>
        {profile?.role === PATIENT_ROLE && (
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: 270,
                justifyContent: "center"
              }}>
              <Stack
                direction="column"
                justifyContent="center"
                alignItems="center"
                spacing={2}
              >
                <Stack><VolunteerActivismIcon sx={{ color: theme.palette.primary.dark, fontSize: 55 }} /></Stack>
                <Stack>
                  <Typography align="center" variant="h6" color="primary" gutterBottom>Measurements</Typography>
                </Stack>
                {patient && profile.role === PATIENT_ROLE && (
                  <>
                    {console.log('Rendering Add Measurement Button')}
                    <Stack>
                      <Button variant="contained" onClick={handleAddMeasurement}>
                        Add Measurement
                      </Button>
                    </Stack>
                  </>
                )}
              </Stack>
            </Paper>
          </Grid>
        )}
        {profile?.role === DOCTOR_ROLE && (<Grid item xs={12}><DashboardDoctor /></Grid>)}
      </Grid>
    </>
  );
};

export default Dashboard;
