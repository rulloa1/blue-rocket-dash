import { supabase } from "@/integrations/supabase/client";

export async function encryptSmtpPassword(password: string): Promise<string> {
  if (!password) return "";
  
  // Don't re-encrypt already encrypted passwords
  if (password.startsWith("enc:")) {
    return password;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Not authenticated");
    }

    const response = await supabase.functions.invoke("encrypt-smtp-password", {
      body: { action: "encrypt", password },
    });

    if (response.error) {
      console.error("Encryption error:", response.error);
      throw new Error(response.error.message);
    }

    return response.data.encrypted;
  } catch (error) {
    console.error("Failed to encrypt password:", error);
    throw error;
  }
}

export async function decryptSmtpPassword(encryptedPassword: string): Promise<string> {
  if (!encryptedPassword) return "";
  
  // If not encrypted, return as-is (for backward compatibility)
  if (!encryptedPassword.startsWith("enc:")) {
    return encryptedPassword;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Not authenticated");
    }

    const response = await supabase.functions.invoke("encrypt-smtp-password", {
      body: { action: "decrypt", password: encryptedPassword },
    });

    if (response.error) {
      console.error("Decryption error:", response.error);
      throw new Error(response.error.message);
    }

    return response.data.decrypted;
  } catch (error) {
    console.error("Failed to decrypt password:", error);
    // Return empty string on failure to prevent showing encrypted value
    return "";
  }
}

export function isPasswordEncrypted(password: string | null): boolean {
  return password?.startsWith("enc:") ?? false;
}
