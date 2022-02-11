const BN = require("bn.js");
const axios = require("axios");
const ProtocolDataAddress = "0xFA3bD19110d986c5e5E9DD5F69362d05035D045B";
const ProtocolDataABI = require("../ABIs/ProtocolDataABI.json");
const ProtocolDataContract = new web3.eth.Contract(
  ProtocolDataABI,
  ProtocolDataAddress
);

const PriceOracleAddress = "0xC365C653f7229894F93994CD0b30947Ab69Ff1D5";
const PriceOracleABI = require("../ABIs/PriceOracleABI.json");
const PriceOracleContract = new web3.eth.Contract(
  PriceOracleABI,
  PriceOracleAddress
);

const ETHtoUSDAddress = "0x0715A7794a1dc8e42615F059dD6e406A6594651A";
const ETHtoUSDABI = require("../ABIs/ETHtoUSDABI.json");
const ETHtoUSDContract = new web3.eth.Contract(ETHtoUSDABI, ETHtoUSDAddress);

const userAddress = "0x51571107Cb5c25b3Ef36B714CBAd17F6F900B936";

let AllUserAssetData = [];

async function GetTokenDataForUser() {
  const allTokens = await ProtocolDataContract.methods
    .getAllReservesTokens()
    .call();
  const ETHUSD = await ETHtoUSDContract.methods.latestRoundData().call();
  const ETHtoUSD = new BN(ETHUSD.answer);
  //get deposit data
  let mp = await GetDeposits();

  for (let i = 0; i < allTokens.length; i++) {
    //symbol
    let UserAssetData = {};
    UserAssetData.symbol = allTokens[i].symbol;
    //liquidation threshold and ltv
    const TokenAddress = allTokens[i].tokenAddress.toString();
    const UserDataForToken = await ProtocolDataContract.methods
      .getUserReserveData(TokenAddress, userAddress)
      .call();
    const TokenData = await ProtocolDataContract.methods
      .getReserveConfigurationData(TokenAddress)
      .call();
    UserAssetData.liquidationThreshold = TokenData.liquidationThreshold;
    UserAssetData.ltv = TokenData.ltv;
    //price in ETH
    let assetPriceInETH = await PriceOracleContract.methods
      .getAssetPrice(allTokens[i].tokenAddress)
      .call();
    UserAssetData.priceInETH = assetPriceInETH;
    //borrow rate
    let variableBorrowrate = await ProtocolDataContract.methods
      .getReserveData(TokenAddress)
      .call();
    UserAssetData.borrowRate = variableBorrowrate.variableBorrowRate;
    //price in USD
    let priceINETH = new BN(assetPriceInETH);
    let assetPriceInUSD = priceINETH.mul(ETHtoUSD);
    assetPriceInUSD = assetPriceInUSD.toString();
    let numlen = assetPriceInUSD.length;
    let idx = numlen - 26;
    assetPriceInUSD =
      assetPriceInUSD.substring(0, idx) +
      "." +
      assetPriceInUSD.substring(idx, 6);
    UserAssetData.priceInUSD = assetPriceInUSD;
    //borrows
    UserAssetData.borrow = UserDataForToken.currentVariableDebt;
    //supply
    if (mp.has(UserAssetData.symbol))
      UserAssetData.supply = mp[UserAssetData.symbol];
    else UserAssetData.supply = "0";

    AllUserAssetData.push(UserAssetData);
  }
  const Deposits = await GetDeposits();

  console.log(AllUserAssetData);
}

GetTokenDataForUser();

async function GetDeposits() {
  const result = await axios.post(
    "https://api.thegraph.com/subgraphs/name/aave/aave-v2-polygon-mumbai",
    {
      query: `
            {
                userReserves(where: { user: "0x51571107cb5c25b3ef36b714cbad17f6f900b936"}) {
                    
                    reserve{
                    symbol
                    }
                    depositHistory{
                    amount
                    }
                }  
            }
            `,
    }
  );
  const res = result.data.data.userReserves;
  let mp = new Map();
  for (let i = 0; i < res.length; i++) {
    let symbol = res[i].reserve.symbol;
    let amt = new BN(0);

    const arr = res[i].depositHistory;
    for (let j = 0; j < arr.length; j++) amt.add(arr[j]);
    mp[symbol] = amt.toString();
  }
  return mp;
}
