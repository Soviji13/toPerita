import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { authService } from '../services/auth.service';

/**
 * Este Script guarda el contexto global que necesita el frontend en todo momento
 * De esta forma, no hace falta leer props en cada momento para tomar una decisión
 * 
 * Se aplica patrón observer con suscribe
 */

// Definimos el contrato (lo que guardará nuestro contexto)
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  logout: () => Promise<void>;
}

// Creamos un contexto vacío, que además de almacenar lo definido, también
// almacena lo que devuelve createContext (un componente Provider y más cosas)
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  logout: async () => {},
});

// Como entrada se reciben componentes de react
export function AuthProvider({ children }: { children: ReactNode }) {

  // Declaramos datos a guardar
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Declaramos función logout 
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Error cerrando sesión en Supabase:", error);
    } finally {
      // Quitamos la sesión y el usuario
      setSession(null);
      setUser(null);
    }
  }

  /**
   * Se ejecuta cada vez que la página se recarga y el componente ya está montado en el DOM
   * En este caso, solo se ejecuta por primera vez que se accede o que se recarga la página
  */
  useEffect(() => {

    // Variable para indicar que la página está montada completamente
    let isMounted = true;

    /** 
     * Forzamos la comprobación inicial de sesión. 
     * No se pone async en useEffect porque React no soporta que useEffect sea asíncrono
     * Se debe declarar la función aunque solo se invoque una vez, debido a que es asíncrona en un bloque no asíncrono
    */
    async function initSession() {
      try {

        // Intentamos obtener la sesión actual
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        // Si isMounted, guardamos la sesión y el usuario (si hay)
        if (isMounted) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
        }
      } catch (err) {
        console.error('Error al verificar sesión inicial:', err);
      } finally {
        // Quitamos la carga
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    // Ejecutamos la función
    initSession();

    /**
     * data: { suscription } es literalmente un objeto data, y nos quedamos con el sub-objeto que tiene
     * que es { suscription }   (eso es lo que devuelve onAuthStateChange)
     * 
     * En este momento, nos suscribimos a escuchar cualquier cambio de autentificaqción que ocurra
     * De esta forma, no tenemos que estar ejecutando constantemente la función
     * 
     * Se solicita cuando se cambia el estado de la autentificación
     * - _event: Es el tipo de evento, SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED
     * - currentSession es la sesión actual
     * 
     * Estas dos propiedades son parámetros de onAuthStateChange, las cuales vamos a utilizar realizando
     * el bloque que sigue => {}
     * 
     * Estos parámetros se definen 'solos' cada vez que ocurre onAuthStage, y luego se puede hacer lo que
     * veamos necesario con estos (onAuthState es una función CallBack)
     * 
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      // Si el componente está montado, almacenamos la sesión real y el usuario. Quitamos la carga
      if (isMounted) {
        setSession(currentSession);              // CurrentSession contiene el token de acceso, nuevos tokens, cuándo expira y el usuario
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    });

    // Cuando el componente se desmonte o se vuelva a tener que ejecutar useEffect
    return () => {
      isMounted = false;              // Indicamos que la página no está montada
      subscription.unsubscribe();     // Nos desuscribimos para evitar fallos
    };
  }, []);

  /**
   * Devolvemos el provider del AuthContext, que emite los datos de value a los hijos
   */
  return (
    <AuthContext.Provider value={{ user, session, loading, logout}}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Exportamos una función que nos devuelve todo este contexto de autentificación
 * Cada vez que se invoca desde un hijo del provider, busca el provider y obtiene
 * sus value. 
 *
 * Si no encuentra el provider porque no se encontraba dentro de un padre provider, devuelve
 * el objeto definido arriba del todo con campos null 
 */
export function useAuthContext() {
  return useContext(AuthContext);
}