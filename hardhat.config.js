require("@nomiclabs/hardhat-waffle");


const fs = require("fs")
const privateKey = fs.readFileSync(".secret").toString()

module.exports = {
  networks: {
    hardhat:{
      forking:{
        url: 'https://polygon-mumbai.g.alchemy.com/v2/'+privateKey
      }
    }  
  },
  solidity: "0.8.4",
};
