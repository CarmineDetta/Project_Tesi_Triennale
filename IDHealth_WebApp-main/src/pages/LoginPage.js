import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  styled,
  Stack,
  Grid,
  Button,
} from '@mui/material';
import { LoginButton, useSession } from '@inrupt/solid-ui-react';
import { Navigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { loaderState } from '../atom/loaderState';

const authOptions = {
  clientName: 'healtcareDiabetes'
};

const StyledFormControl = styled(FormControl)({
  width: '100%',
  marginBottom: (theme) => theme.spacing(2),
});

const StyledSelect = styled(Select)({
  width: 300,
  marginBottom: (theme) => theme.spacing(2),
});

const LoginPage = () => {
  const [oidcIssuer, setOidcIssuer] = useState('');
  const { session } = useSession();

  const handleChangeOicd = (event) => {
    setOidcIssuer(event.target.value);
  };

  return (!session || (!session?.info?.isLoggedIn)) ? (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        justifyContent: "center"
      }}>
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="center"
          spacing={2}
        >
          <Stack><Typography align="center" variant="h3" color="primary" gutterBottom>Select Provider</Typography></Stack>
          <Stack>
            <StyledFormControl>
                <InputLabel id="login_provider">Provider</InputLabel>
                <StyledSelect
                  labelId="login_provider"
                  id="login_provider"
                  value={oidcIssuer}
                  onChange={handleChangeOicd}
                >
                <MenuItem value={'https://login.inrupt.com'}>
                  Inrupt
                </MenuItem>
              </StyledSelect>
            </StyledFormControl>
          </Stack>
          <Stack>
            <LoginButton
              oidcIssuer={oidcIssuer}
              redirectUrl={window.location.href}
              authOptions={authOptions}
            >
              <Button variant="contained" color="primary" >Login</Button>
            </LoginButton>
          </Stack>
        </Stack>
    </Paper>
  ) : (<Navigate to="/" />);
};

export default LoginPage;
