//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "./Interfaces.sol";



contract ResolverProtocolDataProvider{
    address PROTOCOL_DATA_PROVIDER_ADDRESS =
        0xFA3bD19110d986c5e5E9DD5F69362d05035D045B;
    AaveProtocolDataProvider ProtocolDataProviderObj =
        AaveProtocolDataProvider(PROTOCOL_DATA_PROVIDER_ADDRESS);

    struct TokenData {
        string symbol;
        address tokenAddress;
    }
   

    function getAllReservesTokens() external view returns (TokenData[] memory){
        AaveProtocolDataProvider.TokenData[] memory data = ProtocolDataProviderObj.getAllReservesTokens();
        TokenData[] memory dataHere = new TokenData[](7);
        for(uint8 i=0;i<7;i++)
        {
            dataHere[i].symbol = data[i].symbol;
            dataHere[i].tokenAddress = data[i].tokenAddress;
        }
        return dataHere;
    }

    function getUserReserveData(address asset,address user) external view returns(uint256 currentATokenBalance,uint256 currentVariableDebt){
        ( 
            currentATokenBalance,
            ,
            currentVariableDebt,
            ,
            ,
            ,
            ,
            ,
        )= ProtocolDataProviderObj.getUserReserveData(asset, user);
        return (currentATokenBalance,currentVariableDebt);
    }

    function getReserveConfigurationData(address asset) external view returns(uint256 ltv,uint256 liquidationThreshold){
        (
            ,
            ltv,
            liquidationThreshold,
            ,
            ,
            ,
            ,
            ,
            ,
            
        )= ProtocolDataProviderObj.getReserveConfigurationData(asset);
        return (ltv,liquidationThreshold);
    }

    function getReserveData(address asset) external view returns(uint256 variableBorrowRate){
        (
            ,
            ,
            ,
            ,
            variableBorrowRate,
            ,
            ,
            ,
            ,
        ) = ProtocolDataProviderObj.getReserveData(asset);
        return variableBorrowRate;
    }
}