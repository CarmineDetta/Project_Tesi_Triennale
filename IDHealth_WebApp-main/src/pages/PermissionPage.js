import { Button, Grid } from "@mui/material"
import PermissionDataTable from "../components/permission/PermissionDataTable"
import { universalAccess} from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import { useRecoilState, useRecoilValue } from "recoil";
import { profileState } from "../atom/profileState";
import { useEffect, useState } from "react";
import PermissionModal from "../components/permission/PermissionModal";
import PermissionForm from "../components/permission/PermissionForm";
import errorState from "../atom/errorState";
import { MESSAGE_ERROR_COMMUNICATION_POD } from "../utils/constants";
import { loaderState } from "../atom/loaderState";

const PermissionPage = () => {
    const { session } = useSession();
    const [data, setData] = useState([]);
    const profile = useRecoilValue(profileState);
    const [isModalAddPermission, setModalAddPermission] = useState(false);
    const [error, setError] = useRecoilState(errorState);
    const [isLoading, setIsLoading] = useRecoilState(loaderState);

    useEffect(() => {
        getPermissionsForResource();
    }, [])

    const handleRevoceAccess = async (webId) => {
        try {
            const measuramentResource = `${profile.storageUrl}/measuraments`;
            
            await universalAccess.setAgentAccess(
                measuramentResource, 
                webId, 
                { read: false, write: false},
                { fetch: session.fetch });

            getPermissionsForResource();
        } catch(error) {
            setError({
                isError: true,
                message: MESSAGE_ERROR_COMMUNICATION_POD
            })
        } finally {
            setIsLoading(false);
        }
    }

    const handleModalAddPermission = () => {
        setModalAddPermission(last => !last)
    }

    const getPermissionsForResource = async () => {

        try {
            setIsLoading(true);
            const measuramentResource = `${profile.storageUrl}/measuraments`;

            const agentsAccess = await universalAccess.getAgentAccessAll(measuramentResource, { fetch: session.fetch })

            const webIdsAcl = Object.keys(agentsAccess);

            const permissions = webIdsAcl.map((webId) => {

                return { 
                    webId, 
                    readAccess: agentsAccess[webId].read,
                    writeAccess: agentsAccess[webId].write
                }
            })

            setData(permissions)
        } catch(error) {
            setError({
                isError: true,
                message: MESSAGE_ERROR_COMMUNICATION_POD
            })
        } finally {
            setIsLoading(false);
        }
    }

    const handleAddPermission = async (data) => {
        try {
            setIsLoading(true);
            handleModalAddPermission();
            const measuramentResource = `${profile.storageUrl}/measuraments`;

            let isRead = false;
            let isWrite = false;

            if(data.permission === "read") {
                isRead = true;
            } else if(data.permission === "write") {
                isWrite = true;
            } else if(data.permission === "all") {
                isRead = true;
                isWrite = true;
            }

            await universalAccess.setAgentAccess(
                measuramentResource, 
                data.webId, 
                { read: isRead, write: isWrite},
                { fetch: session.fetch });

            await getPermissionsForResource();

        } catch(error) {
            setError({
                isError: true,
                message: MESSAGE_ERROR_COMMUNICATION_POD
            })
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            {isModalAddPermission && (
                <PermissionModal 
                    open={isModalAddPermission}
                    handleClose={handleModalAddPermission} 
                    handleSave={handleAddPermission} >
                        <PermissionForm onSubmit={handleAddPermission} />
                </PermissionModal>
            )}
            <Grid
                container
                direction="row"
                justifyContent="center"
                alignItems="flex-start"
                spacing={2} >
                    <Grid item xs={12} alignItems="flex-end">
                        <Button onClick={handleModalAddPermission} variant="contained">Add Permission</Button>
                    </Grid>
                    <Grid item xs={12}>
                        <PermissionDataTable data={data} handleDelete={handleRevoceAccess} />
                    </Grid>
        </Grid>
      </>
    )
}

export default PermissionPage;