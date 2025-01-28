import { useState } from 'react'
import abi from './abi.json'
import { ethers } from 'ethers' 
import './App.css'

function App() {
  const [userInput, setUserInput] = useState('');
  const [retrievedMessage, setRetrievedMessage] = useState('');  // Fixed typo
  const contractAddress = "0x98c32060e92cd2c380a9db3599ecda0246079362dc18b0c872d16a3a95dd7732"
  
  async function requestAccounts() {
    if (typeof window.ethereum === 'undefined') {  // Fixed undefined check
      alert('Please install MetaMask!');
      return false;
    }
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    return true;
  }

  async function setUserMessage() {
    // Move contract initialization outside the if block and store in variable
    if (!await requestAccounts()) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      
      const tx = await contract.setMessage(userInput);  // Fixed: use contract instead of contractAddress
      const receipt = await tx.wait();
      console.log('Transaction successful', receipt);
    } catch (error) {
      console.log("Failed Transaction", error);
    }
  }

  async function getUserMessage() {
    if (!await requestAccounts()) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, abi, provider);
      
      const message = await contract.getMessage();
      console.log('Retrieved message:', message); 
      setRetrievedMessage(message);
    } catch (error) {
      console.log('Failed to get message:', error);
    }
  }

  return (
    <div className='bg-red-500 p-4'>
      <input 
        type="text" 
        placeholder='Set your message' 
        value={userInput} 
        onChange={(e) => setUserInput(e.target.value)}
      />
      <button className='p-1 bg-linear-330' onClick={setUserMessage}>Set Message</button>
      <button onClick={getUserMessage}>Get Message</button>
      <p style={{ color: 'red' }}>
        Retrieved Message: {retrievedMessage} {/* Added display of retrieved message */}
      </p>
    </div>
  )
}

export default App