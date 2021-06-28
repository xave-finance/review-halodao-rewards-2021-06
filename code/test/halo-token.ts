import { expect } from 'chai'
import { ethers } from 'hardhat'

let haloTokenContract
let owner
let addr1
let addr2
let addrs
const INITIAL_MINT = 10 ** 6

describe('Halo Token', function () {
  before(async () => {
    ;[owner, addr1, addr2, ...addrs] = await ethers.getSigners()
    console.log('===================Deploying Contracts=====================')
    const HaloTokenContract = await ethers.getContractFactory('HaloToken')
    haloTokenContract = await HaloTokenContract.deploy('Halo', 'HALO')
    await haloTokenContract.deployed()
    console.log('halo token deployed')
    // Mint initial Halo tokens
    await haloTokenContract.mint(
      owner.address,
      ethers.utils.parseEther((40 * INITIAL_MINT).toString())
    )
    console.log('Minted initial HALO for owner account')

    await haloTokenContract.mint(
      addr1.address,
      ethers.utils.parseEther((40 * INITIAL_MINT).toString())
    )
    console.log('Minted initial HALO for addr1 account')
  })

  describe('Check Contract Deployment', async () => {
    it('HaloToken should be deployed', async () => {
      const ownerHaloBalance = await haloTokenContract.balanceOf(owner.address)
      const addr1HaloBalance = await haloTokenContract.balanceOf(addr1.address)
      const expectedTotalSupply = ownerHaloBalance.add(addr1HaloBalance)
      expect(await haloTokenContract.symbol()).to.equal('HALO')
      expect(await haloTokenContract.name()).to.equal('Halo')
      expect(await haloTokenContract.totalSupply()).to.equal(
        expectedTotalSupply
      )
    })
  })
  
  describe('I should be able to transfer HALO tokens', async () => {
    const transferAmount = ethers.utils.parseEther(
      (10 * INITIAL_MINT).toString()
    )
    it('Allow transfer', async () => {
      await expect(
        haloTokenContract.connect(owner).transfer(addr1.address, transferAmount)
      ).to.be.not.reverted
    })
  })
  describe('I should be able to mint HALO tokens and get the correct totalSupply', async () => {
    const mintAmount = ethers.utils.parseEther((10 * INITIAL_MINT).toString())
    it('Only owner should mint', async () => {
      await expect(
        haloTokenContract.connect(owner).mint(owner.address, mintAmount)
      ).to.be.not.reverted
      await expect(
        haloTokenContract.connect(addr1).mint(owner.address, mintAmount)
      ).to.be.revertedWith('Ownable: caller is not the owner')
    })
    it('When owner mints, the total supply should be equal to all wallet balance', async () => {
      await haloTokenContract.mint(owner.address, mintAmount)
      const ownerHaloBalance = await haloTokenContract.balanceOf(owner.address)
      const addr1HaloBalance = await haloTokenContract.balanceOf(addr1.address)
      const expectedTotalSupply = ownerHaloBalance.add(addr1HaloBalance)
      expect(await haloTokenContract.totalSupply()).to.equal(
        expectedTotalSupply
      )
      console.log(`${Number(ownerHaloBalance)}  HALO tokens owner balance`)
    })
  })
  describe('I should not be allowed to mint if capped is already locked', async () => {
    const mintAmount = ethers.utils.parseEther((10 * INITIAL_MINT).toString())
    it('Only owner can execute setCapped', async () => {
      await expect(
        haloTokenContract.connect(addr1).setCapped()
      ).to.be.revertedWith('Ownable: caller is not the owner')
      await expect(haloTokenContract.connect(owner).setCapped()).to.be.not
        .reverted
    })
    it('Should revert mint when capped is locked', async () => {
      await expect(
        haloTokenContract.connect(owner).mint(owner.address, mintAmount)
      ).to.be.revertedWith('Total supply is now capped, cannot mint more')
    })
    it('Should revert setCapped func if it has been executed more than once', async () => {
      await expect(
        haloTokenContract.connect(owner).setCapped()
      ).to.be.revertedWith('Cannot execute setCapped more than once')
    })
  })
  describe('I should be able to burn HALO tokens and get the correct totalSupply', async () => {
    const burnAmount = ethers.utils.parseEther((5 * INITIAL_MINT).toString())
    it('Only account holder should burn', async () => {
      await expect(
        haloTokenContract.connect(owner).burn(burnAmount)
      ).to.be.not.reverted
    })
    it('Only owner should burn users tokens', async () => {
      await haloTokenContract.connect(owner).transfer(addr1.address, 10)
      let addr1HaloBalance = await haloTokenContract.balanceOf(addr1.address)
      expect(ethers.BigNumber.from("50000000000000000000000010")).to.equal(addr1HaloBalance)
      await haloTokenContract.connect(addr1).increaseAllowance(owner.address, burnAmount)
      await expect(
        haloTokenContract.connect(owner).burnFrom(addr1.address, burnAmount)
      ).to.be.not.reverted
      addr1HaloBalance = await haloTokenContract.balanceOf(addr1.address)
      expect(ethers.BigNumber.from("45000000000000000000000010")).to.equal(addr1HaloBalance)
    })
    it('When user burns, the total supply should be equal to all wallet balance', async () => {
      await haloTokenContract.burn(burnAmount)
      const ownerHaloBalance = await haloTokenContract.balanceOf(owner.address)
      const addr1HaloBalance = await haloTokenContract.balanceOf(addr1.address)
      const expectedTotalSupply = ownerHaloBalance.add(addr1HaloBalance)
      expect(await haloTokenContract.totalSupply()).to.equal(
        expectedTotalSupply
      )
      console.log(`${Number(ownerHaloBalance)} HALO tokens owner balance`)
    })
    it('Burn amount should not exceed wallet balance', async () => {
      await expect(
        haloTokenContract
          .connect(owner)
          .burn(
            ethers.utils.parseEther((101 * INITIAL_MINT).toString())
          )
      ).to.be.revertedWith('ERC20: burn amount exceeds balance')
      await expect(
        haloTokenContract
          .connect(owner)
          .burn(
            ethers.utils.parseEther((101 * INITIAL_MINT).toString())
          )
      ).to.be.revertedWith('ERC20: burn amount exceeds balance')
    })
  })
})
