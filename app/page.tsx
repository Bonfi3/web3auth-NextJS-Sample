// app/page.tsx
"use client";

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const HomePage: React.FC = () => {
  const { userPublicKey, login, logout, signMessage, getBalance } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);

  const handleSignMessage = async () => {
    try {
      const signedMessage = await signMessage("TEST");
      if (signedMessage) {
        console.log("Signed Message:", signedMessage);
        alert("Message signed successfully! Check console for details.");
      }
    } catch (error) {
      console.error("Error signing message:", error);
      alert("Error signing message. Check console for details.");
    }
  };

  const handleCheckBalance = async () => {
    try {
      const currentBalance = await getBalance();
      setBalance(currentBalance);
      console.log("Balance:", currentBalance);
    } catch (error) {
      console.error("Error checking balance:", error);
      alert("Error checking balance. Check console for details.");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      {userPublicKey ? (
        <div className="space-y-4">
          <p className="text-lg">Connected as: {userPublicKey.toBase58()}</p>
          
          {balance !== null && (
            <p className="text-lg">Balance: {balance} SOL</p>
          )}
          
          <div className="space-x-2">
            <button 
              onClick={handleSignMessage}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Sign Message
            </button>
            
            <button 
              onClick={handleCheckBalance}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Check Balance
            </button>
            
            <button 
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={login}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Login with Google
        </button>
      )}
    </div>
  );
};

export default HomePage;
