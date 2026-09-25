import { supabase } from "../lib/supabaseClient";

// Para iniciar sesión
export const authService = {

  // Iniciar sesión
  async login (email: string, password: string) {

    // Intentamos obtener los datos que nos devuelve supabase
    const {data, error} = await  supabase.auth.signInWithPassword ({
      email,      // Igual a poner email:email
      password
    })

    // Si existe error
    if (error) {
      throw error;
    }

    return data;
  },

  // Cerrar sesión
  async logout () {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  }
}