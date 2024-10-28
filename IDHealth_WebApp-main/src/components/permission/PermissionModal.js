import * as React from 'react';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Button, Checkbox, Grid, IconButton, MenuItem } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function PermissionModal({ open, handleClose, children }) {
    return (
        <Dialog
            open={open}
            onClose={handleClose}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
                Add Permission
                <IconButton aria-label="close" onClick={handleClose} sx={{ ml: 'auto' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                {children}
            </DialogContent>
        </Dialog>
    );
}