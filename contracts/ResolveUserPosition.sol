//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "./Interfaces.sol";


contract ResolveUserPosition{

    address AggregatorProxy_ADDRESS = 0x0715A7794a1dc8e42615F059dD6e406A6594651A;
    AggregatorProxy AggregatorProxyObj= AggregatorProxy(AggregatorProxy_ADDRESS);

    address LENDING_POOL_ADDRESS = 0x9198F13B08E299d85E096929fA9781A1E3d5d827;
    LendingPool LendingPoolObject = LendingPool(LENDING_POOL_ADDRESS);

    address PROTOCOL_DATA_PROVIDER_ADDRESS =0xFA3bD19110d986c5e5E9DD5F69362d05035D045B;
    AaveProtocolDataProvider ProtocolDataProviderObj =AaveProtocolDataProvider(PROTOCOL_DATA_PROVIDER_ADDRESS);

    address PriceOrace_ADDRESS = 0xC365C653f7229894F93994CD0b30947Ab69Ff1D5;
    PriceOracle PriceOracleObj = PriceOracle(PriceOrace_ADDRESS);


    struct userData {
        uint256 totalCollateralUSD;
        uint256 totalDebtUSD;
        uint256 availableBorrowsUSD;
        uint256 currentLiquidationThreshold;
        uint256 ltv;
        uint256 healthFactor;
    }
    
    struct TokenData {
        string symbol;
        address tokenAddress;
    }
    
    function getAssetPrice(address asset) external view returns(uint256){
        return PriceOracleObj.getAssetPrice(asset);
    }
    
    function getCurrentLiquidityRate(address asset) external view returns(uint128)
    {
        DataTypes.ReserveData memory data= LendingPoolObject.getReserveData(asset);
        return data.currentLiquidityRate;
    }
    
    function getETHinUSD() external view returns(int256) {
        int256 answer;
        (
            ,
            answer,
            ,
            ,
        ) = AggregatorProxyObj.latestRoundData();
        return answer;
    }



    function getUserData(address user) external view returns(
        uint256 totalCollateralUSD,
        uint256 totalDebtUSD,
        uint256 availableBorrowsUSD,
        uint256 currentLiquidationThreshold,
        uint256 ltv,
        uint256 healthFactor
    ){
        userData memory udata;
        (
            udata.totalCollateralUSD,
            udata.totalDebtUSD,
            udata.availableBorrowsUSD,
            udata.currentLiquidationThreshold,
            udata.ltv,
            udata.healthFactor
        ) = LendingPoolObject.getUserAccountData(user);

        uint256 valueOfETHinUSD = uint256(this.getETHinUSD());
        udata.totalCollateralUSD = udata.totalCollateralUSD * valueOfETHinUSD;
        udata.availableBorrowsUSD = udata.availableBorrowsUSD * valueOfETHinUSD;
        udata.totalDebtUSD = udata.totalDebtUSD * valueOfETHinUSD;

        return(
            udata.totalCollateralUSD,
            udata.totalDebtUSD,
            udata.availableBorrowsUSD,
            udata.currentLiquidationThreshold,
            udata.ltv,
            udata.healthFactor
        );
    }

    function dataSpecificToReserve(address asset) external view returns(
        uint256 supplyRate,
        uint256 borrowRate,
        uint256 ltv,
        uint256 liquidationThreshold,
        uint256 priceInETH,
        uint256 priceInUSD
    ){
        priceInETH = this.getAssetPrice(asset);
        uint256 ETHinUSD= uint256(this.getETHinUSD());
        priceInUSD = ETHinUSD * priceInETH;
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
        (
            ,
            ,
            ,
            ,
            borrowRate,
            ,
            ,
            ,
            ,
        ) = ProtocolDataProviderObj.getReserveData(asset);
        supplyRate = this.getCurrentLiquidityRate(asset);
        return(
            supplyRate,
            borrowRate,
            ltv,
            liquidationThreshold,
            priceInETH,
            priceInUSD
        );
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

    function getTokenDataSpecificToUser(address asset,address user) external view returns(
        uint supply,
        uint borrow,
        uint maxBorrowLimit,
        uint maxLiquidationBorrowLimit
    ){
        ( 
            supply,
            ,
            borrow,
            ,
            ,
            ,
            ,
            ,
        )= ProtocolDataProviderObj.getUserReserveData(asset, user);
        uint availableBorrows;
        (
            ,
            ,
            availableBorrows,
            ,
            ,
        )=LendingPoolObject.getUserAccountData(user);
        uint ie10 = 10000000000;
        uint256 priceInETH = this.getAssetPrice(asset);
        maxBorrowLimit =  (availableBorrows*ie10) / priceInETH;
        
        uint collateral;
        uint liquidationThreshold;
        (collateral,,,,,) = LendingPoolObject.getUserAccountData(user);
        (
            ,
            ,
            liquidationThreshold,
            ,
            ,
            ,
            ,
            ,
            ,
            
        )= ProtocolDataProviderObj.getReserveConfigurationData(asset);
        
        uint collateralInToken = (collateral*ie10)/ priceInETH;
        maxLiquidationBorrowLimit = collateralInToken * liquidationThreshold;
        return(
            supply,
            borrow,
            maxBorrowLimit,
            maxLiquidationBorrowLimit
        ) ;
    }
}