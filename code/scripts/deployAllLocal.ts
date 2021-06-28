import deployAllAmmRewards from './deployAllAmmRewards'

deployAllAmmRewards('Local', false)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
