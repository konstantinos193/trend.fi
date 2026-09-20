// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IMarketFactory {
    function getCreatorFeeRate(uint256 _marketId) external view returns (uint256);
    function getMarketCreator(uint256 _marketId) external view returns (address);
    function updateMarketVolume(uint256 _marketId, uint256 _tradeAmount) external;
}
