import { handleIncomingRedirect, login, logout, EVENTS } from "@inrupt/solid-client-authn-browser";
import { useContext, createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { loaderState } from "../../atom/loaderState";
import { profileState } from "../../atom/profileState";
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(JSON.parse(localStorage.getItem("session")) || "");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useRecoilState(loaderState);

  useEffect(() => {
    loadHandleIncomingRedirect();
    if(!session || (session && !session.isLoggedIn)) navigate('/login');
  }, []);

  const loadHandleIncomingRedirect = async () => {
    try {
      // Gestisce il reindirizzamento dopo il login
      const dataSession = await handleIncomingRedirect({
        restorePreviousSession: true,
      })

      if (dataSession && dataSession.isLoggedIn) {
        setSession(dataSession);
        localStorage.setItem("session", JSON.stringify(dataSession));
        navigate("/");
      }
    } catch(error) {
      console.log('Errore', error)
    }
  }
  
  const loginAction = async (data) => {
    const clientId = '15b2d757-0a45-4315-8a39-d7b0cf8f79d9'; // Client ID del backend
    const clientSecret = '32910c4b-bed9-4cef-a9ed-a0597d827eb1'; // Client Secret del backend
    try {
      setIsLoading(true);
      await login({
        oidcIssuer: "https://login.inrupt.com", // Provider Solid Pod
        redirectUrl: window.location.href,
        clientName: "Healthcare",
        clientId: clientId, // Utilizza il client ID
        clientSecret: clientSecret, // Utilizza il client secret
      });
    } catch (err) {
      console.error(err);
      throw new Error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const logOut = async () => {
    await logout();
    setSession(null);
    localStorage.removeItem("session");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ session, loginAction, logOut }}>
      {children}
    </AuthContext.Provider>
  );

};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};