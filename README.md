# FonoRoot

Audio NFT with a tree-like minting process 

__Live version:__ [rarevandal.com](www.rarevandal.com)

## Description

The admin user can create new root NFTs on the admin page. The admin page can be reached by appending `?admin` to the url. The front-end is coming from the IPFS network, so the URL will contain the CID. [rarevandal.com](www.rarevandal.com) will redirect to an ipfs gateway (ipfs.io). Normal routing would cause problems, that's why we are using url params instead. These are the possible routes:
 * ?admin: The person who is set as `admin` in the smart contract can create new root NFTs here
 * ?my-nfts: List of NFTs the user owns. Possible to transfer NFT, but we are not verifying yet if the account name is a valid and existing account
 * ?init: Here is a button that will initialize the contract. It will set `admin` according to `projectConfig.json`
 * ?withdraw: It is possible to withdraw funds from the contract (Vault), only admin can call the function. In the future we will have a royalty system and withdrawal will be redesigned as well

The IDs of the NFTs will be of format `fono-root-X-Y`, where `X` is root nonce and `Y` is child nonce. For root NFTs, there is no Y number. For example, `fono-root-0` or `fono-root-2`.
When a root NFT is created, the root NFT will be transfered to admin, and 2 children will be created, they will be owned by the contract (Vault). When an NFT is bought from the Vault, 2 new children will be created. The user has to buy the NFT that is higher in the tree, only that one will be presented to the user. These NFTs, that can be bought, will have an ID like `fono-root-0-0`, `fono-root-0-5` (these would all be the same music and picture, root is `fono-root-0`.

`projectConfig.json` has fields:
 * `contractName`: name of the contract instance the site should use. `.env` wouldn't work in our situation, because we don't have a backend server
 * `admin`: used at initialization

If site cloning would work, it would change the `projectConfig.json` for the new site. The IPFS part of this works, but we haven't been able to create a new contract instance from front-end.

## Prerequisites

NodeJS version should be `v16.13.2`

## Start locally

`npm run dev`

## Deploying to IPFS

1. After running `npm run dev`, copy `CONTRACT_NAME` from `neardev/dev-account.env` to `src/projectConfig.json` under `contractName`. The `admin` field should be a NEAR account id, that account will be able to create new root NFTs. 
2. Run `npm run build`.
3. The dist folder can be added to IPFS. If we are running an IPFS node, we can run `ipfs add -r dist/`, or we can upload the dist folder to Pinata.
4. Open `https://ipfs.io/ipfs/<CID>?init` (For example, [https://ipfs.io/ipfs/Qmc693kKZx6YnEFwL7zzqbrJ8TKvFg7h8t3hRa1RR5oHam/?init](https://ipfs.io/ipfs/Qmc693kKZx6YnEFwL7zzqbrJ8TKvFg7h8t3hRa1RR5oHam/?init)
5. Click on `INIT`
Now admin will be able to set a Crust key and start uploading new content.


__Designer__: Lena ([website](https://www.lenamarakova.com/), [LinkedIn](https://www.linkedin.com/in/elenamarakova/))
__Idea and Project Owner__: Vandal ([website](https://linktr.ee/vandigital), [Twitter](https://twitter.com/vandigital), [LinkedIn](https://www.linkedin.com/in/vandigital/))