//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "./Interfaces.sol";


contract ResolveAggregatorProxy{
    address AggregatorProxy_ADDRESS = 0x0715A7794a1dc8e42615F059dD6e406A6594651A;
    AggregatorProxy AggregatorProxyObj= AggregatorProxy(AggregatorProxy_ADDRESS);
    function EthToUSD() external view returns(int256) {
        int256 answer;
        (
            ,
            answer,
            ,
            ,
        ) = AggregatorProxyObj.latestRoundData();
        return answer;
    }
}
