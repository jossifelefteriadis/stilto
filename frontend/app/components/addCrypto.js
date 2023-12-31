"use client";
import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ethers } from "ethers";
import { peanut } from "@squirrel-labs/peanut-sdk";
import axios from "axios";
import { useAccount, useNetwork } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@nextui-org/react";

import Context from "../utils/context";
import ConnectWallet from "./connectWallet";
// import createGift from "../createGift";

export default function AddCryptoComp() {
  const { chosenGif, chosenCard, title, message } = useContext(Context);
  const { open } = useWeb3Modal();
  const { isConnected } = useAccount();
  const { chain } = useNetwork();

  const [currentAccount, setCurrentAccount] = useState("");
  const [signer, setSigner] = useState(null);
  const [amount, setAmount] = useState("");
  const [chosenChain, setChosenChain] = useState({
    id: 11155111,
    chain: "Sepolia",
  });
  const [giftId, setGiftId] = useState("");
  const [giftLinkReady, setGiftLinkReady] = useState(false);
  const [loadingLink, setLoadingLink] = useState(false);

  const items = [
    { key: 42161, label: "Arbitrum" },
    { key: 43114, label: "Avalanche" },
    { key: 8453, label: "Base" },
    { key: 56, label: "BNB Smart Chain" },
    { key: 1, label: "Ethereum" },
    // { key: 59144, label: "Linea" },
    // { key: 5000, label: "Mantle" },
    { key: 10, label: "OP Mainnet" },
    { key: 137, label: "Polygon" },
    // { key: 80001, label: "Polygon Mumbai" },
    // { key: 1101, label: "Polygon zkEVM" },
    { key: 11155111, label: "Sepolia" },
  ];

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [isConnected]);

  const checkIfWalletIsConnected = async () => {
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (accounts.length !== 0) {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
      const signer = await provider.getSigner();
      const account = accounts[0];
      setCurrentAccount(account);
      setSigner(signer);
      //   setIsConnected(true);
      //   setChainId((await provider.getNetwork()).chainId);
    } else {
      console.log("No authorized account found");
    }
  };

  const createLink = async () => {
    setLoadingLink(true);
    if (!signer) throw new Error("Connect wallet first");
    const network = await signer.provider.getNetwork();
    const chainId = network.chainId;

    window.signer = signer;
    const createLinkResponse = await peanut.createLink({
      structSigner: { signer },
      linkDetails: {
        chainId: chainId,
        tokenAmount: amount,
        tokenType: 0,
      },
    });
    createClaimUrl(createLinkResponse.link[0], network.name);
  };

  const createClaimUrl = async (link, chain) => {
    await axios
      .post("https://api.stilto.io/createclaimurl", {
        sender: currentAccount,
        gif: chosenGif,
        card: chosenCard,
        title,
        message,
        amount,
        chain,
        chainId: chosenChain.id.toString(),
        claimLink: link,
      })
      .then((response) => {
        setGiftId(response.data);
        setGiftLinkReady(true);
        setLoadingLink(false);
      });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://stilto.io/card/claim?id=${giftId}`);
  };

  return (
    <section className="min-h-screen flex flex-col items-center bg-[#e0f7fa] text-[#004d40]">
      <section className="w-full h-20 lg:h-12 flex justify-center mt-2">
        <section className="w-full lg:w-1/2 h-20 lg:h-12 flex justify-evenly items-center text-xl text-center">
          <Link href="/add-card">
            <span className="font-semibold">1.</span> Choose gift type
          </Link>
          <Link href="/add-message">
            <span className="font-semibold">2.</span> Add your message
          </Link>
          <Link href="/add-crypto" className="text-[#1de9b6]">
            <span className="font-semibold">3.</span> Add crypto amount
          </Link>
        </section>
      </section>
      {!currentAccount && (
        <button
          onClick={() => open({ view: "Networks" })}
          className="w-60 h-14 bg-[#1de9b6] hover:bg-[#00bfa5] text-white text-lg mt-6 rounded-xl uppercase"
        >
          Connect Wallet
        </button>
      )}
      {currentAccount && (
        <section className="w-full h-screen flex flex-col lg:flex-row lg:justify-evenly items-center lg:items-start bg-[#e0f7fa] text-[#004d40] mt-6">
          <section className="w-full lg:w-2/5 h-96 lg:h-3/4 flex flex-col p-2 rounded-lg shadow-lg bg-white">
            <section className="text-center text-lg mt-6">
              Add amount and click &apos;Create link&apos; to get your claimable
              link.
            </section>
            <section className="flex justify-between md:justify-between items-center mt-8 mb-4 md:px-10">
              <span className="text-lg">Choose Network:</span>
              <section className="flex items-center">
                <Dropdown>
                  <DropdownTrigger>
                    <button className="w-56 h-10 flex justify-center items-center bg-[#1de9b6] hover:bg-[#00bfa5] text-lg text-[#004d40] rounded-lg outline-none">
                      {chosenChain.chain}
                      <svg
                        className="h-6 w-6 text-[#004d40] cursor-pointer"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {" "}
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    {/* <Button variant="bordered">Open Menu</Button> */}
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Static Actions"
                    className="h-80 bg-[#1de9b6] text-[#004d40] rounded-lg overflow-scroll"
                    items={items}
                  >
                    {(item) => (
                      <DropdownItem
                        key={item.key}
                        onClick={() =>
                          setChosenChain({ id: item.key, chain: item.label })
                        }
                        className="hover:bg-[#00bfa5]"
                      >
                        {item.label}
                      </DropdownItem>
                    )}
                  </DropdownMenu>
                </Dropdown>
              </section>
            </section>
            {chain && chain.id && chosenChain.id !== chain.id && (
              <section className="flex justify-center items-center mt-4 md:px-10">
                <Button
                  className=" bg-red-500 py-4 px-8 text-[#e0f7fa] font-semibold rounded-full"
                  onClick={() => open({ view: "Networks" })}
                >
                  Wrong network. Change to: {chosenChain.chain}
                </Button>
              </section>
            )}
            <section className="flex justify-between md:justify-between items-center mt-8 mb-4 md:px-10">
              <label htmlFor="amount" className="text-lg">
                ETH amount to gift:
              </label>
              <section className="flex items-center">
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="amount"
                  className="w-24 h-10 bg-white text-[#004d40] text-right placeholder:text-[#004d40] placeholder:text-sm placeholder:text-left placeholder:pl-2 outline-none border-2 border-[#004d40] rounded-l-lg"
                />
                <button
                  onClick={createLink}
                  className="w-36 h-10 bg-[#1de9b6] hover:bg-[#00bfa5] text-lg text-[#004d40] ml-4 rounded-r-lg"
                >
                  Create link
                </button>
              </section>
            </section>
            {!giftLinkReady ? (
              loadingLink && (
                <section className="text-center mt-4">
                  <svg
                    aria-hidden="true"
                    className="inline w-8 h-8 text-gray-300 animate-spin dark:fill-[#00bfa5]"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                </section>
              )
            ) : (
              <section className="text-center break-all mt-4 mx-4">
                <p className="flex flex-row justify-center">
                  Share this claimable link:{" "}
                  <Popover
                    placement="right"
                    className="bg-[#1de9b6] rounded-lg"
                  >
                    <PopoverTrigger>
                      <Button>
                        <svg
                          className="h-6 w-6 text-[#004d40] cursor-pointer"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          onClick={copyLink}
                        >
                          {" "}
                          <path stroke="none" d="M0 0h24v24H0z" />{" "}
                          <rect x="8" y="8" width="12" height="12" rx="2" />{" "}
                          <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" />
                        </svg>{" "}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <section className="px-1 py-2">
                        <section className="text-[#004d40] text-small font-bold">
                          Copied!
                        </section>
                      </section>
                    </PopoverContent>
                  </Popover>
                </p>
                {`https://stilto.io/card/claim?id=${giftId}`}
              </section>
            )}
          </section>
          <section className="w-full lg:w-2/5 h-3/4 flex flex-col justify-center items-center mt-10 lg:mt-0 p-2 rounded-lg shadow-lg bg-white">
            {chosenGif !== "" ? (
              <video autoPlay muted loop className="w-96 h-96 rounded-lg">
                <source src={chosenGif} type="video/mp4" />
              </video>
            ) : (
              chosenCard && (
                <section className="flex flex-col items-center border-2 rounded-lg">
                  <Image
                    src={chosenCard}
                    alt="card"
                    width={300}
                    height={300}
                    className="rounded-md"
                  />
                </section>
              )
            )}
            {title && (
              <h1 className="text-xl text-center font-semibold mt-4">
                {title}
              </h1>
            )}
            {message && <p className="w-full text-center mt-2">{message}</p>}
            <p className="w-full text-center mt-2">Gift amount: {amount} ETH</p>
          </section>
        </section>
      )}
    </section>
  );
}
