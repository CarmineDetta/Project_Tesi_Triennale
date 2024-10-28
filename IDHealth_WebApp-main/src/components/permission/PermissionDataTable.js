import React from "react"
import MUIDataTable from "mui-datatables";
import { Checkbox, IconButton } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';

const options = {
    filterType: 'checkbox',
    selectableRows: false
};

function PermissionDataTable({ data, handleDelete }) {
    const columns = [
        {
            name: "deleteButton",
            label: " ",
            options: {
             filter: false,
             sort: false,
             empty: true,
             setCellProps: () => ({
                style: {
                  width: '10px'
                }
            }),
             customBodyRender: (value, tableMeta) => (
                <IconButton aria-label="delete" onClick={() => handleDelete(data[tableMeta.rowIndex].webId)}>
                    <DeleteIcon />
                </IconButton>
             )
            }
        },
        {
            name: "webId",
            label: "Web ID",
            options: {
                filter: true,
                sort: true,
                setCellProps: () => ({
                    style: {
                      width: '250px'
                    }
                }),
            }
        },
        {
            name: "readAccess",
            label: "Read Access",
            options: {
                filter: true,
                sort: false,
                setCellProps: () => ({
                    style: {
                      width: '150px',
                    }
                }),
                customBodyRender: (value, tableMeta) => (
                    <Checkbox disabled checked={value} />
                )
            }
        },
        {
            name: "writeAccess",
            label: "Write Access",
            options: {
                filter: true,
                sort: false,
                customBodyRender: (value, tableMeta) => (
                    <Checkbox disabled checked={value} />
                )
            }
        }
    ];

    return (
        <MUIDataTable
            title={"Measuraments"}
            data={data}
            columns={columns}
            options={options}
            style={{ with: "100%" }}
        />
    );
}

export default PermissionDataTable;
