"use client";

import { useEffect, useState } from "react";
import { RefIdData } from "../utils";
import { useTargetNetwork } from "./scaffold-eth";
import useRawCallsInfo from "./useRawCallsInfo";
import useSWR from "swr";
import { useAccount } from "wagmi";
import axiosProvider from "~~/services/axiosProvider";
import { getItem, setItem } from "~~/storage/session";

export default function useInitGlobalData() {
  const { client, router } = useRawCallsInfo();
  const [tgLinkage, setTgLinkage] = useState<string | null | undefined>();
  const { address } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  // REF ID Stuff ---
  const [refID, setRefID] = useState<string | null | undefined>();
  const { data: refData, error } = useSWR(
    client && router && refID ? { key: "getReferrerData", refID, client, router } : null,
    async ({ refID, client, router }) => {
      const id = RefIdData.getID(refID);
      const address = await client.readContract({
        abi: router.abi,
        address: router.address,
        functionName: "userIdToAddress",
        args: [BigInt(id)],
      });

      return new RefIdData(address, id);
    },
  );

  useEffect(() => {
    const url = window.location.toString().split("?")[1];
    const searchParams = new URLSearchParams(url);

    setRefID(searchParams.get("refID") || getItem("userRefBy"));
    setTgLinkage(searchParams.get("tgLinkage") || getItem("tgLinkage"));
  }, []);
  useEffect(() => {
    if (refData?.refID) {
      typeof refData?.refID !== "undefined" && setItem({ key: "userRefBy", data: refData.refID }, 60 * 60 * 24 * 360);
    }
  }, [refData, error]);

  useEffect(() => {
    if (tgLinkage) {
      setItem({ key: "tgLinkage", data: tgLinkage }, 60 * 60);
    }
  }, [tgLinkage]);

  useEffect(() => {
    if (tgLinkage && address) {
      axiosProvider
        .get(`/users/tgLink?tgLinkage=${tgLinkage}&address=${address}&chainId=${targetNetwork.id}`)
        .then(({ data: referrerID }) => {
          referrerID && typeof referrerID == "string" && setRefID(referrerID);
        })
        .catch((e: any) => {
          console.log(e);
        });
    }
  }, [tgLinkage, address, targetNetwork]);
}
