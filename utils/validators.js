const MAX_TRANSFER_AMOUNT = 100000; // Set your max transfer limit

const validators = {
  address: (addr) => /^0x[a-fA-F0-9]{64}$/.test(addr),
  amount: (amt) => {
    const numAmt = Number(amt);
    return !isNaN(numAmt) && numAmt > 0 && numAmt <= MAX_TRANSFER_AMOUNT;
  },
  privateKey: (key) => /^0x[a-fA-F0-9]{64}$/.test(key)
};

function validateTransactionInput(cmd) {
  const errors = [];
  
  if (cmd.action === 'transfer') {
    if (!validators.address(cmd.recipient)) {
      errors.push('Invalid recipient address');
    }
    if (!validators.amount(cmd.amount)) {
      errors.push(`Invalid amount: ${cmd.amount}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export { validators, validateTransactionInput }; 