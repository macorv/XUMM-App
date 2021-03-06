const fetch = require('node-fetch');
const RippledWsClient = require('rippled-ws-client');
const AccountLib = require('xrpl-accountlib');

// generate family seed
const generateMnemonic = () => {
    const generatedAccount = AccountLib.generate.mnemonic();

    return generatedAccount.secret.mnemonic.split(' ');
};

// generate family seed
const generateFamilySeed = () => {
    const generatedAccount = AccountLib.generate.familySeed();

    return generatedAccount.secret.familySeed;
};

// generate secret numbers
const generateSecretNumbers = () => {
    const generatedAccount = AccountLib.generate.secretNumbers();

    const numbers = [...Array(8)].map(() => Array(6));
    for (let r = 0; r < 8; r++) {
        const row = generatedAccount.secret.secretNumbers[r].split('');
        for (let c = 0; c < 6; c++) {
            numbers[r][c] = row[c];
        }
    }
    return numbers;
};

// get funded testnet account
const generateTestnetAccount = async () => {
    const resp = await fetch('https://faucet.altnet.rippletest.net/accounts', { method: 'POST' });
    const json = await resp.json();

    return {
        address: json.account.address,
        secret: json.account.secret,
    };
};

// activate account by sending payment
const activateAccount = async (address) => {
    const fundedAccount = await generateTestnetAccount();

    // wait 10 sec
    const start = new Date().getTime();
    while (new Date().getTime() < start + 10000);

    const Transaction = {
        TransactionType: 'Payment',
        Account: fundedAccount.address,
        Destination: address,
        Amount: '100000000',
        Fee: '1000',
    };

    return new RippledWsClient('wss://s.altnet.rippletest.net:51233')
        .then(async (Connection) => {
            const accountInfo = await Connection.send({
                command: 'account_info',
                account: fundedAccount.address,
                ledger_index: 'validated',
                signer_lists: true,
            });

            Object.assign(Transaction, { Sequence: accountInfo.account_data.Sequence });

            const signedObject = AccountLib.sign(Transaction, AccountLib.derive.familySeed(fundedAccount.secret));

            Connection.send({
                command: 'submit',
                tx_blob: signedObject.signedTransaction,
            })
                .then(() => {
                    Connection.close();
                })
                .catch((SendError) => {
                    Connection.close();
                    console.error(SendError);
                });
        })
        .catch((ConnectionError) => {
            console.error(ConnectionError);
        });
};

module.exports = {
    activateAccount,
    generateTestnetAccount,
    generateSecretNumbers,
    generateFamilySeed,
    generateMnemonic,
};
