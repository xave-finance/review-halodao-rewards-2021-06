import deployAllAmmRewards from './deployAllAmmRewards'

deployAllAmmRewards('Moonbase', false)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
