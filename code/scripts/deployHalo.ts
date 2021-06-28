import doDeployHalo from './doDeployHalo'

const INITIAL_MINT = 10 ** 8

doDeployHalo(INITIAL_MINT, true)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
