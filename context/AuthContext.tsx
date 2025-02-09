// context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { web3auth, initializeWeb3Auth } from "../lib/web3auth";
import { SolanaWallet } from "@web3auth/solana-provider";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";

interface AuthContextProps {
  userPublicKey: PublicKey | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  signMessage: (message: string) => Promise<Uint8Array | null>;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  getBalance: () => Promise<number>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userPublicKey, setUserPublicKey] = useState<PublicKey | null>(null);
  const [solanaWallet, setSolanaWallet] = useState<SolanaWallet | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeWeb3Auth();
        if (web3auth.provider) {
          const wallet = new SolanaWallet(web3auth.provider);
          setSolanaWallet(wallet);
          const accounts = await wallet.requestAccounts();
          setUserPublicKey(new PublicKey(accounts[0]));
        }
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };
    init();
  }, []);

  const login = async () => {
    try {
      console.log("Starting login process...");
      console.log("Current connection status:", web3auth.connected);
      if (!web3auth.connected) {
        await initializeWeb3Auth();
        const provider = await web3auth.connect();
        if (provider) {
          const wallet = new SolanaWallet(provider);
          setSolanaWallet(wallet);
          const accounts = await wallet.requestAccounts();
          setUserPublicKey(new PublicKey(accounts[0]));
        }
      }
    } catch (error) {
      console.error("Detailed login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    await web3auth.logout();
    setUserPublicKey(null);
    setSolanaWallet(null);
  };

  const signMessage = async (message: string) => {
    try {
      console.log("Starting sign message process...");
      
      if (!solanaWallet) {
        console.error("No wallet available");
        throw new Error("Wallet not connected. Please connect first.");
      }

      if (!userPublicKey) {
        console.error("No public key available");
        throw new Error("User not authenticated. Please login first.");
      }

      console.log("Encoding message:", message);
      const encodedMessage = new TextEncoder().encode(message);
      
      console.log("Signing message...");
      const signedMessage = await solanaWallet.signMessage(encodedMessage);
      
      return signedMessage;
    } catch (error) {
      console.error("Error signing message:", error);
      throw error;
    }
  };

  // Funzione per firmare una transazione
  const signTransaction = async (transaction: Transaction) => {
    try {
      if (!solanaWallet) {
        throw new Error("Wallet not connected");
      }
      const signedTx = await solanaWallet.signTransaction(transaction);
      console.log("Transaction signed successfully");
      return signedTx;
    } catch (error) {
      console.error("Error signing transaction:", error);
      throw error;
    }
  };

  // Funzione per ottenere il balance
  const getBalance = async () => {
    try {
      if (!solanaWallet || !userPublicKey) {
        throw new Error("Wallet not connected");
      }
      
      const connection = new Connection("https://api.devnet.solana.com");
      const balance = await connection.getBalance(userPublicKey);
      return balance / 1e9; // Converti da lamports a SOL
    } catch (error) {
      console.error("Error getting balance:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      userPublicKey, 
      login, 
      logout, 
      signMessage,
      signTransaction,
      getBalance 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
