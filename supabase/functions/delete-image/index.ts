import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // 1. Validar el token de sesión
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No autorizado");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) throw new Error("Sesión inválida");

    // 2. Extraer el publicId
    const { publicId } = await req.json();
    if (!publicId) throw new Error("Falta publicId");

    // 3. Credenciales de Cloudinary
    const cloudName = Deno.env.get("CLOUDINARY_CLOUD_NAME");
    const apiKey = Deno.env.get("CLOUDINARY_API_KEY");
    const apiSecret = Deno.env.get("CLOUDINARY_API_SECRET");

    if (!cloudName || !apiSecret || !apiKey) {
      return new Response(JSON.stringify({ error: "Faltan credenciales en el servidor" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Parámetros exigidos por la Upload API para borrar imágenes privadas
    const timestamp = Math.floor(Date.now() / 1000);
    const type = "authenticated"; // Debe coincidir con cómo se subió

    // 5. Firma criptográfica (Orden alfabético estricto: public_id -> timestamp -> type)
    const toSign = `public_id=${publicId}&timestamp=${timestamp}&type=${type}${apiSecret}`;
    
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-1", encoder.encode(toSign));
    const signature = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0")).join("");

    // 6. Construir el FormData EXACTAMENTE con lo que hemos firmado
    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('timestamp', String(timestamp));
    formData.append('type', type);
    formData.append('api_key', apiKey);
    formData.append('signature', signature);

    // 7. Llamada a la Upload API (Requiere firma, no Basic Auth)
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    // Cloudinary devuelve { result: "ok" } cuando lo borra físicamente
    if (result.result !== "ok") {
      return new Response(JSON.stringify({ success: false, result }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json"},
      });
    }

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});