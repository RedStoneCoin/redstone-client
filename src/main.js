const { getElementById } = require('domutils');
const Redstone = require('redstonecrypto-js');
function generateWallet() {
    const wallet = Redstone.generateWallet();
    return wallet;
}
function importWallet(privateKey) {
    const wallet = Redstone.import_private_key(privateKey);
    const address = Redstone.pubkey_to_address(wallet.pub);
    if (wallet.priv == null || wallet.priv == null) {
        console.log('Invalid private key');
        return null;
    }
    return {
        address: address,
        privateKey: wallet.priv,
        publicKey: wallet.pub
    };
}

function saveWallet(privateKey,address,publicKey,password) {    
    const crypto = require('crypto'); 
    const cipher = crypto.createCipher('aes-256-cbc', password);
    const Store = require('electron-store');
    const store = new Store();  
    // pik to string
    privateKey = privateKey.toString();
    console.log(privateKey);
    let encrypted = cipher.update(privateKey,'utf8','hex');
    store.set('address',address);
    store.set('publicKey',publicKey);
    encrypted += cipher.final('hex');
    store.set('privateKey',encrypted);
    console.log(encrypted);
}
function loadWallet(password) {
    const crypto = require('crypto'); 
    const decipher = crypto.createDecipher('aes-256-cbc', password);
    const Store = require('electron-store');
    const store = new Store();  
    try {
    let decrypted = decipher.update(store.get('privateKey'),'hex','utf8');
    decrypted += decipher.final('utf8');
    return {
        address:store.get('address'),
        privateKey:decrypted,
        publicKey:store.get('publicKey')
    }
    } catch (e) {
        alert('Invalid password');
        return null;
    }
}
function isThereWallet() {
    const Store = require('electron-store');
    const store = new Store();  
    if (store.get('privateKey') != null) {
        return true;
    }
    return false;
}
function deleteWallet() {
    const Store = require('electron-store');
    const store = new Store();  
    store.delete('privateKey');
    store.delete('address');
    store.delete('publicKey');
}

function tempSaveWallet(address,privateKey,publicKey) {
    const Store = require('electron-store');
    const store = new Store();  
    store.set('taddress',address);
    store.set('tpublicKey',publicKey);
    store.set('tprivateKey',privateKey);
}
function tempLoadWallet() {
    const Store = require('electron-store');
    const store = new Store();  
    // get then return them and delete them
    const address = store.get('taddress');
    const privateKey = store.get('tprivateKey');
    const publicKey = store.get('tpublicKey');
    store.delete('taddress');
    store.delete('tprivateKey');
    store.delete('tpublicKey');
    return {
        address:address,
        privateKey:privateKey,
        publicKey:publicKey
    }
}

function set_node_ip(ip) {
    const Store = require('electron-store');
    const store = new Store();  
    store.set('node_ip',ip);
}

function get_node_ip() {
    const Store = require('electron-store');
    const store = new Store();  
    return store.get('node_ip');
}

// when we send a transaction, save it.
// when balance checker detects new balance, save it
function set_transaction(type,amount,address) {
    const Store = require('electron-store');
    const store = new Store();  
    // save it to json array
    let transactions = store.get('transactions-' + address);
    if (transactions == null) {
        transactions = [];
    }
    let date = new Date();
    let time = date.getTime();

    // type is either 'send' or 'receive'
    transactions.push({
        type:type,
        amount:amount,
        time:time
    });
    store.set('transactions-' + address,transactions);
}
function get_transactions(address) {
    const Store = require('electron-store');
    const store = new Store();  
    let ret = store.get('transactions-' + address);
    if (ret == null) {
        ret = null;
    }
    return ret;
}
function delete_transactions(address,index) {
    const Store = require('electron-store');
    const store = new Store();  
    let transactions = store.get('transactions-' + address);
    transactions.splice(index,1);
    store.set('transactions-' + address,transactions);
}
// last step is  to send the transaction to the api
// Redstone.send =
//        send: function(
//    url,
//    sender,
//    reciver,
//    amount,
//    payload,
//    nonce,
//    privateKey
//)
function send_transaction(address,amount,publicKey,privateKey) {
    const Store = require('electron-store');
    const store = new Store();  
    let node_ip = store.get('node_ip');
    let nonce = 0;
    let payload = '';
    let url = 'http://' + node_ip + '/json_api/submit_txn';
    let tx = Redstone.send(node_ip,address,publicKey,amount,'',nonce,privateKey);
    return tx;
}