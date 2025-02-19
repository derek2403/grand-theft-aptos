module nft5::nft5 {
    use std::error;
    use std::signer;
    use std::string::{Self, String};
    use aptos_framework::account;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_token::token::{Self, TokenDataId};
    use aptos_framework::timestamp;
    use aptos_std::table::{Self, Table};

    // Error codes
    const ENO_COLLECTION_MINTED: u64 = 1;
    const EMINT_LIMIT_REACHED: u64 = 3;
    const ENOT_AUTHORIZED: u64 = 4;
    const ENO_ACTIVE_COLLECTION: u64 = 5;

    struct CollectionInfo has store, drop {
        name: String,
        description: String,
        uri: String,
        supply: u64,
        minted: u64,
        token_data_id: TokenDataId,
    }

    struct UserCollections has key {
        collections: Table<String, CollectionInfo>,
        latest_collection: String,
        mint_events: EventHandle<MintEvent>,
        minters: Table<address, Table<String, u64>>, // Track mints per collection per user
    }

    struct MintEvent has drop, store {
        minter: address,
        collection_name: String,
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
    ) acquires UserCollections {
        let creator_addr = signer::address_of(creator);
        
        // Initialize UserCollections if it doesn't exist
        if (!exists<UserCollections>(creator_addr)) {
            move_to(creator, UserCollections {
                collections: table::new(),
                latest_collection: name,
                mint_events: account::new_event_handle<MintEvent>(creator),
                minters: table::new(),
            });
        };

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

        let collection_info = CollectionInfo {
            name,
            description,
            uri,
            supply: max_supply,
            minted: 0,
            token_data_id,
        };

        let user_collections = borrow_global_mut<UserCollections>(creator_addr);
        if (table::contains(&user_collections.collections, name)) {
            table::remove(&mut user_collections.collections, name);
        };
        table::add(&mut user_collections.collections, name, collection_info);
        user_collections.latest_collection = name;
    }

    public entry fun mint_nft(
        receiver: &signer,
        creator_addr: address,
    ) acquires UserCollections {
        let user_collections = borrow_global_mut<UserCollections>(creator_addr);
        let latest_collection_name = user_collections.latest_collection;
        
        assert!(table::contains(&user_collections.collections, latest_collection_name), 
            error::not_found(ENO_ACTIVE_COLLECTION));
        
        let collection_info = table::borrow_mut(&mut user_collections.collections, latest_collection_name);
        
        // Check if we haven't reached the maximum supply
        assert!(collection_info.minted < collection_info.supply, 
            error::invalid_argument(EMINT_LIMIT_REACHED));
        
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
        if (!table::contains(&user_collections.minters, receiver_addr)) {
            table::add(&mut user_collections.minters, receiver_addr, table::new());
        };
        
        let minter_collections = table::borrow_mut(&mut user_collections.minters, receiver_addr);
        if (!table::contains(minter_collections, latest_collection_name)) {
            table::add(minter_collections, latest_collection_name, 1);
        } else {
            let count = table::borrow_mut(minter_collections, latest_collection_name);
            *count = *count + 1;
        };

        // Emit mint event
        event::emit_event(&mut user_collections.mint_events, MintEvent {
            minter: receiver_addr,
            collection_name: latest_collection_name,
            token_data_id: collection_info.token_data_id,
            token_name: string::utf8(b"NFT"),
            timestamp: timestamp::now_seconds(),
        });
    }

    #[view]
    public fun get_minted_count(creator_addr: address, collection_name: String, minter: address): u64 acquires UserCollections {
        assert!(exists<UserCollections>(creator_addr), error::not_found(ENO_COLLECTION_MINTED));
        let user_collections = borrow_global<UserCollections>(creator_addr);
        assert!(table::contains(&user_collections.collections, collection_name), 
            error::not_found(ENO_ACTIVE_COLLECTION));
            
        if (!table::contains(&user_collections.minters, minter)) {
            return 0
        };
        
        let minter_collections = table::borrow(&user_collections.minters, minter);
        if (!table::contains(minter_collections, collection_name)) {
            0
        } else {
            *table::borrow(minter_collections, collection_name)
        }
    }

    #[view]
    public fun get_latest_collection_name(creator_addr: address): String acquires UserCollections {
        assert!(exists<UserCollections>(creator_addr), error::not_found(ENO_COLLECTION_MINTED));
        let user_collections = borrow_global<UserCollections>(creator_addr);
        user_collections.latest_collection
    }
}



