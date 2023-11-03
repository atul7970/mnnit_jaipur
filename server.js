const express = require("express");
const { Web3 } = require("web3");
const app = express();
const port = 3001;
require("dotenv").config();
// Replace with your Alchemy API key
const alchemyApiKey = process.env.API_KEY;
const contractAddress = process.env.ADDRESS; // Replace with your contract's address
const contractAbi = JSON.parse(
  '[{"type":"constructor","payable":false,"inputs":[{"type":"uint256","name":"_duration"},{"type":"uint256","name":"_stake"}]},{"type":"event","anonymous":false,"name":"ConsensusReached","inputs":[]},{"type":"event","anonymous":false,"name":"FundsBurned","inputs":[]},{"type":"event","anonymous":false,"name":"FundsReturned","inputs":[]},{"type":"event","anonymous":false,"name":"TaskCompleted","inputs":[]},{"type":"function","name":"burnFunds","constant":false,"payable":false,"inputs":[],"outputs":[]},{"type":"function","name":"confirmTaskCompleted","constant":false,"payable":false,"inputs":[],"outputs":[]},{"type":"function","name":"confirmations","constant":true,"stateMutability":"view","payable":false,"inputs":[{"type":"address"}],"outputs":[{"type":"bool"}]},{"type":"function","name":"consensusReached","constant":true,"stateMutability":"view","payable":false,"inputs":[],"outputs":[{"type":"bool"}]},{"type":"function","name":"creator","constant":true,"stateMutability":"view","payable":false,"inputs":[],"outputs":[{"type":"address"}]},{"type":"function","name":"deadline","constant":true,"stateMutability":"view","payable":false,"inputs":[],"outputs":[{"type":"uint256"}]},{"type":"function","name":"returnFunds","constant":false,"payable":false,"inputs":[],"outputs":[]},{"type":"function","name":"taskCompleted","constant":true,"stateMutability":"view","payable":false,"inputs":[],"outputs":[{"type":"bool"}]},{"type":"function","name":"taskStake","constant":true,"stateMutability":"view","payable":false,"inputs":[],"outputs":[{"type":"uint256"}]}]'
);

// Initialize a Web3 instance with Alchemy's provider

const web3 = new Web3(
  new Web3.providers.HttpProvider(
    `https://polygon-mumbai.g.alchemy.com/v2/${alchemyApiKey}`
  )
);

// Create a contract instance
const contract = new web3.eth.Contract(contractAbi, contractAddress);

// Define API routes for interacting with the contract
app.get("/checkTaskCompletion/:address", async (req, res) => {
  const userAddress = req.params.address;
  try {
    const taskCompleted = await contract.methods
      .taskCompleted()
      .call({ from: userAddress });
    res.json({ taskCompleted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/confirmTaskCompletion/:address", async (req, res) => {
  const userAddress = req.params.address;
  try {
    // Use your private key for signing transactions
    const privateKey = PRIVATE_KEY; // Replace with your private key

    // Build the transaction data
    const data = contract.methods.confirmTaskCompleted().encodeABI();
    const gasPrice = await web3.eth.getGasPrice();
    const nonce = await web3.eth.getTransactionCount(userAddress, "latest");
    const chainId = await web3.eth.getChainId();

    const tx = {
      to: contractAddress,
      gas: 0.00002, // Adjust the gas limit as needed
      gasPrice,
      data,
      nonce,
      chainId,
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
    const txReceipt = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    );

    res.json({ success: true, receipt: txReceipt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
