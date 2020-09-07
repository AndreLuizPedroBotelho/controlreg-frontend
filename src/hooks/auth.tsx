import React, {
  createContext,
  useCallback,
  useState,
  useContext,
  useMemo,
} from 'react';
import jwtDecode from 'jwt-decode';

interface Company {
  id: number;
  name: string;
}

interface User {
  id: string;
  typeUser: string;
  email: string;
  companies: Company[];
}

interface AuthContextData {
  signIn(token: string): void;
  signOut(): void;
  getUser: User;
  token: string | null;
  typeUser: string;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const AuthProvider: React.FC = ({ children }) => {
  const [jwtToken, setJwtToken] = useState(
    localStorage.getItem('@ControlReg:jwtToken'),
  );

  const signIn = useCallback(async (token: string) => {
    localStorage.setItem('@ControlReg:jwtToken', token);
    setJwtToken(token);
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem('@ControlReg:jwtToken');
    setJwtToken(null);
  }, []);

  const getUser = useMemo(() => {
    if (!jwtToken) {
      return {} as User;
    }
    const tokenDecoded: any = jwtDecode(jwtToken);
    return tokenDecoded.user as User;
  }, [jwtToken]);

  const typeUser: string = useMemo(() => {
    if (!jwtToken) {
      return '';
    }
    const tokenDecoded: any = jwtDecode(jwtToken);
    return tokenDecoded.user.typeUser;
  }, [jwtToken]);

  return (
    <AuthContext.Provider
      value={{
        token: jwtToken,
        typeUser,
        signIn,
        signOut,
        getUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider');
  }

  return context;
}

export { AuthProvider, useAuth };
