require('dotenv').config()
const privateKey = process.env.SECRET_KEY
const LendingPoolAbi = require('../LendingPoolABI.json');
const LendingPoolAddress = '0x9198F13B08E299d85E096929fA9781A1E3d5d827';
const LendingPoolcontract = new web3.eth.Contract(LendingPoolAbi, LendingPoolAddress);
const userAddress = '0x51571107Cb5c25b3Ef36B714CBAd17F6F900B936';



async function GetUserDetails(){
    let userData = await LendingPoolcontract.methods.getUserAccountData(userAddress).call(function(err,res){

    });
    console.log(userData);
    
}

GetUserDetails();

