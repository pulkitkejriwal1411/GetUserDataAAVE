const BN = require("bn.js");
require("dotenv").config();
const privateKey = process.env.SECRET_KEY;
const LendingPoolAbi = require("../ABIs/LendingPoolABI.json");
const LendingPoolAddress = "0x9198F13B08E299d85E096929fA9781A1E3d5d827";
const LendingPoolcontract = new web3.eth.Contract(
  LendingPoolAbi,
  LendingPoolAddress
);

const ETHtoUSDAddress = "0x0715A7794a1dc8e42615F059dD6e406A6594651A";
const ETHtoUSDABI = require("../ABIs/ETHtoUSDABI.json");
const ETHtoUSDContract = new web3.eth.Contract(ETHtoUSDABI, ETHtoUSDAddress);


const userAddress = "0x51571107Cb5c25b3Ef36B714CBAd17F6F900B936";

let AllUserAssetData = [];


async function GetUserDetails() {
  let userData = await LendingPoolcontract.methods
    .getUserAccountData(userAddress)
    .call(function (err, res) {});
  const ETHUSD = await ETHtoUSDContract.methods.latestRoundData().call();
  const ETHtoUSD = new BN(ETHUSD.answer);
  let totalCollateral = new BN(userData.totalCollateralETH)
  totalCollateral = totalCollateral.mul(ETHtoUSD);
  totalCollateral = totalCollateral.toString();
  totalCollateral = mod1ex(totalCollateral,26);
  AllUserAssetData.totalCollateral = totalCollateral + ' USD';
  let totalBorrows = new BN(userData.totalDebtETH);
  totalBorrows = totalBorrows.mul(ETHtoUSD);
  totalBorrows = totalBorrows.toString();
  totalBorrows = mod1ex(totalBorrows,26);
  AllUserAssetData.totalBorrows = totalBorrows+' USD';
  let availableBorrows = new BN(userData.availableBorrowsETH);
  availableBorrows = availableBorrows.mul(ETHtoUSD);
  availableBorrows = availableBorrows.toString();
  availableBorrows = mod1ex(availableBorrows,26);
  AllUserAssetData.availableBorrows = availableBorrows+ ' USD';
  AllUserAssetData.liquidationThreshold = mod1ex(userData.currentLiquidationThreshold,2)+'%';
  AllUserAssetData.loanToValue = mod1ex(userData.ltv,2)+'%';
  AllUserAssetData.healthFactor = mod1ex(userData.healthFactor,18);




  console.log(AllUserAssetData);
}

GetUserDetails();


function mod1ex(str,x){
  let len = str.length;
  if(len<=x)
  {
    let st0='0.';
    for(let i=0;i<x-len;i++)
    st0 +='0';
    return st0+ str;
  }
  let beforedecimal = str.substring(0,len-x);
  return beforedecimal + '.' + str.substring(len-x); 
}