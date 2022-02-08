const { expect } = require("chai");
const { ethers } = require("hardhat");
require('dotenv').config()
const privateKey = process.env.SECRET_KEY
const LendingPoolAbi = require('../LendingPoolABI.json');
const LendingPoolAddress = '0x9198F13B08E299d85E096929fA9781A1E3d5d827';
const LendingPoolcontract = new web3.eth.Contract(LendingPoolAbi, LendingPoolAddress);
const userAddress = '0x51571107Cb5c25b3Ef36B714CBAd17F6F900B936';


describe("Resolver", function () {
    
let owner;
  it("Should return the user Account data", async function () {
    const Resolver = await ethers.getContractFactory("Resolver");
    const resolver = await Resolver.deploy();

    [owner] = await ethers.getSigners();


    const UserDataweb3 = await GetUserDetails();
    const UserData = await resolver.getUserData('0x51571107Cb5c25b3Ef36B714CBAd17F6F900B936');
    for(let i=0;i<6;i++)
    {
        expect(UserData[i].toString()).to.equal(UserDataweb3[i]);
    }
   
  }).timeout(100000);
});


async function GetUserDetails(){
    let userData = await LendingPoolcontract.methods.getUserAccountData(userAddress).call(function(err,res){

    });
    return userData;
    
}