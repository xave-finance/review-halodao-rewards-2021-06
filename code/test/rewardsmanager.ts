import { formatEther, parseEther } from 'ethers/lib/utils'
import { expect } from 'chai'
import { ethers } from 'hardhat'

let haloTokenContract
let halohaloContract
let changedHaloHaloContract
let rewardsContract
let changedRewardsContract
let rewardsManagerContract
let addrs
let collateralERC20Contract
let lpTokenContract
let epochLength
let epoch0VestedRewards

// Number constants
const genesisBlock = 0
const BASIS_POINTS = 10 ** 4
const ammLpRewardsRatio = 0.4 * BASIS_POINTS
const vestingRewardsRatio = 0.2 * BASIS_POINTS
const changedVestingRewardsRatio = 0.33 * BASIS_POINTS
const releasedRewardsRatio = 0.8 * BASIS_POINTS // 80% of the released rewards
const epoch0ExpectedHaloHaloPrice = parseEther('1')
const epoch1ExpectedHaloHaloPrice = parseEther('1.25')
const epoch1ExpectedHaloHaloPriceEther = 1.25
// const RELEASED_HALO_REWARDS = parseEther('10000') // got from the previous contract
//const RELEASED_HALO_REWARDS = parseEther('6264000')
const RELEASED_HALO_REWARDS = parseEther('250000')
const zeroAddress = '0x0000000000000000000000000000000000000000'
epochLength = 30 * 24 * 60 * 5
console.log('BASIS_POINTS = ', BASIS_POINTS)

describe('Rewards Manager', async () => {
  before(async () => {
    ;[...addrs] = await ethers.getSigners()
    console.log('===================Deploying Contracts=====================')

    const CollateralERC20 = await ethers.getContractFactory('CollateralERC20')
    collateralERC20Contract = await CollateralERC20.deploy(
      'collateral ERC20',
      'collateral ERC20'
    )
    await collateralERC20Contract.deployed()
    console.log('collateralERC20 deployed')

    const LpToken = await ethers.getContractFactory('LpToken')
    lpTokenContract = await LpToken.deploy('LpToken', 'LPT')

    await lpTokenContract.deployed()

    const HaloTokenContract = await ethers.getContractFactory('HaloToken')
    haloTokenContract = await HaloTokenContract.deploy('Halo', 'HALO')
    await haloTokenContract.deployed()
    console.log('halo token deployed')

    const HalohaloContract = await ethers.getContractFactory('HaloHalo')
    halohaloContract = await HalohaloContract.deploy(haloTokenContract.address)
    await halohaloContract.deployed()
    console.log('halohalo deployed')

    changedHaloHaloContract = await HalohaloContract.deploy(
      haloTokenContract.address
    )
    await changedHaloHaloContract.deployed()
    console.log('changedHaloHaloContract deployed')

    const minterLpPools = [[collateralERC20Contract.address, 10]]
    const ammLpPools = [[lpTokenContract.address, 10]]
    const RewardsContract = await ethers.getContractFactory('AmmRewards')

    rewardsContract = await RewardsContract.deploy(
      halohaloContract.address,
    )

    changedRewardsContract = await RewardsContract.deploy(
      halohaloContract.address,
    )

    const RewardsManagerContract = await ethers.getContractFactory(
      'RewardsManager'
    )
    rewardsManagerContract = await RewardsManagerContract.deploy(
      vestingRewardsRatio,
      rewardsContract.address,
      halohaloContract.address,
      haloTokenContract.address
    )

    await rewardsContract.setRewardsManager(rewardsManagerContract.address)
    console.log('Set Rewards Manager contract.')

    console.log(
      `Deployed Rewards Manager Contract address: ${rewardsManagerContract.address}`
    )
    console.log(
      '==========================================================\n\n'
    )
  })

  describe('Check Contract Deployments', () => {
    it('HaloToken should be deployed', async () => {
      expect(await haloTokenContract.symbol()).to.equal('HALO')
      expect(await haloTokenContract.name()).to.equal('Halo')
    })

    it('Halohalo should be deployed', async () => {
      expect(await halohaloContract.symbol()).to.equal('xRNBW')
      expect(await halohaloContract.name()).to.equal('Rainbow Pool')
      expect(await changedHaloHaloContract.symbol()).to.equal('xRNBW')
      expect(await changedHaloHaloContract.name()).to.equal('Rainbow Pool')
    })

    it('Lptoken should be deployed', async () => {
      expect(await lpTokenContract.symbol()).to.equal('LPT')
      expect(await lpTokenContract.name()).to.equal('LpToken')
    })

    it('Rewards Management Contract should be deployed', async () => {
      expect(await rewardsManagerContract.getRewardsContract()).to.equal(
        rewardsContract.address
      )

      expect(await rewardsManagerContract.getHaloHaloContract()).to.equal(
        halohaloContract.address
      )
      expect(await rewardsManagerContract.getVestingRatio()).to.equal(
        vestingRewardsRatio
      )
    })
  })

  describe('Admin functions can be set by the owner', async () => {
    afterEach(async () => {
      // reset to state after deployment
      await rewardsManagerContract.setVestingRatio(vestingRewardsRatio)
      await rewardsManagerContract.setRewardsContract(rewardsContract.address)
      await rewardsManagerContract.setHaloHaloContract(halohaloContract.address)
    })
    it('can set the vestingRatio if the caller is the owner', async () => {
      expect(await rewardsManagerContract.getVestingRatio()).to.equal(
        vestingRewardsRatio
      )

      await expect(
        rewardsManagerContract.setVestingRatio(changedVestingRewardsRatio),
        'Vesting Ratio not changed'
      ).to.not.be.reverted

      expect(await rewardsManagerContract.getVestingRatio()).to.equal(
        changedVestingRewardsRatio
      )
    })

    it('can not set the vestingRatio if the caller is not the owner', async () => {
      expect(await rewardsManagerContract.getVestingRatio()).to.equal(
        vestingRewardsRatio
      )

      await expect(
        rewardsManagerContract
          .connect(addrs[1])
          .setVestingRatio(changedVestingRewardsRatio),
        'Function called even if the caller is not the owner'
      ).to.be.reverted
    })

    it('can not set the vesting ratio if vesting ratio is equal to zero', async () => {
      expect(await rewardsManagerContract.getVestingRatio()).to.equal(
        vestingRewardsRatio
      )
      await expect(
        rewardsManagerContract.setVestingRatio(0),
        'Vesting ratio is not zero'
      ).to.be.revertedWith('Vesting ratio cannot be zero!')
    })

    it('can set the rewards contract if the caller is the owner', async () => {
      expect(await rewardsManagerContract.getRewardsContract()).to.equal(
        rewardsContract.address
      )
      await expect(
        rewardsManagerContract.setRewardsContract(
          changedRewardsContract.address
        ),
        'Rewards contract not changed'
      ).to.not.be.reverted

      expect(await rewardsManagerContract.getRewardsContract()).to.equal(
        changedRewardsContract.address
      )
    })

    it('can not set the rewards contract if the caller is not the owner', async () => {
      expect(await rewardsManagerContract.getRewardsContract()).to.equal(
        rewardsContract.address
      )

      await expect(
        rewardsManagerContract
          .connect(addrs[1])
          .setRewardsContract(changedRewardsContract.address),
        'Function called even if the caller is not the owner'
      ).to.be.reverted
    })

    it('can not set the rewards contract if address parameter is address(0)', async () => {
      expect(await rewardsManagerContract.getRewardsContract()).to.equal(
        rewardsContract.address
      )

      await expect(
        rewardsManagerContract.setRewardsContract(zeroAddress),
        'Address is not address(0)'
      ).to.be.revertedWith('Rewards contract cannot be empty!')
    })

    it('can set the halohalo contract if the caller is the owner', async () => {
      expect(await rewardsManagerContract.getHaloHaloContract()).to.equal(
        halohaloContract.address
      )

      await expect(
        rewardsManagerContract.setHaloHaloContract(
          changedHaloHaloContract.address
        ),
        'Halohalo contract not changed'
      ).to.not.be.reverted

      expect(await rewardsManagerContract.getHaloHaloContract()).to.equal(
        changedHaloHaloContract.address
      )
    })

    it('can not set the halohalo contract if the caller is not the owner', async () => {
      expect(await rewardsManagerContract.getHaloHaloContract()).to.equal(
        halohaloContract.address
      )

      await expect(
        rewardsManagerContract
          .connect(addrs[1])
          .setHaloHaloContract(changedHaloHaloContract.address),
        'Function called even if the caller is not the owner'
      ).to.be.reverted
    })

    it('can not set the halohalo contract if the address parameter is address(0)', async () => {
      expect(await rewardsManagerContract.getHaloHaloContract()).to.equal(
        halohaloContract.address
      )

      await expect(
        rewardsManagerContract.setHaloHaloContract(zeroAddress),
        'Address is not address(0)'
      ).to.be.revertedWith('Halohalo contract cannot be empty!')
    })
  })

  describe('Released HALO will be distributed 80% to the rewards contract converted to DESRT and 20% will be vested to the halohalo contract', async () => {
    it('Release rewards in Epoch 0, HALOHALO priced to one at the end', async () => {
      epoch0VestedRewards = RELEASED_HALO_REWARDS.mul(vestingRewardsRatio).div(
        BASIS_POINTS
      )

      const expectedHaloHalo = RELEASED_HALO_REWARDS.mul(
        releasedRewardsRatio
      ).div(BASIS_POINTS)

      // Simulate release through minting
      await expect(
        haloTokenContract.mint(addrs[0].address, RELEASED_HALO_REWARDS)
      ).to.not.be.reverted

      await haloTokenContract.approve(
        rewardsManagerContract.address,
        RELEASED_HALO_REWARDS
      )
      // Release rewards then check events and their args
      await expect(
        rewardsManagerContract.releaseEpochRewards(RELEASED_HALO_REWARDS),
        'Rewards was not distributed'
      )
        .to.emit(
          rewardsManagerContract,
          'ReleasedRewardsToRewardsContractEvent'
        )
        .withArgs(RELEASED_HALO_REWARDS.sub(epoch0VestedRewards)).to.not.be
        .reverted

      expect(
        await halohaloContract.balanceOf(rewardsContract.address),
        `Current HaloHalo is not equal to ${formatEther(expectedHaloHalo)}`
      ).to.equal(expectedHaloHalo)

      expect(
        await haloTokenContract.balanceOf(rewardsManagerContract.address),
        `Total Epoch 0 vested rewards that remaind in the rewards contract manager is not equal to ${epoch0VestedRewards}`
      ).to.equal(epoch0VestedRewards)

      expect(
        await halohaloContract.getCurrentHaloHaloPrice(),
        'HALOHALO price is not 1 HALO'
      ).to.equal(epoch0ExpectedHaloHaloPrice)
    })

    it(`Release rewards in Epoch 1, HALOHALO priced to ${formatEther(
      epoch1ExpectedHaloHaloPrice
    )} at the end `, async () => {
      const expectedHaloHalo = RELEASED_HALO_REWARDS.mul(
        releasedRewardsRatio
      ).div(epoch1ExpectedHaloHaloPriceEther * BASIS_POINTS)

      // Simulate release through minting
      await expect(
        haloTokenContract.mint(addrs[0].address, RELEASED_HALO_REWARDS)
      ).to.not.be.reverted

      await haloTokenContract.approve(
        rewardsManagerContract.address,
        RELEASED_HALO_REWARDS
      )

      // Release rewards and check events and their args
      await expect(
        rewardsManagerContract.releaseEpochRewards(RELEASED_HALO_REWARDS),
        'Rewards was not distributed'
      )
        .to.emit(rewardsManagerContract, 'SentVestedRewardsEvent')
        .withArgs(epoch0VestedRewards)
        .to.emit(
          rewardsManagerContract,
          'ReleasedRewardsToRewardsContractEvent'
        )
        .withArgs(expectedHaloHalo).to.not.be.reverted

      expect(
        await halohaloContract.getCurrentHaloHaloPrice(),
        `HALOHALO price is not ${epoch1ExpectedHaloHaloPrice} HALO`
      ).to.equal(epoch1ExpectedHaloHaloPrice)
    })

    it('fails if the caller is not the owner', async () => {
      await expect(
        rewardsManagerContract
          .connect(addrs[1])
          .releaseEpochRewards(RELEASED_HALO_REWARDS),
        'Function called even if the caller is not the owner'
      ).to.be.reverted
    })
  })
})
