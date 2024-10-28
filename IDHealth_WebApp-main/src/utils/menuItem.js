import HomeTwoToneIcon from '@mui/icons-material/HomeTwoTone';
import ScaleTwoToneIcon from '@mui/icons-material/ScaleTwoTone';
import ArticleTwoToneIcon from '@mui/icons-material/ArticleTwoTone';
import OnDeviceTrainingTwoToneIcon from '@mui/icons-material/OnDeviceTrainingTwoTone';
import LockOpenTwoToneIcon from '@mui/icons-material/LockOpenTwoTone';
import LoginTwoToneIcon from '@mui/icons-material/LoginTwoTone';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

const menuPrivatePatientList = [
    {
        label: "Dashboard",
        path: "/",
        icon: (<HomeTwoToneIcon color="primary" sx={{ fontSize: 30 }} />)
    },
    {
        label: "Measurements",
        path: "/measurements",
        icon: (<ScaleTwoToneIcon color="primary" sx={{ fontSize: 30 }} />)
    },
    {
        label: "Model",
        path: "/model",
        icon: (<OnDeviceTrainingTwoToneIcon color="primary" sx={{ fontSize: 30 }} />)
    },
    {
        label: "Training",
        path: "/trainingpage",
        icon: (<FitnessCenterIcon color="primary" sx={{ fontSize: 30 }}/>)
    },/*
    {
        label: "Access Log",
        path: "/access",
        icon: (<ArticleTwoToneIcon color="primary" sx={{ fontSize: 30 }} />)
    },
    {
        label: "Doctor's Permits",
        path: "/permits",
        icon: (<LockOpenTwoToneIcon color="primary" sx={{ fontSize: 30 }} />)
    }*/
]

const menuPrivateDoctorList = [
    {
        label: "Dashboard",
        path: "/",
        icon: (<HomeTwoToneIcon color="primary" sx={{ fontSize: 30 }} />)
    }
]

const menuPublicList = [
    {
        label: "Login",
        path: "/login",
        icon: (<LoginTwoToneIcon color="primary" sx={{ fontSize: 30 }} />)
    }
]

export {
    menuPrivatePatientList,
    menuPrivateDoctorList,
    menuPublicList
}