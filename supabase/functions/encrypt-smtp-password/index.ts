import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple XOR-based encryption with a server-side key
// In production, consider using Supabase Vault or a proper encryption library
const ENCRYPTION_KEY = Deno.env.get("SMTP_ENCRYPTION_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.slice(0, 32) || "";

function encrypt(text: string): string {
  if (!text || !ENCRYPTION_KEY) return text;
  
  const textBytes = new TextEncoder().encode(text);
  const keyBytes = new TextEncoder().encode(ENCRYPTION_KEY);
  const encrypted = new Uint8Array(textBytes.length);
  
  for (let i = 0; i < textBytes.length; i++) {
    encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  
  // Prefix with 'enc:' to identify encrypted values
  return "enc:" + btoa(String.fromCharCode(...encrypted));
}

function decrypt(encryptedText: string): string {
  if (!encryptedText || !ENCRYPTION_KEY) return encryptedText;
  
  // Check if the value is encrypted (has 'enc:' prefix)
  if (!encryptedText.startsWith("enc:")) {
    return encryptedText; // Return as-is if not encrypted
  }
  
  try {
    const base64Data = encryptedText.slice(4); // Remove 'enc:' prefix
    const encryptedBytes = new Uint8Array(
      atob(base64Data).split('').map(c => c.charCodeAt(0))
    );
    const keyBytes = new TextEncoder().encode(ENCRYPTION_KEY);
    const decrypted = new Uint8Array(encryptedBytes.length);
    
    for (let i = 0; i < encryptedBytes.length; i++) {
      decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error("Decryption error:", error);
    return ""; // Return empty string on decryption failure
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header is required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, password } = await req.json();

    if (action === "encrypt") {
      if (!password) {
        return new Response(
          JSON.stringify({ error: "Password is required for encryption" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const encrypted = encrypt(password);
      return new Response(
        JSON.stringify({ encrypted }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } 
    
    if (action === "decrypt") {
      if (!password) {
        return new Response(
          JSON.stringify({ error: "Encrypted password is required for decryption" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const decrypted = decrypt(password);
      return new Response(
        JSON.stringify({ decrypted }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'encrypt' or 'decrypt'" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
