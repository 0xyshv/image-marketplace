# Alpha Marketplace

Actually Open AI Hackathon / Arweave Bounty.
Team [AlphaDevs](https://alphadevs.dev)

## Protocol Specs

- Arweave Blockchain / Permaweb (Deploy all assets with tags and frontend app)
- AI image classifier (Backend classifier server to generate tags for the image and create image buffers)
- UDL and custom tags (specify license fee, make data discoverable and easy to query)

## Libraries / APIs Used

### Frontend

- React.js
- arweave, arweave-wallet-connector, arweave-account
- graphQL (query tagged data from arweave gateways)

### Backend

- Express , cors
- multer
- Cloud Vision API

### CLI

- arkb (deploy frontend builds to arweave)

## 1. AI Image Classifier

- Backend node server
- Tag generation feature hosted locally to avoid extra server costs and API abuse :P
- Extra : Used to generate Image buffers as Web browser lack access to low level system APIs (there can be better way to solve it in client side as well , open to ideas)

## 2. Frontend and Assets

- Wallet connection with ArConnect and arweave web wallet
- Display of tags and image content in marketplace
- Easy query with asset tags and find creators and their work with their address
- Generate Tags and Upload .png images
- References and Codebases Used : Arweave Cookbook, Public Square App tutorial by DanMacDonald, Improved Code (created PR) and added fixes, >80% new code and features added

## 3. UDL and Custom Tags

- Add License Fee
- Add Payment Address
- Create and edit content custom tags for your content
- Displays a License tag under licensed assets with their License-Fee

## Links

- [Deployed URL](https://arweave.net/bGFScn_7bqMGfU_MI977gEJdvk7t9_q7I17Di6Q6hYs)
- [Example UnLicensed Asset with Tags (AlphaDevs Logo)](https://arweave.net/-znpW5qVZxwS_lUwN2AyOzP2yhMa2w5Y-zvXS97MOgg)
- [Frontend Git Repo with README](https://github.com/0xyshv/image-marketplace)
- [Backend AI Classifier Server Repo](https://github.com/mr-harshtyagi/image-classifier-server)

## Team

### Github

[Harsh Tyagi](https://github.com/mr-harshtyagi)
[Yashasvi Chaudhary](https://github.com/0xyshv)

### Twitter / X

[Harsh Tyagi](https://twitter.com/mr_harshtyagi)
[Yashasvi Chaudhary](https://twitter.com/0xyshv)

## Thanks

Feel free to contribute and add new features to the protocol :)
