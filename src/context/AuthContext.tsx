import React, { createContext, useContext, useState, useEffect } from 'react';
import { apolloClient } from '../lib/apollo/client';
import { LOGIN_USER, REGISTER_USER, GET_ME } from '../lib/graphql/operations';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Verify token is still valid
          try {
            const result = await apolloClient.query({
              query: GET_ME,
              fetchPolicy: 'network-only',
            });
            
            const data = result.data as any;
            
            if (data?.me) {
              setUser(data.me);
              localStorage.setItem('user', JSON.stringify(data.me));
            }
          } catch (error) {
            console.error('Error fetching user:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setUser(null);
          }
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const result = await apolloClient.mutate({
        mutation: LOGIN_USER,
        variables: { email, password },
      });

      const data = result.data as any;
      const errors = (result as any).errors;

      if (errors || !data?.login) {
        return {
          success: false,
          message: errors?.[0]?.message || 'Login failed',
        };
      }

      const { user: loggedInUser, token } = data.login;

      // Store token and user
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);

      // Reset Apollo cache
      await apolloClient.resetStore();

      return {
        success: true,
        message: data.login.message || 'Login successful',
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'An error occurred during login',
      };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const result = await apolloClient.mutate({
        mutation: REGISTER_USER,
        variables: { name, email, password },
      });

      const data = result.data as any;
      const errors = (result as any).errors;

      if (errors || !data?.register) {
        return {
          success: false,
          message: errors?.[0]?.message || 'Registration failed',
        };
      }

      const { user: registeredUser, token } = data.register;

      // Store token and user
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(registeredUser));
      setUser(registeredUser);

      // Reset Apollo cache
      await apolloClient.resetStore();

      return {
        success: true,
        message: data.register.message || 'Registration successful',
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.message || 'An error occurred during registration',
      };
    }
  };

  const logout = () => {
    // Clear storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);

    // Reset Apollo cache
    apolloClient.resetStore();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
