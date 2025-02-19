module coins1::coins1 {
    use std::signer;
    use std::vector;
    use aptos_framework::randomness;  // Import secure randomness

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

    // Initializes the GTA_Coins token and distributes it among users
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

    // Private entry function that handles the randomness
    #[randomness]
    entry fun random_adjust_balance(account: &signer) acquires CoinStorage {
        let storage = borrow_global_mut<CoinStorage>(signer::address_of(account));
        assert!(signer::address_of(account) == storage.owner, 0x1); // Only owner can trigger random adjustment
        
        let len = vector::length(&storage.balances);
        let i = 0;
        
        while (i < len) {
            // Get mutable reference to the balance
            let balance = vector::borrow_mut(&mut storage.balances, i);
            
            // Secure random number in range [1, 10,000]
            let random_amount = randomness::u64_range(1, 10_000);

            // Secure random decision: increase (0) or decrease (1)
            let should_increase = randomness::u64_range(0, 2) == 0;

            if (should_increase) {
                // Increase balance
                balance.amount = balance.amount + random_amount;
                storage.total_supply = storage.total_supply + random_amount;
            } else {
                // Ensure we don't go negative
                if (balance.amount >= random_amount) {
                    balance.amount = balance.amount - random_amount;
                    storage.total_supply = storage.total_supply - random_amount;
                }
            };
            
            i = i + 1;
        }
    }

    // Resets the entire contract state (only owner can call)
    public entry fun reset_state(
        account: &signer,
        user1: address,
        user2: address,
        user3: address
    ) acquires CoinStorage {
        let storage = borrow_global_mut<CoinStorage>(signer::address_of(account));
        assert!(signer::address_of(account) == storage.owner, 0x1);

        let initial_balance: u64 = 100_000;
        let total_supply: u64 = 1_000_000;

        let user4 = signer::address_of(account); // 4th user is again the new signer

        // Reset balances
        storage.balances = vector[
            UserBalance { user: user1, amount: initial_balance },
            UserBalance { user: user2, amount: initial_balance },
            UserBalance { user: user3, amount: initial_balance },
            UserBalance { user: user4, amount: initial_balance }
        ];
        
        // Reset users
        storage.users = vector[user1, user2, user3, user4];

        // Reset total supply
        storage.total_supply = total_supply;
    }
}
