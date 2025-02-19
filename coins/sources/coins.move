module coins4::coins4 {
    use std::signer;
    use std::vector;
    use aptos_framework::randomness;

    struct UserBalance has store, drop, copy {
        user: address,
        amount: u64
    }

    struct CoinStorage has key {
        owner: address,
        total_supply: u64,
        balances: vector<UserBalance>,
        users: vector<address>,
    }

    // Helper function to check if an address is a valid user
    fun is_user(storage: &CoinStorage, user: address): bool {
        let len = vector::length(&storage.users);
        let i = 0;
        while (i < len) {
            if (*vector::borrow(&storage.users, i) == user) {
                return true
            };
            i = i + 1;
        };
        false
    }

    // Initializes the Coins token and distributes it among users
    public entry fun initialize(
        account: &signer, 
        user1: address, 
        user2: address, 
        user3: address
    ) {
        let owner = signer::address_of(account);
        let user4 = owner; // The fourth user is the signer who starts the game

        let initial_balance: u64 = 100_000;
        let total_supply: u64 = 1_000_000;

        move_to(account, CoinStorage {
            owner,
            total_supply,
            balances: vector[
                UserBalance { user: user1, amount: initial_balance },
                UserBalance { user: user2, amount: initial_balance },
                UserBalance { user: user3, amount: initial_balance },
                UserBalance { user: user4, amount: initial_balance }
            ],
            users: vector[user1, user2, user3, user4],
        });
    }


    // Random adjustment of balances
    #[randomness]
    entry fun random_adjust_balance(account: &signer) acquires CoinStorage {
        let storage = borrow_global_mut<CoinStorage>(signer::address_of(account));
        assert!(signer::address_of(account) == storage.owner, 0x1); // Only owner can trigger random adjustment
        
        let len = vector::length(&storage.balances);
        let i = 0;
        
        while (i < len) {
            let balance = vector::borrow_mut(&mut storage.balances, i);
            
            // Secure random number in range [1, 10,000]
            let random_amount = randomness::u64_range(1, 10_000);

            // Secure random decision: increase (0) or decrease (1)
            let should_increase = randomness::u64_range(0, 2) == 0;

            if (should_increase) {
                balance.amount = balance.amount + random_amount;
                storage.total_supply = storage.total_supply + random_amount;
            } else {
                if (balance.amount >= random_amount) {
                    balance.amount = balance.amount - random_amount;
                    storage.total_supply = storage.total_supply - random_amount;
                }
            };
            
            i = i + 1;
        }
    }

    public entry fun transfer(
    account: &signer,
    from_address: address,
    to_address: address,
    amount: u64
) acquires CoinStorage {
    let signer_address = signer::address_of(account);
    let storage = borrow_global_mut<CoinStorage>(signer_address);
    
    // Verify signer is the owner
    assert!(signer_address == storage.owner, 0x1);
    
    // Verify both addresses are valid users
    assert!(is_user(storage, from_address), 0x4);
    assert!(is_user(storage, to_address), 0x5);
    assert!(from_address != to_address, 0x6);

    // Update sender's balance
    let i = 0;
    let found_sender = false;
    let len = vector::length(&storage.balances);
    
    while (i < len) {
        let balance = vector::borrow_mut(&mut storage.balances, i);
        if (balance.user == from_address) {
            assert!(balance.amount >= amount, 0x7);
            balance.amount = balance.amount - amount;
            found_sender = true;
            break;
        };
        i = i + 1;
    };
    assert!(found_sender, 0x8);

    // Update recipient's balance
    i = 0;
    let found_recipient = false;
    
    while (i < len) {
        let balance = vector::borrow_mut(&mut storage.balances, i);
        if (balance.user == to_address) {
            balance.amount = balance.amount + amount;
            found_recipient = true;
            break;
        };
        i = i + 1;
    };
    assert!(found_recipient, 0x9);
}

    // Resets the entire contract state (only owner can call)
    public entry fun reset_state(account: &signer) acquires CoinStorage {
        let storage = borrow_global_mut<CoinStorage>(signer::address_of(account));
        assert!(signer::address_of(account) == storage.owner, 0x1);

        let initial_balance: u64 = 100_000;
        let total_supply: u64 = 1_000_000;
        let len = vector::length(&storage.balances);
        let i = 0;

        while (i < len) {
            let balance = vector::borrow_mut(&mut storage.balances, i);
            balance.amount = initial_balance;
            i = i + 1;
        };

        storage.total_supply = total_supply;
    }
}