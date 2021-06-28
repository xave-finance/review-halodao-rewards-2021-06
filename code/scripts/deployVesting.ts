import doDeployVesting from './doDeployVesting'

doDeployVesting(process.env.HALO_TOKEN_ADDRESS, true)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
