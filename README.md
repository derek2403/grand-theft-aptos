# GTA (Grand Theft Aptos)
**Grand Theft Aptos: Where AI-driven NPCs meet on-chain interactions in a fast, immersive open-world experience powered by Aptos Blockchain**

![Logo](public/logo.png)

An open-world, AI agent-driven playground that merges dynamic NPCs and real-world-like blockchain economics. Generate unique NPCs from real-world Twitter profiles, interact with them, and watch them live out their own stories with daily randomized on-chain events. Just log in, describe the NPC you want, and play with them on the Aptos blockchain!

1. Slides: https://www.canva.com/design/DAGfmUebClc/BekikP9GLokf61chNI8VOw

2. Video: https://drive.google.com/drive/folders/10BCjGpaMxnGyk5lWDPVbuN-chXbmFBDA?dmr=1&ec=wgc-drive-globalnav-goto

---

## Inspiration: How We Came Up with This Idea

The concept behind **Grand Theft Aptos (GTA)** sprouted from our fascination with blending immersive gameplay and blockchain technology. We wanted to push the boundaries of what’s possible in open-world games by introducing AI-driven NPCs that have unique personalities, can think for themselves, and interact meaningfully both with each other and with human players.

One major drawback we noticed while playing traditional GTA was that the NPCs are all hard-coded programs. They follow fixed routines, speak the same lines, and offer limited ways to interact. This becomes repetitive and predictable, reducing the sense of immersion over time.

We thought:

> *“What if we could make every single character a living, breathing personality with real-world attributes, while leveraging a high-performance blockchain for game economics and real-world randomness?”*

By merging **AI agents** and **Aptos** blockchain infrastructure, we’re able to create an entirely new gameplay paradigm. Imagine if instead of static, pre-programmed NPCs, you encountered living, evolving individuals that can transact, chat, sing, paint, and even invite you to real events. This dynamic shift transforms a standard GTA-like experience into a cutting-edge metaverse of possibilities.

---

## The Solution

**Grand Theft Aptos** tackles these issues by combining AI-driven NPCs with Aptos blockchain capabilities:

1. **AI-Driven NPC Creation**  
   We dynamically scrape a user’s publicly available Twitter data (e.g., personal interests, occupations, notable quotes) to create unique AI agent clones. This means every NPC can exhibit lifelike behaviors and dialogues, influenced by real-world personalities.

2. **Blockchain-Powered Economy**  
   Aptos serves as the backbone of our in-game currency and asset ownership. It’s lightning-fast, ensuring seamless transactions, and robust enough to handle complex interactions between numerous AI agents and players.

3. **On-Chain Randomness**  
   Each in-game day, we apply on-chain randomization to redistribute or modify the in-game currency and events. This simulates real-world unpredictability, ensuring no two playthroughs feel the same.

4. **Sponsored Transactions & Web2 Logins**  
   To reduce friction, we allow players to log in using Google or Apple accounts, and all gas fees are sponsored so that interacting with the blockchain happens seamlessly in the background.

5. **Dynamic Interactions**  
   Our solution enables dynamic interactions within the game. For example, in our demo, players can engage with AI-driven NPCs like IU (K-pop singer), Da Vinci (artist), or Phil (EasyA hackathon organizer) to access various actions—buying NFTs, experiencing personalized performances, or even recruiting participants for real-world-style events.

---

## How Our Project Works

1. **User Login**
   - Sign in with Google/Apple for quick access via Aptos Login.
   - All gas fees are sponsored, ensuring a seamless experience.

2. **Twitter Handle Scrape**
   - User enters a Twitter handle in the game.
   - The AI system scrapes the user’s public data (tweets, profile info, etc.).

3. **NPC Generation & AI Agent Creation**
   - Our AI engine analyzes the scraped data to craft an NPC with matching personality traits, occupation, and communication style.
   - The AI-driven NPC is then spawned into the open world.

4. **In-Game Interactions**
   - Real-time conversations with NPCs are powered by large language models.
   - NPCs mimic real-world speech patterns or interests, creating a dynamic experience.

5. **On-Chain Transactions**
   - Buy Da Vinci’s NFT artwork or tip IU for a performance—all transactions flow through Aptos.
   - Speedy, secure payments are recorded on-chain, with gas fees sponsored.

6. **Daily Summaries & Random Events**
   - At the end of each in-game day, notable actions are summarized.
   - On-chain randomness alters NPC and player balances, emulating real-world unpredictability.

7. **Continual Evolution**
   - As the real-world user’s Twitter updates, the AI NPC evolves.
   - This ensures a constantly refreshing world where no two days are ever the same.

---

## Architecture & Tech Stack

![Agents](#)

### Tech Stack Overview

- **Blender**  
  Used for building and rendering our 3D open-world environment, providing immersive visuals and real-time interaction.

- **GPT-4o-min & DALL·E**  
  Core AI modules for generating rich NPC dialogues and creative in-game assets (e.g., artwork, item textures).  
  - **GPT-4o-min**: Handles natural language processing and dialogue.  
  - **DALL·E**: Produces on-demand imagery for in-game assets.

- **Twitter Scraper**  
  A custom toolset that pulls public data (tweets, profile info) from Twitter, feeding it into our AI pipeline to shape each NPC’s personality and background.

- **Next.js**  
  A React-based web framework that powers our front-end interface—providing a seamless gateway to the game, user dashboards, and any supporting UIs.

- **HeroUI**  
  Creates a smooth and engaging user interface, leveraging pre-built responsive design components.

- **Aptos Blockchain**  
  Deployed Move-based smart contracts that facilitate in-game transactions, NFT minting, and random event triggers. Its speed and security enable frictionless on-chain actions.

---

### Architectural Diagram

![Architectural Diagram](#)

*(A high-level illustration showcasing the interaction between the user interface, AI agent generation, Aptos blockchain for transactions, and on-chain random events.)*

---

## How We Use Aptos

1. **In-Game Currency**  
   The game’s economy is powered by Aptos smart contracts, ensuring secure and seamless transactions. The smart contract for the in-game currency can be found at `/coins`.

2. **NFT Minting**  
   All in-game assets and NFTs are minted on the Aptos blockchain, enabling true ownership and verifiable scarcity. The smart contract for NFTs is located at `/nft`.

3. **On-Chain Randomness**  
   We leverage Aptos’s built-in randomization functions to simulate real-world economic fluctuations—some NPCs gain wealth while others lose it, adding constant unpredictability.

4. **Sponsored Transaction**  
   Aptos lowers entry barriers for players unfamiliar with crypto by enabling gas-free transactions. This eliminates the need for manual wallet setups, making it ideal for mass adoption in gaming.

5. **Aptos Connect**  
   Players can easily create a wallet by logging in with Google or Apple, significantly lowering the entry barrier for new users.

6. **High Throughput & Fast Finality**  
   Aptos ensures rapid transaction processing and near-instant finality—crucial for real-time gameplay interactions and a smooth gaming experience. The seamless integration is so fluid that users don’t even realize they’re interacting with a blockchain.

---

## Future Implementations

1. **Cross-Game Interoperability**  
   Explore bridging NFTs and items to other Aptos-based games or metaverses, enabling shared assets across ecosystems.

2. **Player-Created Content**  
   Introduce tools that let users craft missions or storylines that revolve around specific AI NPCs, weaving user-generated narratives into the main world.

3. **GTA 7 Vision**  
   Evolve the platform into a next-generation open-world experience—essentially becoming the “GTA 7” of blockchain gaming, with fully AI-driven NPCs, expansive user creativity, and seamless on-chain interactions.

4. **Bigger, Expanding Map**  
   Grow the game world into a vast, ever-expanding environment, with new cities, biomes, and interactive zones unlocking over time. This allows for more exploration, player-driven economies, and emergent gameplay.

---

*Thank you for checking out Grand Theft Aptos! Feel free to contribute, open issues, or provide feedback. We’re excited to keep expanding this project and shaping the future of AI-driven, blockchain-powered gaming.*
