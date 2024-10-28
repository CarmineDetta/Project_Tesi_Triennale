import { useCallback, useEffect } from "react";
import { useAuth } from "../hooks/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { profileState } from "../atom/profileState";

const Login = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const profile = useRecoilValue(profileState)

  const navigateDashboard = useCallback(() => {
    navigate("/");
  }, []);

  useEffect(() => {
    ('auth.session', auth.session)
    if(auth.session && auth.session.isLoggedIn) {
        navigateDashboard()
    }
  }, [auth.session]);

  return (
    <button onClick={auth.loginAction}>Effettua il Login</button>
  );
};

export default Login;