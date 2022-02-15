//const { inputToConfig } = require("@ethereum-waffle/compiler");
const { BN } = require("bn.js");
const { expect, assert } = require("chai");
const { Address } = require("ethereumjs-util");
const { ethers } = require("hardhat");

const userAddress = "0x51571107Cb5c25b3Ef36B714CBAd17F6F900B936";

async function GetUserPosition() {
  let owner;
  [owner] = await ethers.getSigners();

  // creating contract objects
  const ResolveLendingPool = await ethers.getContractFactory(
    "ResolveLendingPool"
  );
  let resolveLendingPool = await ResolveLendingPool.deploy();
  const ResolveAggregatorProxy = await ethers.getContractFactory(
    "ResolveAggregatorProxy"
  );
  let resolveAggregatorProxy = await ResolveAggregatorProxy.deploy();
  const ResolvePriceOracle = await ethers.getContractFactory(
    "ResolvePriceOracle"
  );
  let resolvePriceOracle = await ResolvePriceOracle.deploy();
  const ResolverProtocolDataProvider = await ethers.getContractFactory(
    "ResolverProtocolDataProvider"
  );
  let resolveProtocolDataProvider = await ResolverProtocolDataProvider.deploy();

  //object to store the position of the user
  let UserPosition = [];

  //accessing all tokens
  const allTokens = await resolveProtocolDataProvider.getAllReservesTokens();

  //ether value in USD
  let ETHtoUSD = await resolveAggregatorProxy.EthToUSD();
  ETHtoUSD = ETHtoUSD.toString();
  ETHtoUSD = new BN(ETHtoUSD);

  //getting user data
  let userData = await resolveLendingPool.getUserData(userAddress);
  let AaveUser = [];

  //total collateral usd
  let totalCollateral = userData.totalCollateralETH;
  totalCollateral = totalCollateral.toString();
  totalCollateral = new BN(totalCollateral);
  totalCollateral = totalCollateral.mul(ETHtoUSD);
  totalCollateral = totalCollateral.toString();
  AaveUser.totalCollateral = mod1ex(totalCollateral, 26) + " USD";

  //total borrows
  let totalBorrows = userData.totalDebtETH;
  totalBorrows = totalBorrows.toString();
  totalBorrows = new BN(totalBorrows);
  totalBorrows = totalBorrows.mul(ETHtoUSD);
  totalBorrows = totalBorrows.toString();
  AaveUser.totalBorrows = mod1ex(totalBorrows, 26) + " USD";

  //available borrows
  let availableBorrows = userData.availableBorrowsETH;
  availableBorrows = availableBorrows.toString();
  let availableBorrowsBN = new BN(availableBorrows);
  availableBorrows = availableBorrowsBN.mul(ETHtoUSD);
  availableBorrows = availableBorrows.toString();
  AaveUser.availableBorrows = mod1ex(availableBorrows, 26);

  //liquidation threshold
  let liquidationThreshold = userData.currentLiquidationThreshold;
  liquidationThreshold = liquidationThreshold.toString();
  AaveUser.liquidationThreshold = mod1ex(liquidationThreshold, 2) + " %";

  //ltv
  let ltv = userData.ltv;
  ltv = ltv.toString();
  AaveUser.loanToValue = mod1ex(ltv, 2) + " %";

  //health factor
  AaveUser.healthFactor = mod1ex(userData.healthFactor.toString(), 18);

  UserPosition.push(AaveUser);

  for (let i = 0; i < 7; i++) {
    let ReserveData = {};
    //symbol
    ReserveData.symbol = allTokens[i].symbol;

    const TokenAddress = allTokens[i].tokenAddress.toString();
    //supply rate
    let currentLiquididityRate =
      await resolveLendingPool.getCurrentLiquidityRate(TokenAddress);
    currentLiquididityRate = currentLiquididityRate.toString();
    currentLiquididityRate = mod1ex(currentLiquididityRate, 27);
    ReserveData.supplyRate = currentLiquididityRate;

    //bororw rate
    let borrowRate = await resolveProtocolDataProvider.getReserveData(
      TokenAddress
    );
    borrowRate = borrowRate.toString();
    borrowRate = mod1ex(borrowRate, 27);
    ReserveData.borrowRate = borrowRate;

    //ltv
    let reserveConfig =
      await resolveProtocolDataProvider.getReserveConfigurationData(
        TokenAddress
      );
    ReserveData.ltv = mod1ex(reserveConfig.ltv.toString(), 2);

    //liquidation Threshold
    ReserveData.liquidationThreshold = mod1ex(
      reserveConfig.liquidationThreshold.toString(),
      4
    );

    //price in ETH
    let priceInETH = await resolvePriceOracle.getAssetPrice(TokenAddress);
    priceInETH = priceInETH.toString();
    ReserveData.priceInETH = mod1ex(priceInETH, 18);

    //price in USD
    priceInETH = new BN(priceInETH);
    let priceInUSD = ETHtoUSD.mul(priceInETH);
    priceInUSD = priceInUSD.toString();
    ReserveData.priceInUSD = mod1ex(priceInUSD, 26);

    //supply
    let supplyborrow = await resolveProtocolDataProvider.getUserReserveData(
      TokenAddress,
      userAddress
    );
    let supply = supplyborrow.currentATokenBalance;
    ReserveData.supply = mod1ex(supply.toString(), 18);

    //borrow
    let borrow = supplyborrow.currentVariableDebt;
    ReserveData.borrrow = mod1ex(borrow.toString(), 18);

    //max borrow limit
    let ie6 = new BN("100000000000");
    ReserveData.maxBorrowLimit = availableBorrowsBN
      .div(priceInETH.div(ie6))
      .toString();
    ReserveData.maxBorrowLimit = mod1ex(ReserveData.maxBorrowLimit, 11);

    //max liquidation borrow limit
    let maxLiquidationBorrowLimit =
      Number(ReserveData.supply) * Number(ReserveData.liquidationThreshold);
    ReserveData.maxLiquidationBorrowLimit = maxLiquidationBorrowLimit;

    UserPosition.push(ReserveData);
  }
  console.log(UserPosition);
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
