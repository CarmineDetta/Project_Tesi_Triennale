import React from "react";
import MUIDataTable from "mui-datatables";
import { IconButton, CircularProgress, Box } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

const options = {
  filterType: 'checkbox',
  selectableRows: 'none',
  responsive: 'standard',
};

function MeasurementDataTable({ data, isLoading, handleDelete, isDelete = true }) {

  const handleDeleteClick = async (item) => {
    try {
      console.log('Deleting item:', item);
      await handleDelete(item);
      toast.success('Eliminato con successo'); 
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Errore durante l\'eliminazione: ' + error.message);
    }
  };

  const columns = [
    {
      name: "deleteButton",
      label: " ",
      options: {
        filter: false,
        sort: false,
        empty: true,
        display: 'true',
        setCellProps: () => ({
          style: {
            width: '10px',
            textAlign: 'center',
          },
        }),
        customBodyRender: (value, tableMeta) => {
          const selectedItem = data[tableMeta.rowIndex];
          return (
            <IconButton aria-label="delete" onClick={() => handleDeleteClick(selectedItem)}>
              <DeleteIcon />
            </IconButton>
          );
        },
      },
    },
    {
      name: "value",
      label: "Blood Glucose (mg/dl)",
      options: {
        filter: true,
        sort: true,
        setCellProps: () => ({
          style: {
            width: '200px',
            textAlign: 'center',
          },
        }),
        customBodyRender: (value) => (value !== undefined && value !== 'N/A' ? `${value} mg/dl` : ''),
      },
    },
    {
      name: "dateTime",
      label: "Time",
      options: {
        filter: true,
        sort: true,
        setCellProps: () => ({
          style: {
            textAlign: 'center',
          },
        }),
        customBodyRender: (value) => (value !== undefined && value !== 'N/A' ? value : ''),
      },
    },
    {
      name: "timestamp",
      label: "Insertion Time",
      options: {
        filter: true,
        sort: true,
        setCellProps: () => ({
          style: {
            textAlign: 'center',
          },
        }),
        customBodyRender: (value) => (value !== undefined && value !== 'N/A' ? value : 'N/A'),
      },
    },
    {
      name: "date",
      label: "Date",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => (value !== undefined && value !== 'N/A' ? format(new Date(value), "yyyy/MM/dd") : ''),
      },
    },
  ];

  return (
    <Box position="relative">
      {isLoading && (
        <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
          <CircularProgress />
        </Box>
      )}
      <MUIDataTable
        title={"Measurements"}
        data={data}
        columns={columns}
        options={options}
      />
      
      <ToastContainer />
    </Box>
  );
}

export default MeasurementDataTable;
