import * as React from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { menuPrivateDoctorList, menuPrivatePatientList, menuPublicList } from '../utils/menuItem';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountMenu from './AccountMenu';
import { useSession } from '@inrupt/solid-ui-react';
import { themeOptions } from '../theme';
import { DOCTOR_ROLE, PATIENT_ROLE } from '../utils/constants';
import { useRecoilValue } from 'recoil';
import { profileState } from '../atom/profileState';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
        Carmine Detta{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
);

const defaultTheme = createTheme(themeOptions);

export default function Dashboard({ children }) {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const { session } = useSession();
  const profile = useRecoilValue(profileState);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleNavigatePath = (path) => {
    navigate(path)
  }

  const isLoggedIn = () => {
    if(!session) return false;

    return session?.info?.isLoggedIn
  }

  const getMenuListItems = () => {
    if(!isLoggedIn()) {
      return menuPublicList.map(({ label, path, icon }) => (
        <ListItemButton onClick={() => handleNavigatePath(path)}>
          <ListItemIcon>
            {icon}
          </ListItemIcon>
          <ListItemText>{label}</ListItemText>
        </ListItemButton>
      ));
    }

    if(isLoggedIn() && profile && profile.role && profile.role.toLowerCase() === PATIENT_ROLE) {
      return menuPrivatePatientList.map(({ label, path, icon }) => (
        <ListItemButton onClick={() => handleNavigatePath(path)}>
          <ListItemIcon>
            {icon}
          </ListItemIcon>
          <ListItemText>{label}</ListItemText>
        </ListItemButton>
      ));
    }

    if(isLoggedIn() && profile && profile.role && profile.role.toLowerCase() === DOCTOR_ROLE) {
      return menuPrivateDoctorList.map(({ label, path, icon }) => (
        <ListItemButton onClick={() => handleNavigatePath(path)}>
          <ListItemIcon>
            {icon}
          </ListItemIcon>
          <ListItemText>{label}</ListItemText>
        </ListItemButton>
      ));
    }
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="absolute" open={open}>
          <Toolbar
            sx={{
              pr: '24px'
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: '36px',
                ...(open && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              {!open && (<img src="logo_secondary.png" height="70px" />) }
            </Typography>
            {isLoggedIn() && (<AccountMenu />)}
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: [1],
            }}
          >
              <img src="logo_primary.png" height="70px" />
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <List component="nav">
            {getMenuListItems()}
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <Toolbar />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {children}
            <Copyright sx={{ pt: 4 }} />
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}