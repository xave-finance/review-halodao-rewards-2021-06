 +  AmmRewards (ReentrancyGuard, Ownable)
    - [x][Pub] <Constructor> #
    - [x][Pub] poolLength
    - [ ][Pub] add #
       - modifiers: onlyOwner
       - [ ] D: Not sure if they should globally update something when they add a new LP (related to totalAllocPoint).
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
    - [x][Pub] <Constructor> #
    - [x][Pub] enter #
      - [x] D: a user can manipulate how much `halo` token exists in the contract. what next?
      - [x] D: the comment says the ratio will change overtime as halo is burned/minted, but doesn't seem so.
    - [x][Pub] leave #
    - [x][Pub] getCurrentHaloHaloPrice

 +  HaloToken (ERC20, ERC20Burnable, Ownable)
    - [x][Pub] <Constructor> #
       - modifiers: ERC20
    - [x][Ext] setCapped #
       - modifiers: onlyOwner
    - [x][Ext] mint #
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