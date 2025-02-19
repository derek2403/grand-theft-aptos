module GTA_Coins {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::account;
    use aptos_framework::vector;
    use aptos_framework::randomness;  // Import secure randomness

    struct CoinStorage has key {
        owner: address,
        total_supply: u64,
        balances: vector<(address, u64)>,
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
        let initial_balance: u64 = 100_000;
        let total_supply: u64 = 1_000_000;
        let signer_addr = signer::address_of(account);

        move_to(account, CoinStorage {
            owner,
            total_supply,
            balances: vector[
                (user1, initial_balance),
                (user2, initial_balance),
                (user3, initial_balance),
                (signer_addr, initial_balance)
            ],
            users: vector[user1, user2, user3, signer_addr],
        });
    }

    // Checks if an address is a registered user
    fun is_user(storage: &CoinStorage, user: address): bool {
        let users = &storage.users;
        let len = vector::length(users);
        let mut i = 0;
        
        while (i < len) {
            if (vector::borrow(users, i) == &user) {
                return true;
            }
            i = i + 1;
        }
        false
    }

    // Gets the balance of a user
    public fun get_balance(account: &signer, user: address): u64 acquires CoinStorage {
        let storage = borrow_global<CoinStorage>(signer::address_of(account));
        assert!(is_user(&storage, user), 0x1);
        
        let len = vector::length(&storage.balances);
        let mut i = 0;
        while (i < len) {
            let (addr, balance) = vector::borrow(&storage.balances, i);
            if (addr == &user) {
                return *balance;
            }
            i = i + 1;
        }
        0
    }

    // Securely and randomly adjusts balances of all users
    #[randomness]
    public entry fun random_adjust_balance(account: &signer) acquires CoinStorage {
        let storage = borrow_global_mut<CoinStorage>(signer::address_of(account));
        assert!(signer::address_of(account) == storage.owner, 0x1); // Only owner can trigger random adjustment

        let len = vector::length(&storage.balances);
        let mut i = 0;

        while (i < len) {
            let (addr, balance) = vector::borrow_mut(&storage.balances, i);
            
            // Secure random number in range [1, 10,000]
            let random_amount = randomness::u64_range(1, 10_000);

            // Secure random decision: increase (0) or decrease (1)
            let should_increase = randomness::u64_range(0, 2) == 0;

            if (should_increase) {
                // Increase balance
                *balance = *balance + random_amount;
                storage.total_supply = storage.total_supply + random_amount;
            } else {
                // Ensure we don't go negative
                if (*balance >= random_amount) {
                    *balance = *balance - random_amount;
                    storage.total_supply = storage.total_supply - random_amount;
                }
            }

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
        let signer_addr = signer::address_of(account);

        // Reset balances
        storage.balances = vector[
            (user1, initial_balance),
            (user2, initial_balance),
            (user3, initial_balance),
            (signer_addr, initial_balance)
        ];
        
        // Reset users
        storage.users = vector[user1, user2, user3, signer_addr];

        // Reset total supply
        storage.total_supply = total_supply;
    }
}
