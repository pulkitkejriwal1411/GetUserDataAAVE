const { inputToConfig } = require("@ethereum-waffle/compiler");
const { expect } = require("chai");
const { ethers } = require("hardhat");
require("dotenv").config();
const privateKey = process.env.SECRET_KEY;
const LendingPoolAbi = require("../LendingPoolABI.json");
const LendingPoolAddress = "0x9198F13B08E299d85E096929fA9781A1E3d5d827";
const LendingPoolcontract = new web3.eth.Contract(
  LendingPoolAbi,
  LendingPoolAddress
);
const userAddress = "0x51571107Cb5c25b3Ef36B714CBAd17F6F900B936";
const ProtocolDataAddress = "0xFA3bD19110d986c5e5E9DD5F69362d05035D045B";
const ProtocolDataABI = require("../ProtocolDataABI.json");
const ProtocolDataContract = new web3.eth.Contract(
  ProtocolDataABI,
  ProtocolDataAddress
);

describe("Resolver", function () {
  let owner;
  let resolver;
  beforeEach(async () => {
    const Resolver = await ethers.getContractFactory("Resolver");
    resolver = await Resolver.deploy();
    [owner] = await ethers.getSigners();
  });
  it("Should return the user Account data", async function () {
    const UserDataweb3 = await GetUserDetails();
    const UserData = await resolver.getUserData(
      "0x51571107Cb5c25b3Ef36B714CBAd17F6F900B936"
    );
    for (let i = 0; i < 6; i++) {
      expect(UserData[i].toString()).to.equal(UserDataweb3[i]);
    }
  }).timeout(100000);
  it("should return user token data", async function () {
    let arr = [
      "0x341d1f30e77D3FBfbD43D17183E2acb9dF25574E",
      "0x001B3B4d0F3714Ca98ba10F6042DaEbF0B1B7b6F",
      "0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e",
      "0xBD21A10F619BE90d6066c941b04e340841F1F989",
      "0x0d787a4a1548f673ed375445535a6c7A1EE56180",
      "0x0d787a4a1548f673ed375445535a6c7A1EE56180",
      "0x3C68CE8504087f89c640D02d133646d98e64ddd9",
      "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
    ];
    for (let i = 0; i < arr.length; i++) {
      const UserAssetData = await resolver.GetUserAssetData(
        userAddress,
        arr[i]
      );
      const userDataWeb3 = await ProtocolDataContract.methods
        .getUserReserveData(arr[i], userAddress)
        .call();
      for (let j = 0; j < 9; j++) {
        expect(userDataWeb3[j].toString()).to.equal(
          UserAssetData[j].toString()
        );
      }
    }
  }).timeout(300000);
});

async function GetUserDetails() {
  let userData = await LendingPoolcontract.methods
    .getUserAccountData(userAddress)
    .call();
  return userData;
}
