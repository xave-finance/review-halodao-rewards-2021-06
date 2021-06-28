### Halo Rewards Smart Contract

### Quick Start

Install hardhat

```bash
cd halo-rewards
yarn install
```

### Environment Variables

Refer to our [env example](./.env.example) file in project root. We have dev accounts / mnemonics in our 1Password for each var listed

### Running Tests

```bash
yarn install
yarn run test
```

### Using dev scripts

### Development and Debug Scripts

- `npm/yarn run test` : for running test scripts using hardhat
- `npm/yarn run deploy:hardhat` : deploy all contracts in a hardhat environment node. this goes away after executing the script
- `npm/yarn run deploy:local` : deploys all contracts in a local node (hardhat node or ganache node). current local node is pointed to 8545 (hardhat)

### Testnet Deployment scripts

- `npm/yarn run deploy`: deploys all contracts to kovan testnet
- `npm/yarn run deploy-verify:kovan`: deploys all contracts and auto verifies on kovan testnet
- `npm/yarn run deploy:halo-kovan`: use to mint dummy HALO to your wallet. you can change the receiver, HALO token address and number of tokens to mint in ether units. this script only works on kovan
- `npm/yarn run deploy:onlyrewards-kovan` : use to deploy only the rewards contract. change the constructor parameters when necessary
