const BN = require("bn.js");

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

async function GetReserveConfigurationDataProtocolDataForUser() {
  const allTokens = await ProtocolDataContract.methods
    .getAllReservesTokens()
    .call();
  const ETHUSD = await ETHtoUSDContract.methods.latestRoundData().call();
  const ETHtoUSD = new BN(ETHUSD.answer);
  //getting user data
  let userData = await LendingPoolcontract.methods
    .getUserAccountData(userAddress)
    .call(function (err, res) {});

  let totalCollateral = new BN(userData.totalCollateralETH);
  totalCollateral = totalCollateral.mul(ETHtoUSD);
  totalCollateral = totalCollateral.toString();
  totalCollateral = mod1ex(totalCollateral, 26);
  AllUserAssetData.totalCollateral = totalCollateral + " USD";
  let totalBorrows = new BN(userData.totalDebtETH);
  totalBorrows = totalBorrows.mul(ETHtoUSD);
  totalBorrows = totalBorrows.toString();
  totalBorrows = mod1ex(totalBorrows, 26);
  AllUserAssetData.totalBorrows = totalBorrows + " USD";
  let availableBorrows = new BN(userData.availableBorrowsETH);
  availableBorrows = availableBorrows.mul(ETHtoUSD);
  availableBorrows = availableBorrows.toString();
  availableBorrows = mod1ex(availableBorrows, 26);
  AllUserAssetData.availableBorrows = availableBorrows + " USD";
  AllUserAssetData.liquidationThreshold =
    mod1ex(userData.currentLiquidationThreshold, 2) + "%";
  AllUserAssetData.loanToValue = mod1ex(userData.ltv, 2) + "%";
  AllUserAssetData.healthFactor = mod1ex(userData.healthFactor, 18);

  for (let i = 0; i < allTokens.length; i++) {
    const TokenAddress = allTokens[i].tokenAddress.toString();

    const UserReserveDataProtocolData = await ProtocolDataContract.methods
      .getUserReserveData(TokenAddress, userAddress)
      .call();

    const ReserveConfigurationDataProtocolData =
      await ProtocolDataContract.methods
        .getReserveConfigurationData(TokenAddress)
        .call();

    let assetPriceInETH = await PriceOracleContract.methods
      .getAssetPrice(allTokens[i].tokenAddress)
      .call();

    let GetReserveDataProtocolData = await ProtocolDataContract.methods
      .getReserveData(TokenAddress)
      .call();

    let lendingPoolReserveData = await LendingPoolcontract.methods
      .getReserveData(TokenAddress)
      .call();

    //available borrows
    let availabeborrows = new BN(userData.availableBorrowsETH);
    //symbol
    let UserAssetData = {};
    UserAssetData.symbol = allTokens[i].symbol;
    //supply rate
    UserAssetData.supplyRate = mod1ex(
      lendingPoolReserveData.currentLiquidityRate,
      27
    );
    //borrow rate
    UserAssetData.borrowRate = mod1ex(
      GetReserveDataProtocolData.variableBorrowRate,
      27
    );
    //liquidation threshold and ltv
    UserAssetData.ltv = mod1ex(ReserveConfigurationDataProtocolData.ltv, 2);
    UserAssetData.liquidationThreshold = mod1ex(
      ReserveConfigurationDataProtocolData.liquidationThreshold,
      4
    );

    //price in USD
    let priceINETH = new BN(assetPriceInETH);
    let assetPriceInUSDBN = priceINETH.mul(ETHtoUSD);
    let assetPriceInUSD = assetPriceInUSDBN.toString();
    assetPriceInUSD = mod1ex(assetPriceInUSD, 26);
    UserAssetData.priceInUSD = assetPriceInUSD;

    //price in ETH
    UserAssetData.priceInETH = mod1ex(assetPriceInETH, 18);

    //supply
    UserAssetData.supply = mod1ex(
      UserReserveDataProtocolData.currentATokenBalance,
      18
    );

    //borrows
    UserAssetData.borrow = mod1ex(
      UserReserveDataProtocolData.currentVariableDebt,
      18
    );

    //max borrow limit
    let ie6 = new BN("100000000000");
    UserAssetData.maxBorrowLimit = availabeborrows
      .div(priceINETH.div(ie6))
      .toString();
    UserAssetData.maxBorrowLimit = mod1ex(UserAssetData.maxBorrowLimit, 11);

    AllUserAssetData.push(UserAssetData);
  }

  console.log(AllUserAssetData);
}

GetReserveConfigurationDataProtocolDataForUser();

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
