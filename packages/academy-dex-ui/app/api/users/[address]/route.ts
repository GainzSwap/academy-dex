import { NextRequest, NextResponse } from "next/server";
import { ChainID, getBotLink, getUserForUI } from "../../bot/service";
import { sendSeed as sendFaucetSeed } from "../../faucet/service";
import { errorMsg } from "~~/components/TransactionWaitingIcon/helpers";

export async function GET(req: NextRequest, { params: { address } }: { params: { address: string } }) {
  const searchParams = req.nextUrl.searchParams;

  const chainId: ChainID | null = searchParams.get("chainId") as any;
  const ipAddress = req.ip || req.headers.get("X-Forwarded-For");

  if (!address || !chainId || !ipAddress) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }

  try {
    const user = await getUserForUI(address, chainId);
    const botStart = getBotLink();
    // try to send seed without waiting for response
    sendFaucetSeed({ address, chainId, ipAddress });

    return Response.json({ user, botStart });
  } catch (error: any) {
    return Response.json({ message: errorMsg(error.toString()) }, { status: 500 });
  }
}
