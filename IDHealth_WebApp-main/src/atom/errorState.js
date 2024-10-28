import { atom } from "recoil";

const errorState = atom({
    key: 'errorState',
    default: {
        isError: false,
        message: ""
    }
});

export default errorState;