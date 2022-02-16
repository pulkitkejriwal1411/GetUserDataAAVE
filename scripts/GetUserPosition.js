//const { inputToConfig } = require("@ethereum-waffle/compiler");
const { BN } = require("bn.js");
const { expect, assert } = require("chai");
const { Address } = require("ethereumjs-util");
const { ethers } = require("hardhat");

const userAddress = "0x51571107Cb5c25b3Ef36B714CBAd17F6F900B936";

async function GetUserPosition() {
  let owner;
  [owner] = await ethers.getSigners();

  const ResolveUserPosition = await ethers.getContractFactory(
    "ResolveUserPosition"
  );
  let resolveUserPosition = await ResolveUserPosition.deploy();

  let userData = [];
  const ud = await resolveUserPosition.getUserData(userAddress);
  userData.totalSupply = mod1ex(ud.totalCollateralUSD.toString(),26)+' USD';
  userData.totalBorrows = mod1ex(ud.totalDebtUSD.toString(),26)+' USD';
  userData.availableBorrows = mod1ex(ud.availableBorrowsUSD.toString(),26)+' USD';
  userData.ltv = mod1ex(ud.ltv.toString(),2)+' %';
  userData.liquidationThreshold = mod1ex(ud.currentLiquidationThreshold.toString(),2)+' %';
  userData.healthFactor = mod1ex(ud.healthFactor.toString(),18);
  console.log(userData);
  const allTokens = await resolveUserPosition.getAllReservesTokens();
  for(let i=0;i<allTokens.length;i++)
  {
    let reserveData = [];
    reserveData.symbol = allTokens[i].symbol;
    const reserveAddress = allTokens[i].tokenAddress;
    const reserveDataNonSpecific = await resolveUserPosition.dataSpecificToReserve(reserveAddress);
    const reserveDataSpecific = await resolveUserPosition.getTokenDataSpecificToUser(reserveAddress,userAddress);
    reserveData.supplyRate = mod1ex(reserveDataNonSpecific.supplyRate.toString(),27);
    reserveData.borrowRate = mod1ex(reserveDataNonSpecific.borrowRate.toString(),27);
    reserveData.ltv = mod1ex(reserveDataNonSpecific.ltv.toString(),2)+"%";
    reserveData.liquidationThreshold = mod1ex(reserveDataNonSpecific.liquidationThreshold.toString(),4);
    reserveData.priceInETH = mod1ex(reserveDataNonSpecific.priceInETH.toString(),18);
    reserveData.priceInUSD = mod1ex(reserveDataNonSpecific.priceInUSD.toString(),26);
    reserveData.supply = mod1ex(reserveDataSpecific.supply.toString(),18);
    reserveData.borrow = mod1ex(reserveDataSpecific.borrow.toString(),18);
    reserveData.maxBorrowLimit = mod1ex(reserveDataSpecific.maxBorrowLimit.toString(),10);
    reserveData.maxLiquidationBorrowLimit = mod1ex(reserveDataSpecific.maxLiquidationBorrowLimit.toString(),14);
    console.log(reserveData);
  }
  


}

GetUserPosition();

function mod1ex(str, x) {
  let len = str.length;
  if (len <= x) {
    let st0 = "0.";
    for (let i = 0; i < x - len; i++) st0 += "0";
    return st0 + str;
  }
  let beforedecimal = str.substring(0, len - x);
  return beforedecimal + "." + str.substring(len - x);
}
