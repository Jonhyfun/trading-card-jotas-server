import crypto from 'crypto';


export function Encrypt(text: string): string {
  const key = Buffer.from(process.env.KEY!, 'hex');
  const iv = Buffer.from(process.env.IV!, 'hex');
  
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function Decrypt(encrypted: string): string {
  const key = Buffer.from(process.env.KEY!, 'hex');
  const iv = Buffer.from(process.env.IV!, 'hex');
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}