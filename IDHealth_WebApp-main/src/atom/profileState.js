import { atom } from 'recoil';

export const profileState = atom({
  key: 'profileState',
  default: {
    name: '',
    email: '',
    storageUrl: null
  },
});