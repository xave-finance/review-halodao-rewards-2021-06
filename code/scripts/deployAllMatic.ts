import deployAllAmmRewards from './deployAllAmmRewards'

deployAllAmmRewards('Matic', false)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
