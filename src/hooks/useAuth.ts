import { useState } from "react";
import { authService } from "../services/auth.service";

export function useLogin() {

  // Para inhabilitar el botón de acceder mientras está en false
  const [loading, setLoading] = useState<boolean>(false);

  // El error puede ser un string o null
  const [error, setError] = useState<string | null>(null);

  // Solicitamos el login al service (nos devuelve null o data)
  const login = async (email: string, password: string) => {

    if (!email.trim() || !password.trim()) {
      setError ("Rellene todos los campos, por favor");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Intentamos recoger los datos del service
      const data = await authService.login(email, password);
      return data;
      // Si da error
    } catch (error) {
      setError('El correo o contraseña no son correctos. Por favor, inténtelo de nuevo');
      return null;
    } finally {
      setLoading(false);
    }
  };

  function writeError (error: string) {
    setError(error);
  };

  return {login, loading, error, writeError};
}
