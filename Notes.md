 +  AmmRewards (ReentrancyGuard, Ownable)
    - [ ][Pub] <Constructor> #
    - [ ][Pub] poolLength
    - [ ][Pub] add #
       - modifiers: onlyOwner
    - [ ][Pub] set #
       - modifiers: onlyOwner
    - [ ][Ext] setRewardTokenPerSecond #
       - modifiers: onlyOwnerOrRewardsManager
    - [ ][Ext] pendingRewardToken
    - [ ][Ext] massUpdatePools #
    - [ ][Pub] updatePool #
    - [ ][Pub] deposit #
    - [ ][Pub] withdraw #
    - [ ][Pub] harvest #
    - [ ][Pub] withdrawAndHarvest #
    - [ ][Pub] emergencyWithdraw #
    - [ ][Pub] setRewardsManager #
       - modifiers: onlyOwner

 +  HaloHalo (ERC20)
    - [ ][Pub] <Constructor> #
    - [ ][Pub] enter #
      - D: a user can manipulate how much `halo` token exists in the contract. what next?
      - D: the comments says the ratio will change overtime as halo is burned/minted, but doesn't seem so.
    - [ ][Pub] leave #
    - [ ][Pub] getCurrentHaloHaloPrice

 +  HaloToken (ERC20, ERC20Burnable, Ownable)
    - [ ][Pub] <Constructor> #
       - modifiers: ERC20
    - [ ][Ext] setCapped #
       - modifiers: onlyOwner
    - [ ][Ext] mint #
       - modifiers: onlyOwner

 +  RewardsManager (Ownable)
    - [ ][Pub] <Constructor> #
    - [ ][Ext] releaseEpochRewards #
       - modifiers: onlyOwner
    - [ ][Ext] setVestingRatio #
       - modifiers: onlyOwner
    - [ ][Ext] setRewardsContract #
       - modifiers: onlyOwner
    - [ ][Ext] setHaloHaloContract #
       - modifiers: onlyOwner
    - [ ][Ext] getVestingRatio
    - [ ][Ext] getRewardsContract
    - [ ][Ext] getHaloHaloContract
    - [ ][Int] transferToHaloHaloContract #
    - [ ][Int] convertAndTransferToRewardsContract #