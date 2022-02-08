//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import './Interfaces.sol';


contract Resolver {

    
    address LENDING_POOL_ADDRESS = 0x9198F13B08E299d85E096929fA9781A1E3d5d827;
    LendingPool LendingPoolObject = LendingPool(LENDING_POOL_ADDRESS);


    struct userData{
        uint256 totalCollateralETH;
        uint256 totalDebtETH;
        uint256 availableBorrowsETH;
        uint256 currentLiquidationThreshold;
        uint256 ltv;
        uint256 healthFactor;
    }

    function getUserData(address _user) external view returns(uint256,
    uint256 ,
    uint256 ,
    uint256 ,
    uint256 ,
    uint256 
    ){
        userData memory udata;
        (
        udata.totalCollateralETH,
        udata.totalDebtETH,
        udata.availableBorrowsETH,
        udata.currentLiquidationThreshold,
        udata.ltv,
        udata.healthFactor) = LendingPoolObject.getUserAccountData(_user);
        
        return (udata.totalCollateralETH,
        udata.totalDebtETH,
        udata.availableBorrowsETH,
        udata.currentLiquidationThreshold,
        udata.ltv,
        udata.healthFactor);
    }


}