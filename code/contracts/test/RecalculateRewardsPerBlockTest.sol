// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.6.12;
pragma experimental ABIEncoderV2;

import {SafeMath} from '@openzeppelin/contracts/math/SafeMath.sol';

contract RecalculateRewardsPerBlockTest {
  using SafeMath for uint256;

  constructor() public {}

  function recalculateRewardPerBlock(uint256 _epochRewardAmount)
    internal
    pure
    returns (uint256)
  {
    // 5 blocks per minute * 60 min * 24 hours * 30 days
    uint256 rewardPerBlock =
      recalculateRewardPerBlock(_epochRewardAmount, 5, 30);

    return rewardPerBlock;
  }

  function recalculateRewardPerBlock(
    uint256 _epochRewardAmount,
    uint256 _blocksPerMin,
    uint256 _epochLengthInDays
  ) internal pure returns (uint256) {
    require(_blocksPerMin > 0, 'blocksPerMin can not be zero');
    require(_epochLengthInDays > 0, 'epochLengthInDays can not be zero');

    //60 min * 24 hours = 1440
    uint256 rewardPerBlock =
      _epochRewardAmount.div(_blocksPerMin.mul(_epochLengthInDays).mul(1440));

    return rewardPerBlock;
  }

  function recalculateRewardUsingEpochRewardAmountTest(
    uint256 _epochRewardAmount
  ) public view returns (uint256) {
    return recalculateRewardPerBlock(_epochRewardAmount);
  }

  function recalculateRewardPerBlockTest(
    uint256 _epochRewardAmount,
    uint256 _blocksPerMin,
    uint256 _epochLengthInDays
  ) public view returns (uint256) {
    return
      recalculateRewardPerBlock(
        _epochRewardAmount,
        _blocksPerMin,
        _epochLengthInDays
      );
  }
}
