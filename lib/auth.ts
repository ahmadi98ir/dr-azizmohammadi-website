import crypto from 'crypto';

export async function hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const buf = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, s, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey as Buffer);
    });
  });
  return { hash: buf.toString('hex'), salt: s };
}

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const res = await hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(res.hash, 'hex'));
}

