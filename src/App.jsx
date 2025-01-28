import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import abi from './abi.json'

function App() {
  const [balance, setBalance] = useState('0');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  
  const contractAddress = "0x1a7f81f8f23c7a19b08487db1700ed91c1e7f2b0";

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setIsConnected(true);
        setAddress(accounts[0]);
        getBalance();
      }
    } catch (error) {
      toast.error("Error checking wallet connection");
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask!');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAddress(accounts[0]);
      setIsConnected(true);
      toast.success('Wallet connected successfully!');
      getBalance();
    } catch (error) {
      toast.error('Failed to connect wallet');
    }
  };

  async function getBalance() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const currentBalance = await contract.getBalance();
      setBalance(ethers.formatEther(currentBalance));
      toast.success('Balance updated!');
    } catch (error) {
      toast.error('Failed to fetch balance');
    }
  }

  async function handleDeposit() {
    if (!isConnected) {
      toast.warning('Please connect your wallet first');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      
      const amount = ethers.parseEther(depositAmount);
      const tx = await contract.deposit(amount, { value: amount });
      toast.info('Deposit in progress...', { autoClose: false, toastId: 'deposit' });
      
      await tx.wait();
      toast.dismiss('deposit');
      toast.success('Deposit successful!');
      getBalance();
      setDepositAmount('');
    } catch (error) {
      toast.error(error.message || 'Failed to deposit');
    }
  }

  async function handleWithdraw() {
    if (!isConnected) {
      toast.warning('Please connect your wallet first');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      
      const amount = ethers.parseEther(withdrawAmount);
      const tx = await contract.withdraw(amount);
      toast.info('Withdrawal in progress...', { autoClose: false, toastId: 'withdraw' });
      
      await tx.wait();
      toast.dismiss('withdraw');
      toast.success('Withdrawal successful!');
      getBalance();
      setWithdrawAmount('');
    } catch (error) {
      toast.error(error.message || 'Failed to withdraw');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4 md:p-8">
      <div className="max-w-md mx-auto backdrop-blur-lg bg-white/10 rounded-xl shadow-2xl overflow-hidden p-6 border border-white/20">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
            ETH Wallet
          </h1>
          <button
            onClick={connectWallet}
            className={`px-4 py-2 rounded-lg ${
              isConnected 
                ? 'bg-green-500/20 text-green-300 border border-green-500/50' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } transition-all duration-300`}
          >
            {isConnected ? 'Connected' : 'Connect Wallet'}
          </button>
        </div>

        {isConnected && (
          <div className="mb-4 text-sm text-gray-400">
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
        )}
        
        <div className="mb-8 p-4 rounded-lg bg-white/5 border border-white/10">
          <h2 className="text-xl mb-3 text-white">Balance: {balance} ETH</h2>
          <button 
            onClick={getBalance}
            className="w-full md:w-auto bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 hover:shadow-lg"
          >
            Refresh Balance
          </button>
        </div>

        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <h3 className="text-lg mb-3 text-white">Deposit</h3>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Amount in ETH"
              className="w-full bg-white/5 border border-white/20 p-3 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-gray-400"
            />
            <button 
              onClick={handleDeposit}
              disabled={!isConnected}
              className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Deposit
            </button>
          </div>

          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <h3 className="text-lg mb-3 text-white">Withdraw</h3>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Amount in ETH"
              className="w-full bg-white/5 border border-white/20 p-3 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-gray-400"
            />
            <button 
              onClick={handleWithdraw}
              disabled={!isConnected}
              className="w-full bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Withdraw
            </button>
          </div>
        </div>
      </div>
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  )
}

export default App