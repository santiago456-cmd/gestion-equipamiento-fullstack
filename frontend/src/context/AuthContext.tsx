// src/context/AuthContext.tsx

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';

import { authApi } from '../api/authApi';
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
} from '../api/authApi';
import type { UsuarioAutenticado } from '../types/auth';

interface AuthContextValue {
  usuario: UsuarioAutenticado | null;
  isAuthenticated: boolean;

  /** true mientras se verifica la cookie de sesión al cargar la app */
  isLoading: boolean;

  login: (credentials: LoginPayload) => Promise<LoginResponse>;
  register: (datos: RegisterPayload) => Promise<RegisterResponse>;
  logout: () => Promise<void>;

  /**
   * Actualiza el usuario en memoria/localStorage sin pasar por login
   * (ej. tras editar el perfil).
   */
  actualizarUsuario: (usuario: UsuarioAutenticado) => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(() => {
    const stored = localStorage.getItem('usuario');

    return stored
      ? (JSON.parse(stored) as UsuarioAutenticado)
      : null;
  });

  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem('usuario');
    setUsuario(null);
  }, []);

  /*
   * Al montar la aplicación comprobamos contra el backend
   * si la cookie de sesión continúa siendo válida.
   */
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const { usuario: usuarioActual } = await authApi.me();

        if (!cancelled) {
          localStorage.setItem(
            'usuario',
            JSON.stringify(usuarioActual),
          );

          setUsuario(usuarioActual);
        }
      } catch {
        if (!cancelled) {
          clearSession();
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  /*
   * Permite que la capa HTTP notifique al contexto cuando
   * el backend determine que la sesión expiró.
   */
  useEffect(() => {
    window.addEventListener(
      'auth:session-expired',
      clearSession,
    );

    return () => {
      window.removeEventListener(
        'auth:session-expired',
        clearSession,
      );
    };
  }, [clearSession]);

  const login = useCallback(
    async ({
      email,
      password,
    }: LoginPayload): Promise<LoginResponse> => {
      const data = await authApi.login({
        email,
        password,
      });

      localStorage.setItem(
        'usuario',
        JSON.stringify(data.usuario),
      );

      setUsuario(data.usuario);

      return data;
    },
    [],
  );

  const register = useCallback(
    async (
      datos: RegisterPayload,
    ): Promise<RegisterResponse> => {
      return authApi.register(datos);
    },
    [],
  );

  const actualizarUsuario = useCallback(
    (nuevoUsuario: UsuarioAutenticado) => {
      localStorage.setItem(
        'usuario',
        JSON.stringify(nuevoUsuario),
      );

      setUsuario(nuevoUsuario);
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Limpiamos la sesión local aunque falle la llamada al backend.
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      isAuthenticated: Boolean(usuario),
      isLoading,
      login,
      register,
      logout,
      actualizarUsuario,
    }),
    [
      usuario,
      isLoading,
      login,
      register,
      logout,
      actualizarUsuario,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth debe usarse dentro de <AuthProvider>',
    );
  }

  return context;
}