import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button, DialogActions, Grid, MenuItem, TextField } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const FIELD_REQUIRED = "The field is required";
const INVALID_URL = "Enter a valid URL"
// Espressione regolare per validare un URL
const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;

const PermissionForm = ({ onSubmit }) => {
    const { handleSubmit, control, reset, formState: { errors } } = useForm();

    const handleFormSubmit = (data) => {
        onSubmit(data);
        reset();
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Controller
                        name="webId"
                        control={control}
                        defaultValue=""
                        rules={{ 
                            required: FIELD_REQUIRED,
                            pattern: {
                                value: urlRegex,
                                message: INVALID_URL
                            }
                        }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                fullWidth
                                label="Web ID"
                                error={!!errors.webId}
                                helperText={errors.webId && `${errors.webId.message}`}
                            />
                        )}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Controller
                        name="permission"
                        control={control}
                        defaultValue=""
                        rules={{ required: FIELD_REQUIRED }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                select
                                fullWidth
                                label="Permission"
                                error={!!errors.permission}
                                helperText={errors.permission && `${errors.permission.message}`}
                            >
                                <MenuItem value="read">Read</MenuItem>
                                <MenuItem value="write">Write</MenuItem>
                                <MenuItem value="all">Read and Write</MenuItem>
                            </TextField>
                        )}
                    />
                </Grid>

                {/* Button di invio */}
                <Grid item xs={4}></Grid>
                <Grid item xs={4}></Grid>
                <Grid item xs={4}>
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                        Add
                    </Button>
                </Grid>
            </Grid>
        </form>
    );
};

export default PermissionForm;
