import { atom } from "recoil";

const accountBlockchainState = atom({
    key: 'accountBlockchainState',
    default: null
});

export default accountBlockchainState;