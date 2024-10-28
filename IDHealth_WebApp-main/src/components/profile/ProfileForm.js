import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button, Grid, MenuItem, TextField } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const FIELD_REQUIRED = "The field is required";

const ProfileForm = ({ defaultValues, onSubmit }) => {
    const { handleSubmit, control, reset, formState: { errors } } = useForm({ defaultValues });

    useEffect(() => {
        reset(defaultValues); // Resetta i valori predefiniti quando cambiano
    }, [defaultValues, reset]);

    const handleFormSubmit = (data) => {
        onSubmit(data);
        reset();
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)}>
            <Grid container spacing={2}>
                <Grid item xs={12} md={2}>
                    <Controller
                        name="prefix"
                        control={control}
                        defaultValue=""
                        rules={{ required: FIELD_REQUIRED }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                select
                                fullWidth
                                label="Prefix"
                                error={!!errors.prefix}
                                helperText={errors.prefix && `${errors.prefix.message}`}
                            >
                                <MenuItem value="Mr.">Mr.</MenuItem>
                                <MenuItem value="Mrs.">Mrs.</MenuItem>
                            </TextField>
                        )}
                    />
                </Grid>

                {/* Nome */}
                <Grid item xs={12} md={5}>
                    <Controller
                        name="name"
                        control={control}
                        defaultValue=""
                        rules={{ required: FIELD_REQUIRED }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                fullWidth
                                label="Name"
                                error={!!errors.name}
                                helperText={errors.name && `${errors.name.message}`}
                            />
                        )}
                    />
                </Grid>

                <Grid item xs={12} md={5}>
                    <Controller
                        name="surname"
                        control={control}
                        defaultValue=""
                        rules={{ required: FIELD_REQUIRED }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                fullWidth
                                label="Surname"
                                error={!!errors.surname}
                                helperText={errors.surname && `${errors.surname.message}`}
                            />
                        )}
                    />
                </Grid>

                <Grid item xs={12} md={3}>
                    <Controller
                        name="gender"
                        control={control}
                        defaultValue=""
                        rules={{ required: FIELD_REQUIRED }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                select
                                fullWidth
                                label="Gender"
                                error={!!errors.gender}
                                helperText={errors.gender && `${errors.gender.message}`}
                            >
                                <MenuItem value="Male">Male</MenuItem>
                                <MenuItem value="Female">Female</MenuItem>
                                <MenuItem value="Unspecified">Unspecified</MenuItem>
                            </TextField>
                        )}
                    />
                </Grid>

                {/* Data di nascita */}
                <Grid item xs={12} md={3}>
                    <Controller
                        name="birthDate"
                        control={control}
                        defaultValue={null}
                        rules={{ required: FIELD_REQUIRED }}
                        format="yyyy-MM-dd"
                        render={({ field }) => (
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    {...field}
                                    fullWidth
                                    label="Birth Date"
                                    disableFuture
                                    slotProps={{
                                        textField: {
                                          variant: 'outlined',
                                          width: '100%',
                                          error: !!errors.birthDate,
                                          helperText: errors.birthDate && `${errors.birthDate.message}`,
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        )}
                    />
                </Grid>

                {/* Indirizzo */}
                <Grid item xs={12} md={6}>
                    <Controller
                        name="address"
                        control={control}
                        defaultValue=""
                        rules={{ required: FIELD_REQUIRED }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                fullWidth
                                label="Address"
                                error={!!errors.address}
                                helperText={errors.address && `${errors.address.message}`}
                            />
                        )}
                    />
                </Grid>

                {/* Città */}
                <Grid item xs={12} md={4}>
                    <Controller
                        name="city"
                        control={control}
                        defaultValue=""
                        rules={{ required: FIELD_REQUIRED }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                fullWidth
                                label="City"
                                error={!!errors.city}
                                helperText={errors.city && `${errors.city.message}`}
                            />
                        )}
                    />
                </Grid>

                {/* Stato */}
                <Grid item xs={12} md={4}>
                    <Controller
                        name="state"
                        control={control}
                        defaultValue=""
                        rules={{ required: FIELD_REQUIRED }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                fullWidth
                                label="State"
                                error={!!errors.state}
                                helperText={errors.state && `${errors.state.message}`}
                            />
                        )}
                    />
                </Grid>

                {/* Codice Postale */}
                <Grid item xs={12} md={4}>
                    <Controller
                        name="postalCode"
                        control={control}
                        defaultValue=""
                        rules={{ required: FIELD_REQUIRED }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                fullWidth
                                label="Postal Code"
                                error={!!errors.postalCode}
                                helperText={errors.postalCode && `${errors.postalCode.message}`}
                            />
                        )}
                    />
                </Grid>

                {/* Email */}
                <Grid item xs={12} md={6}>
                    <Controller
                        name="email"
                        control={control}
                        defaultValue=""
                        rules={{ required: FIELD_REQUIRED }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                fullWidth
                                label="Email"
                                error={!!errors.email}
                                helperText={errors.email && `${errors.email.message}`}
                            />
                        )}
                    />
                </Grid>

                {/* Numero di telefono */}
                <Grid item xs={12} md={6}>
                    <Controller
                        name="phoneNumber"
                        control={control}
                        defaultValue=""
                        rules={{ required: FIELD_REQUIRED }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                fullWidth
                                label="Number"
                                error={!!errors.phoneNumber}
                                helperText={errors.phoneNumber && `${errors.phoneNumber.message}`}
                            />
                        )}
                    />
                </Grid>

                {/* Button di invio */}
                <Grid item xs={12}>
                    <Grid container justifyContent="flex-end">
                        <Grid item>
                            <Button type="submit" variant="contained" color="primary">Save</Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </form>
    );
};

export default ProfileForm;
