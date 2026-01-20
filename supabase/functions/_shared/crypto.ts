import { encode as hexEncode, decode as hexDecode } from "https://deno.land/std@0.177.0/encoding/hex.ts";

const ALGORITHM = "AES-GCM";
const IV_LENGTH = 12;

async function getKey(): Promise<CryptoKey> {
  const secret = Deno.env.get("ENCRYPTION_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "default-secret-key-change-me";
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("salt"), // In production, use random salt stored with data
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ALGORITHM, length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encrypt(text: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoder = new TextEncoder();
  
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(text)
  );

  const ivHex = new TextDecoder().decode(hexEncode(iv));
  const encryptedHex = new TextDecoder().decode(hexEncode(new Uint8Array(encrypted)));
  
  return `enc:${ivHex}:${encryptedHex}`;
}

export async function decrypt(text: string): Promise<string> {
  if (!text.startsWith("enc:")) return text;

  const parts = text.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted format");

  const [_, ivHex, encryptedHex] = parts;
  
  const key = await getKey();
  const iv = hexDecode(new TextEncoder().encode(ivHex));
  const encrypted = hexDecode(new TextEncoder().encode(encryptedHex));

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: new Uint8Array(iv) },
    key,
    new Uint8Array(encrypted)
  );

  return new TextDecoder().decode(decrypted);
}
