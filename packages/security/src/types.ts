export type UuidVersion = 'v1' | 'v3' | 'v4' | 'v5' | 'v7';

export type CharsetClass = 'lower' | 'upper' | 'digits' | 'symbols';

export interface PasswordOptions {
  length: number;
  lower?: boolean;
  upper?: boolean;
  digits?: boolean;
  symbols?: boolean;
  excludeAmbiguous?: boolean;
  requireEach?: boolean;
  symbolSet?: string;
}

export type HashAlgorithm =
  | 'sha1' | 'sha256' | 'sha384' | 'sha512'
  | 'sha3-256' | 'sha3-512'
  | 'blake2b512' | 'blake2s256'
  | 'bcrypt' | 'scrypt' | 'argon2id';

export type AesMode = 'cbc' | 'ctr' | 'gcm';
export type AesKeySize = 128 | 192 | 256;
export type AesAlgorithm = `aes-${AesKeySize}-${AesMode}`;

export type RsaPadding = 'rsa-oaep' | 'rsa-oaep-sha256' | 'rsa-pkcs1';
export type RsaKeySize = 2048 | 3072 | 4096;

export type EcCurve = 'p256' | 'p384' | 'p521';

export type KeyFormat = 'pem' | 'der' | 'jwk';

export type JwtAlgorithm =
  | 'HS256' | 'HS384' | 'HS512'
  | 'RS256' | 'RS384' | 'RS512'
  | 'PS256' | 'PS384' | 'PS512'
  | 'ES256' | 'ES384' | 'ES512'
  | 'EdDSA';

export type Encoding =
  | 'base64' | 'base64url' | 'base32' | 'base32hex'
  | 'base58' | 'base58check'
  | 'hex' | 'binary' | 'octal' | 'decimal';

export type CrackScenario =
  | 'online-throttled' | 'online-unthrottled'
  | 'offline-slow' | 'offline-fast' | 'offline-gpu';
