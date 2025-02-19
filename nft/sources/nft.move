module nft4::nft4 {
    use std::error;
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_token::token::{Self, TokenDataId};
    use aptos_framework::timestamp;
    use aptos_std::table::{Self, Table};

    // Error codes
    const ENO_COLLECTION_MINTED: u64 = 1;
    const ECOLLECTION_ALREADY_MINTED: u64 = 2;
    const EMINT_LIMIT_REACHED: u64 = 3;
    const ENOT_AUTHORIZED: u64 = 4;

    // The fixed address that is authorized to create collections
    const CREATOR_ADDRESS: address = @0xee870cf134dfd104150cad571d58315e67a8e36a51a16369a369b2d51a045b98;

    struct CollectionInfo has key {
        name: String,
        description: String,
        uri: String,
        supply: u64,
        minted: u64,
        token_data_id: TokenDataId,
        minters: Table<address, u64>,
        mint_events: EventHandle<MintEvent>,
    }

    struct MintEvent has drop, store {
        minter: address,
        token_data_id: TokenDataId,
        token_name: String,
        timestamp: u64,
    }

    public entry fun create_collection(
        creator: &signer,
        name: String,
        description: String,
        uri: String,
        max_supply: u64,
    ) {
        let creator_addr = signer::address_of(creator);
        assert!(!exists<CollectionInfo>(creator_addr), error::already_exists(ECOLLECTION_ALREADY_MINTED));

        // Create the collection
        token::create_collection(
            creator,
            name,
            description,
            uri,
            max_supply,
            vector<bool>[false, false, false] // immutable collection
        );

        // Create the token data for the collection
        let token_data_id = token::create_tokendata(
            creator,
            name,
            string::utf8(b"NFT"), // token name
            description,
            max_supply,
            uri,
            creator_addr,
            100, // royalty denominator
            5,   // royalty numerator (5%)
            token::create_token_mutability_config(
                &vector<bool>[false, false, false, false, true]
            ),
            vector<String>[string::utf8(b"Type")],  // property keys
            vector<vector<u8>>[b"Image"],           // property values
            vector<String>[string::utf8(b"string")] // property types
        );

        move_to(creator, CollectionInfo {
            name,
            description,
            uri,
            supply: max_supply,
            minted: 0,
            token_data_id,
            minters: table::new(),
            mint_events: account::new_event_handle<MintEvent>(creator),
        });
    }

    public entry fun mint_nft(
        receiver: &signer,
        creator_addr: address,
    ) acquires CollectionInfo {
        // Get collection info from the creator's address
        let collection_info = borrow_global_mut<CollectionInfo>(creator_addr);
        
        // Check if we haven't reached the maximum supply
        assert!(collection_info.minted < collection_info.supply, error::invalid_argument(EMINT_LIMIT_REACHED));
        
        let receiver_addr = signer::address_of(receiver);

        // Initialize token store if it doesn't exist
        token::initialize_token_store(receiver);

        // Opt in to direct transfer
        token::opt_in_direct_transfer(receiver, true);

        // Mint token to the receiver
        token::mint_token(
            receiver,
            collection_info.token_data_id,
            1,
        );

        collection_info.minted = collection_info.minted + 1;

        // Track minter's count
        if (!table::contains(&collection_info.minters, receiver_addr)) {
            table::add(&mut collection_info.minters, receiver_addr, 1);
        } else {
            let minted = table::borrow_mut(&mut collection_info.minters, receiver_addr);
            *minted = *minted + 1;
        };

        // Emit mint event
        event::emit_event(&mut collection_info.mint_events, MintEvent {
            minter: receiver_addr,
            token_data_id: collection_info.token_data_id,
            token_name: string::utf8(b"NFT"),
            timestamp: timestamp::now_seconds(),
        });
    }

    #[view]
    public fun get_minted_count(creator_addr: address, minter: address): u64 acquires CollectionInfo {
        assert!(exists<CollectionInfo>(creator_addr), error::not_found(ENO_COLLECTION_MINTED));
        let collection_info = borrow_global<CollectionInfo>(creator_addr);
        if (table::contains(&collection_info.minters, minter)) {
            *table::borrow(&collection_info.minters, minter)
        } else {
            0
        }
    }
}



