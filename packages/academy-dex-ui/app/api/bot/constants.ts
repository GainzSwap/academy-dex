const getValue = (name: string, v: string | undefined) => {
  if (!v) {
    throw new Error(name + " not set");
  }

  return v;
};

export const JOIN_GROUP_CHAT = "Join Academy-DEX Chat ↗️";
export const REFERRALS = "Referrals 👥";

export const adminUserName = getValue("TgAdmin", process.env.ADMIN_TG_USERANME);
export const dappUrl_ = getValue("dappUrl", process.env.DAPP_URL);

export const encryption = {
  key: Buffer.from(getValue("Encryption Key", process.env.ENCRYPTION_KEY), "base64"),
  iv: Buffer.from(getValue("Encryption Initialisation Vector", process.env.ENCRYPTION_IV), "base64"),
};
