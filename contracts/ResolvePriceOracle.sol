//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "./Interfaces.sol";


contract ResolvePriceOracle{
    address PriceOrace_ADDRESS = 0xC365C653f7229894F93994CD0b30947Ab69Ff1D5;
    PriceOracle PriceOracleObj = PriceOracle(PriceOrace_ADDRESS);
    function getAssetPrice(address asset) external view returns(uint256){
        return PriceOracleObj.getAssetPrice(asset);
    } 
}