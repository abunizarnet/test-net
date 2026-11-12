import { QUIZ_QUESTIONS_PER_DAY } from "@/lib/game-config";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export const QUIZ_BANK: QuizQuestion[] = [
  {
    id: "blockchain-def",
    question: "What is a blockchain?",
    options: [
      "A shared ledger of linked, tamper-resistant blocks",
      "A private spreadsheet kept by one bank",
      "A type of crypto wallet app",
      "A mining machine",
    ],
    answerIndex: 0,
    explanation:
      "A blockchain stores records in blocks that are chained together with cryptographic hashes, so changing old data would break every later block.",
  },
  {
    id: "wallet-keys",
    question: "What does your wallet's private key do?",
    options: [
      "It proves you own the coins and signs transactions",
      "It shows your balance to everyone",
      "It mines new coins for you",
      "It sets the price of the coin",
    ],
    answerIndex: 0,
    explanation:
      "The private key signs transactions to prove ownership. Anyone who has it can spend the funds, so it must never be shared.",
  },
  {
    id: "seed-phrase",
    question: "Who should you share your wallet passphrase with?",
    options: ["Support staff", "Nobody", "Friends you trust", "Any exchange"],
    answerIndex: 1,
    explanation:
      "Your passphrase is the master key to your wallet. Real teams never ask for it, and sharing it lets someone take everything.",
  },
  {
    id: "mining-purpose",
    question: "Why does proof-of-work mining exist?",
    options: [
      "To print coins for the miner's profit only",
      "To agree on which transactions are valid without a central authority",
      "To speed up internet connections",
      "To store photos on the chain",
    ],
    answerIndex: 1,
    explanation:
      "Miners spend computing effort to add blocks, which makes rewriting history costly and lets strangers agree on one ledger.",
  },
  {
    id: "block-contents",
    question: "What does a block typically contain?",
    options: [
      "Only the coin's logo",
      "A batch of transactions and the previous block's hash",
      "The owner's home address",
      "A copy of every wallet",
    ],
    answerIndex: 1,
    explanation:
      "Each block holds a list of transactions plus a reference to the previous block's hash, which is what forms the chain.",
  },
  {
    id: "pi-mobile",
    question: "What is Pi Network best known for?",
    options: [
      "Mobile-first coin mining without heavy hardware",
      "Selling graphics cards",
      "Being a stock exchange",
      "A video streaming service",
    ],
    answerIndex: 0,
    explanation:
      "Pi Network is built around letting people take part from a phone, without the power-hungry machines used for traditional mining.",
  },
  {
    id: "pi-kyc",
    question: "In the Pi ecosystem, what is KYC used for?",
    options: [
      "Verifying that a real person is behind an account",
      "Increasing the mining speed",
      "Changing your username colour",
      "Buying pizza",
    ],
    answerIndex: 0,
    explanation:
      "KYC (Know Your Customer) checks a real identity so the network can reduce fake accounts and keep the community authentic.",
  },
  {
    id: "pi-browser",
    question: "Where do Pi apps usually run inside the Pi ecosystem?",
    options: [
      "Inside the Pi Browser",
      "Only on a desktop mining rig",
      "Inside a smart fridge",
      "Only in a bank branch",
    ],
    answerIndex: 0,
    explanation:
      "The Pi Browser lets users open Pi-enabled apps and sign in with their Pi account to use features like payments.",
  },
  {
    id: "supply-cap",
    question: "Why do many cryptocurrencies have a limited supply?",
    options: [
      "To create scarcity that can support value",
      "Because computers cannot count higher",
      "To make wallets smaller",
      "Because governments require it",
    ],
    answerIndex: 0,
    explanation:
      "A fixed or capped supply creates scarcity. If demand grows while supply stays limited, value can be supported.",
  },
  {
    id: "hash",
    question: "What does a hash function do to data?",
    options: [
      "Turns it into a fixed-size fingerprint",
      "Encrypts it so it can be read back later",
      "Deletes it permanently",
      "Compresses it to half its size",
    ],
    answerIndex: 0,
    explanation:
      "A hash produces a fixed-length fingerprint of any input. Even a tiny change gives a completely different result.",
  },
  {
    id: "decentralized",
    question: "What does decentralized mean?",
    options: [
      "Control is spread across many participants",
      "One company owns everything",
      "The network is offline",
      "Only miners can read data",
    ],
    answerIndex: 0,
    explanation:
      "In a decentralized network no single party is in charge. Many participants share the work of validating and storing data.",
  },
  {
    id: "transaction-fee",
    question: "Why are transaction fees paid on many blockchains?",
    options: [
      "To reward validators and discourage spam",
      "To pay the wallet app designer",
      "To unlock a private key",
      "To reset the blockchain",
    ],
    answerIndex: 0,
    explanation:
      "Fees compensate the people securing the network and make flooding it with junk transactions expensive.",
  },
  {
    id: "smart-contract",
    question: "What is a smart contract?",
    options: [
      "Code on a blockchain that runs automatically when conditions are met",
      "A legal paper signed at a bank",
      "A phone plan for miners",
      "A type of coin",
    ],
    answerIndex: 0,
    explanation:
      "A smart contract is a program stored on a blockchain. It executes by itself when its conditions are satisfied, with no middleman.",
  },
  {
    id: "public-address",
    question: "Is it safe to share your public wallet address?",
    options: [
      "Yes, it is how others send you funds",
      "No, it reveals your private key",
      "Only on weekends",
      "Only with exchanges",
    ],
    answerIndex: 0,
    explanation:
      "A public address is like an account number for receiving funds. It cannot be used to spend your coins or to derive your private key.",
  },
  {
    id: "phishing",
    question: "A message says 'Verify your wallet now or lose your coins'. What is it most likely?",
    options: ["A phishing scam", "An official network update", "A mining bonus", "A tax receipt"],
    answerIndex: 0,
    explanation:
      "Urgent threats and links asking for wallet details are classic phishing. Always go to the official app yourself instead.",
  },
  {
    id: "node",
    question: "What is a node in a blockchain network?",
    options: [
      "A computer that keeps and checks a copy of the ledger",
      "A single coin",
      "A kind of wallet colour",
      "A website banner",
    ],
    answerIndex: 0,
    explanation:
      "Nodes store the ledger and check new blocks against the rules, which keeps the whole network honest.",
  },
  {
    id: "consensus",
    question: "What is consensus in a blockchain?",
    options: [
      "The way participants agree on the current state of the ledger",
      "A secret chat between miners",
      "A coin price vote on social media",
      "A password rule",
    ],
    answerIndex: 0,
    explanation:
      "Consensus mechanisms such as proof-of-work or proof-of-stake let independent nodes agree on one version of the truth.",
  },
  {
    id: "volatility",
    question: "What does volatility mean for a crypto asset?",
    options: [
      "Its price can change quickly and by a lot",
      "It never changes price",
      "It can only go up",
      "It is stored offline",
    ],
    answerIndex: 0,
    explanation:
      "Volatile assets can swing sharply in price, so only put in what you can afford to see move.",
  },
  {
    id: "dapp",
    question: "What is a dApp?",
    options: [
      "An application that runs on a decentralized network",
      "A desktop calculator",
      "A discount app",
      "A mining chip",
    ],
    answerIndex: 0,
    explanation:
      "A decentralized app uses a blockchain for its back end, so its data and logic are not controlled by one server owner.",
  },
  {
    id: "cold-wallet",
    question: "What is a cold wallet?",
    options: [
      "A wallet kept offline, away from the internet",
      "A wallet that only holds old coins",
      "A wallet used in winter",
      "A wallet with no address",
    ],
    answerIndex: 0,
    explanation:
      "Cold wallets keep keys offline, which protects them from online attackers and malware.",
  },
];

export function utcDayKey(now: number): string {
  return new Date(now).toISOString().slice(0, 10);
}

function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function questionsForDay(dayKey: string): QuizQuestion[] {
  const start = hashString(dayKey) % QUIZ_BANK.length;
  const step = 7;
  const picked: QuizQuestion[] = [];
  for (let i = 0; i < QUIZ_QUESTIONS_PER_DAY; i++) {
    picked.push(QUIZ_BANK[(start + i * step) % QUIZ_BANK.length]);
  }
  return picked;
}

export function findQuestion(id: string): QuizQuestion | undefined {
  return QUIZ_BANK.find((q) => q.id === id);
}

export function msUntilNextDay(now: number): number {
  const next = new Date(now);
  next.setUTCHours(24, 0, 0, 0);
  return next.getTime() - now;
}
