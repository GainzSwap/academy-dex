import { encryption } from "../constants";
import { createCipheriv, createDecipheriv } from "crypto";

export default class Encryption {
  constructor(
    private readonly key: Buffer,
    private readonly iv: Buffer,
  ) {}

  encryptPlainText(plaintext: string) {
    const cipher = createCipheriv("aes-256-ctr", this.key, this.iv);

    return Buffer.concat([cipher.update(plaintext), cipher.final()]).toString("base64url");
  }

  decryptCipherText(cipherText: string) {
    const decipher = createDecipheriv("aes-256-ctr", this.key, this.iv);

    return Buffer.concat([decipher.update(Buffer.from(cipherText, "base64url")), decipher.final()]).toString("utf-8");
  }

  static new() {
    const { key, iv } = encryption;
    return new Encryption(key, iv);
  }
}
