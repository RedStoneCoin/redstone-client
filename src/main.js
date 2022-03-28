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
    let decrypted = decipher.update(store.get('privateKey'),'hex','utf8');
    decrypted += decipher.final('utf8');
    return {
        address:store.get('address'),
        privateKey:decrypted,
        publicKey:store.get('publicKey')
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
