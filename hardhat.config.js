require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");

require('dotenv').config()
const privateKey = process.env.SECRET_KEY

module.exports = {
  networks: {
    hardhat:{
      forking:{
        url: 'https://polygon-mumbai.g.alchemy.com/v2/'+privateKey,
        block: 24692700

      }
    }  
  },
  solidity: "0.8.4",
};
