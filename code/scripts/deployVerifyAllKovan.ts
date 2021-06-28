import deployAllAmmRewards from './deployAllAmmRewards'

deployAllAmmRewards('Kovan', true)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
