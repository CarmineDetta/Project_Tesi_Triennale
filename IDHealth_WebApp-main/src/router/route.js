import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/auth/AuthProvider";
import { useSession } from "@inrupt/solid-ui-react";
import { useRecoilValue } from "recoil";
import { profileState } from "../atom/profileState";

const PrivateRoute = () => {
  const { session } = useSession();
  const profile = useRecoilValue(profileState);

  if (!session || (!session?.info?.isLoggedIn)) return <Navigate to="/login" />;
  
  return <Outlet />;
};

export default PrivateRoute;