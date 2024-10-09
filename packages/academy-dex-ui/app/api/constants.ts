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

export const faucetConfig = {
  active: Boolean(getValue("FAUCET_ACTIVE", process.env.FAUCET_ACTIVE)),
  maxClaim: Number(getValue("FAUCET_MAX_CLAIM", process.env.FAUCET_MAX_CLAIM)),
  minClaim: Number(getValue("FAUCET_MIN_CLAIM", process.env.FAUCET_MIN_CLAIM)),
  increasePerProfile: Number(getValue("FAUCET_INCREASE_PER_PROFILE", process.env.FAUCET_INCREASE_PER_PROFILE)),
  faucetInterval: Number(process.env.FAUCET_INTERVAL || 24 * 60 * 60),
  faucetPrivateKey: String(getValue("FAUCET_PRIV_KEY", process.env.FAUCET_PRIV_KEY)),
};
