import { ethers } from 'hardhat'
import doDeployHalo from './doDeployHalo'
const hre = require('hardhat')
import doDeployVesting from './doDeployVesting'

const BASIS_POINTS = 10 ** 4
const INITIAL_MINT = 10 ** 8

const sleep = (ms) => new Promise((res) => setTimeout(res, ms))

const deployAll = async (network, verify) => {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying with account: ', deployer.address)
  /**
   * Deploy HaloToken contract
   */
  const haloTokenAddress = await doDeployHalo(INITIAL_MINT, verify)

  /**
   * Deploy Vesting contract
   */
  const vestingAddress = await doDeployVesting(haloTokenAddress, verify)

  /**
   * Deploy dummy contracts (required by Rewards contract)
   * - collateral token
   * - LP token contract
   * - minter
   */
  const CollateralERC20 = await ethers.getContractFactory('CollateralERC20')
  const collateralERC20Contract = await CollateralERC20.deploy('Dai', 'DAI')
  await collateralERC20Contract.deployed()

  /**
   * Deploy Rewards contract
   */
  const ammLpRewardsRatio = 0.4 * BASIS_POINTS
  const vestingRewardsRatio = 0.2 * BASIS_POINTS
  const genesisBlock = await ethers.provider.getBlockNumber()

  let ammLpPools = []

  switch (network) {
    case 'Kovan':
      // Hardcode kovan balancer pools
      ammLpPools = [
        ['0x37f80ac90235ce0d3911952d0ce49071a0ffdb1e', 10],
        ['0x65850ecd767e7ef71e4b78a348bb605343bd87c3', 10]
      ]
      break
    case 'Goerli':
      ammLpPools = [
        ['0xBea012aaF56949a95759B9CE0B494A97edf389e6', 10],
        ['0x9C303C18397cB5Fa62D9e68a0C7f2Cc6e00F0066', 10]
      ]
      break
    case 'Matic':
      // Sushi LP Token
      ammLpPools = [['0xc4e595acDD7d12feC385E5dA5D43160e8A0bAC0E', 10]]
      break
    case 'Moonbase':
    case 'Local': {
      const LpToken = await ethers.getContractFactory('LpToken')
      const lpTokenContract = await LpToken.deploy('LpToken', 'LPT')
      await lpTokenContract.deployed()
      console.log('lptoken deployed at ', lpTokenContract.address)
      ammLpPools = [[lpTokenContract.address, 10]]
      break
    }
    default:
      ammLpPools = [
        ['0x37f80ac90235ce0d3911952d0ce49071a0ffdb1e', 10],
        ['0x65850ecd767e7ef71e4b78a348bb605343bd87c3', 10]
      ]
      break
  }

  const Rewards = await ethers.getContractFactory('Rewards')
  const rewardsContract = await Rewards.deploy(
    vestingAddress,
    ammLpRewardsRatio, //in bps, multiplied by 10^4
    genesisBlock,
    ammLpPools
  )
  await rewardsContract.deployed()
  console.log(
    'rewardsContract deployed at contract address ',
    rewardsContract.address
  )

  const RewardsManager = await ethers.getContractFactory('RewardsManager')
  const rewardsManager = await RewardsManager.deploy(
    vestingRewardsRatio,
    rewardsContract.address,
    vestingAddress,
    haloTokenAddress
  )
  console.log(
    'rewardsManager deployed at contract address ',
    rewardsManager.address
  )
  await rewardsContract.setRewardsManagerAddress(rewardsManager.address)
  const rewardsManagerAddress = await rewardsContract.getRewardsManagerAddress()
  console.log('rewardsContract manager set to ', rewardsManagerAddress)

  if (verify === true) {
    console.log(
      'waiting 1 minute for etherscan to cache newly deployed contract bytecode'
    )
    await sleep(60000)
    console.log('done waiting')

    // auto verify rewards contract
    console.log('verifying rewardsContract')
    await hre.run('verify:verify', {
      address: rewardsContract.address,
      constructorArguments: [
        vestingAddress,
        ammLpRewardsRatio,
        genesisBlock,
        ammLpPools
      ]
    })

    // auto verify RewardsManager contract
    console.log('verifying rewardsManagerContract')
    await hre.run('verify:verify', {
      address: rewardsManager.address,
      constructorArguments: [
        vestingRewardsRatio,
        rewardsContract.address,
        vestingAddress,
        haloTokenAddress
      ]
    })
  }
}

export default deployAll
