import { atom } from "recoil";

const contractBlockchainState = atom({
    key: 'contractBlockchainState',
    default: null
});

export default contractBlockchainState;