import { InputLogin } from "../../components/common/InputLogin"
import { SendButton } from "../../components/common/SendButton";

import { useNavigate } from "react-router-dom";
import { useState, type FormEvent } from "react"
import { useLogin } from "../../hooks/useAuth";

export function AuthPage () {

  /**
   * Falta cambiar el texto del botón de mostrar contraseña
   * en función de si se está mostrando u ocultando
   */

  // ---------- Inicialización de variables ---------------------------------------------------------------------

  // Guardamos el valor de correo y contraseña
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // Obtenemos los valores que nos devuelve el hook
  const {login, loading, error} = useLogin();

  // Guardamos si queremos que se vea la contraseña
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const navigate = useNavigate();

  // ---------- Manejadores de botones ---------------------------------------------------------------------------
  
  // Evitamos default de submit y manejamos algunos errores
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Le enviamos los datos a supabase y recogemos info para ver si la cosa ha ido bien
    const data = await login(email, password);
    if (data) {
      navigate("/gallery");
    }
  }

  // Para mostrar o no la contraseña
  const toggleShowPassword = () => setShowPassword((prev) => (!prev));

  // ---------- Interfaz ------------------------------------------------------------------------------------------

  return (
    <form 
      onSubmit={handleSubmit}
      className="bg-auth-box rounded box-border p-5 text-white"
      >
      <p>Inicia sesión:</p>

      <InputLogin 
        label="Correo" 
        id="mail"
        type="email"
        placeholder="user@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <div className="flex">
        <InputLogin 
          label="Contraseña" 
          id="psw"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <SendButton type="button" onClick={toggleShowPassword}>Mostrar</SendButton>
      </div>

      {error && <p>{error}</p>}

      <SendButton type="submit" disabled={loading}>Acceder</SendButton>
    </form>
  )
}