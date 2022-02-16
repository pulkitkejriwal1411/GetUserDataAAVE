//const { inputToConfig } = require("@ethereum-waffle/compiler");

const { expect, assert } = require("chai");
const { Address } = require("ethereumjs-util");
const { ethers } = require("hardhat");
const BigNumber = require("bignumber.js");

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
  userData.totalSupply = new BigNumber(ud.totalCollateralUSD.toString());
  userData.totalSupply = userData.totalSupply.div(1e26) + " USD";

  userData.totalBorrows = new BigNumber(ud.totalDebtUSD.toString());
  userData.totalBorrows = userData.totalBorrows.div(1e26) + " USD";

  userData.availableBorrows = new BigNumber(ud.availableBorrowsUSD.toString());
  userData.availableBorrows = userData.availableBorrows.div(1e26) + " USD";

  userData.ltv = Number(ud.ltv) / 100 + " %";

  userData.liquidationThreshold =
    Number(ud.currentLiquidationThreshold) / 100 + " %";

  userData.healthFactor = new BigNumber(ud.healthFactor.toString());
  userData.healthFactor = userData.healthFactor.div(1e18).toString();

  console.log(userData);

  const allTokens = await resolveUserPosition.getAllReservesTokens();

  for (let i = 0; i < allTokens.length; i++) {
    let reserveData = [];
    reserveData.symbol = allTokens[i].symbol;
    const reserveAddress = allTokens[i].tokenAddress;
    const reserveDataNonSpecific =
      await resolveUserPosition.dataSpecificToReserve(reserveAddress);
    const reserveDataSpecific =
      await resolveUserPosition.getTokenDataSpecificToUser(
        reserveAddress,
        userAddress
      );

    reserveData.supplyRate = new BigNumber(
      reserveDataNonSpecific.supplyRate.toString()
    );
    reserveData.supplyRate = reserveData.supplyRate.div(1e27).toString();

    reserveData.borrowRate = new BigNumber(
      reserveDataNonSpecific.borrowRate.toString()
    );
    reserveData.borrowRate = reserveData.borrowRate.div(1e27).toString();

    reserveData.ltv = Number(reserveDataNonSpecific.ltv) / 100 + "%";

    reserveData.liquidationThreshold =
      Number(reserveDataNonSpecific.liquidationThreshold.toString()) / 10000;

    reserveData.priceInETH = new BigNumber(
      reserveDataNonSpecific.priceInETH.toString()
    );
    reserveData.priceInETH = reserveData.priceInETH.div(1e18).toString();

    reserveData.priceInUSD = new BigNumber(
      reserveDataNonSpecific.priceInUSD.toString()
    );
    reserveData.priceInUSD = reserveData.priceInUSD.div(1e26).toString();

    reserveData.supply = new BigNumber(reserveDataSpecific.supply.toString());
    reserveData.supply = reserveData.supply.div(1e18).toString();

    reserveData.borrow = new BigNumber(reserveDataSpecific.borrow.toString());
    reserveData.borrow = reserveData.borrow.div(1e18).toString();

    reserveData.maxBorrowLimit = new BigNumber(
      reserveDataSpecific.maxBorrowLimit.toString()
    );
    reserveData.maxBorrowLimit = reserveData.maxBorrowLimit
      .div(1e10)
      .toString();

    reserveData.maxLiquidationBorrowLimit = new BigNumber(
      reserveDataSpecific.maxLiquidationBorrowLimit.toString()
    );
    reserveData.maxLiquidationBorrowLimit =
      reserveData.maxLiquidationBorrowLimit.div(1e14).toString();

    console.log(reserveData);
  }
}

GetUserPosition();
