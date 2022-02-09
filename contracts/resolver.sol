//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import './Interfaces.sol';


contract Resolver {

    
    address LENDING_POOL_ADDRESS = 0x9198F13B08E299d85E096929fA9781A1E3d5d827;
    LendingPool LendingPoolObject = LendingPool(LENDING_POOL_ADDRESS);


    address PROTOCOL_DATA_PROVIDER_ADDRESS = 0xFA3bD19110d986c5e5E9DD5F69362d05035D045B;
    AaveProtocolDataProvider ProtocolDataProviderObj = AaveProtocolDataProvider(PROTOCOL_DATA_PROVIDER_ADDRESS);

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


    struct UserAsset{
        uint256 currentATokenBalance;
        uint256 currentStableDebt;
        uint256 currentVariableDebt;
        uint256 principalStableDebt;
        uint256 scaledVariableDebt;
        uint256 stableBorrowRate;
        uint256 liquidityRate;
        uint40 stableRateLastUpdated;
        bool usageAsCollateralEnabled;
    }
    function GetUserAssetData(address _user,address _asset) external view returns(
        uint256 currentATokenBalance,
        uint256 currentStableDebt,
        uint256 currentVariableDebt,
        uint256 principalStableDebt,
        uint256 scaledVariableDebt,
        uint256 stableBorrowRate,
        uint256 liquidityRate,
        uint40 stableRateLastUpdated,
        bool usageAsCollateralEnabled
    ){
        UserAsset memory Usas;
        (
        Usas.currentATokenBalance,
        Usas.currentStableDebt,
        Usas.currentVariableDebt,
        Usas.principalStableDebt,
        Usas.scaledVariableDebt,
        Usas.stableBorrowRate,
        Usas.liquidityRate,
        ,
        
        ) = ProtocolDataProviderObj.getUserReserveData(_asset,_user);
        (
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            Usas.stableRateLastUpdated,
            Usas.usageAsCollateralEnabled
        ) = ProtocolDataProviderObj.getUserReserveData(_asset,_user);

        return (
            Usas.currentATokenBalance,
        Usas.currentStableDebt,
        Usas.currentVariableDebt,
        Usas.principalStableDebt,
        Usas.scaledVariableDebt,
        Usas.stableBorrowRate,
        Usas.liquidityRate,
        Usas.stableRateLastUpdated,
        Usas.usageAsCollateralEnabled
        );
    }
}