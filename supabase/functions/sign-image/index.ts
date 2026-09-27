import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

/**
 * Desde el backend le damos permisos a cualquiera para acceder a este end-point
 * 
 * Access-Control-Allow-Origin es el origen que permitimos (* indica cualquiera)
 * 
 * Access-Control-Allow-Headers indica las cabceceras (metadatos) que pueden llegar al servidor:
 * - El token de sesión
 *  - La clave pública de supabase
 *  - La versión del cliente
 *  - El formato de los datos que vienen en el cuerpo
 * */ 
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Serve es una función utilitaria de Deno. Levanta y pone en marcha un servidor HTTP
 * Cuando llega una petición por Internet dirigida al Edge Function específico, serve
 * la atrapa y ejecuta la función callback de dentro (async (req))
 * 
 * Req es la petición que representa lo que el cliente ha enviado
 */
serve (async (req) => {

  /**
   * Si el método es OPTIONS (pedir al servidor qué cabeceras admite, qué metodos y qué permisos tiene el cliente)
   * A esta petición se le conoce como Preflight request
   */
  if (req.method === "OPTIONS") {
    // Le devolvemos ok con las cabeceras con las cabeceras permitidas (declaradas arriba) al cliente
    return new Response("ok", { headers: corsHeaders });
  }

  try {

    // Obtenemos de las cabeceras de la petición la autorización (debe ser válida)
    const authHeader = req.headers.get("Authorization");

    // Si no nos devuelve nada
    if (!authHeader) {
      // Devolvemos error de no autorizado
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Si pudimos autenticarnos

    // Creamos un usuario de supabase (se puede comunicar con los servicios de supabase)
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Obtenemos los datos o el error
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    // Si hay error o no hay usuario
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Sesión inválida o expirada" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Si hay usuario

    // Obtenemos el idPublico de la foto en la petición
    const { publicId } = await req.json();
    if (!publicId) {
      return new Response(JSON.stringify({ error: "Falta el identificador publicId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Si se pudo obtener

    // Ponemos las credenciales de Cloudinary
    const cloudName = Deno.env.get("CLOUDINARY_CLOUD_NAME");
    const apiSecret = Deno.env.get("CLOUDINARY_API_SECRET");

    // Si no se han podido obtener los datos
    if (!cloudName || !apiSecret) {
      return new Response(JSON.stringify({ error: "Faltan credenciales en el servidor" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Si se han podido obtener los datos

    // Parámetro de expiración: válida durante 1 hora 
    const timestamp = Math.floor(Date.now() / 1000);
    const expiration = timestamp + 3600;

    // Firma criptográfica HMAC-SHA1 que exige Cloudinary para URLs autenticadas
    const toSign = `public_id=${publicId}&timestamp=${expiration}${apiSecret}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(toSign);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const signature = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Construir la URL privada temporal con formato 'authenticated'
    const signedUrl = `https://res.cloudinary.com/${cloudName}/image/authenticated/s--${signature.slice(0, 8)}--/t_${expiration}/${publicId}`;

    // Devolvemos la url
    return new Response(JSON.stringify({ signedUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

    // Si se detecta cualquier error
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});