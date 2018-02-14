/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Thursday, February 1, 2018 3:16 PM
 * @Email:  developer@xyfindables.com
 * @Filename: blockchain.js
 * @Last modified by:   arietrouw
 * @Last modified time: Wednesday, February 14, 2018 11:26 AM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

"use strict";

const CryptoJS = require("crypto-js"),
  BLOCKCHAIN = {};

class Block {
  constructor(index, previousHash, timestamp, data, hash) {
    this.index = index;
    this.previousHash = previousHash.toString();
    this.timestamp = timestamp;
    this.data = data;
    this.hash = hash.toString();
  }
}

BLOCKCHAIN.calculateHash = (index, previousHash, timestamp, data) => {
  return CryptoJS.SHA256(index + previousHash + timestamp + data).toString();
};

BLOCKCHAIN.getLatestBlock = () => {

};

BLOCKCHAIN.generateNextBlock = (blockData) => {
  let previousBlock = BLOCKCHAIN.getLatestBlock(),
    nextIndex = previousBlock.index + 1,
    nextTimestamp = new Date().getTime() / 1000,
    nextHash = BLOCKCHAIN.calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData);

  return new Block(nextIndex, previousBlock.hash, nextTimestamp, blockData, nextHash);
};

BLOCKCHAIN.getGenesisBlock = () => {
  return new Block(0, "0", 1465154705, "XYO Block", "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7");
};

BLOCKCHAIN.blockchain = [BLOCKCHAIN.getGenesisBlock()];

BLOCKCHAIN.isValidNewBlock = (newBlock, previousBlock) => {
  if (previousBlock.index + 1 !== newBlock.index) {
    // invalid index
    return false;
  } else if (previousBlock.hash !== newBlock.previousHash) {
    // invalid previoushash
    return false;
  } else if (BLOCKCHAIN.calculateHashForBlock(newBlock) !== newBlock.hash) {
    // debug('invalid hash: ' + calculateHashForBlock(newBlock) + ' ' + newBlock.hash);
    return false;
  }
  return true;
};

BLOCKCHAIN.replaceChain = (newBlocks) => {
  if (BLOCKCHAIN.isValidChain(newBlocks) && newBlocks.length > BLOCKCHAIN.blockchain.length) {
    // Received blockchain is valid. Replacing current blockchain with received blockchain
    BLOCKCHAIN.blockchain = newBlocks;
    // broadcast(responseLatestMsg());
  } else {
    // Received blockchain invalid
  }
};

BLOCKCHAIN.initHttpServer = () => {
  /* let app = express();

  app.use(bodyParser.json());

  app.get('/blocks', (req, res) => res.send(JSON.stringify(blockchain)));
  app.post('/mineBlock', (req, res) => {
    var newBlock = generateNextBlock(req.body.data);
    addBlock(newBlock);
    broadcast(responseLatestMsg());
    debug('block added: ' + JSON.stringify(newBlock));
    res.send();
  });
  app.get('/peers', (req, res) => {
    res.send(sockets.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
  });
  app.post('/addPeer', (req, res) => {
    connectToPeers([req.body.peer]);
    res.send();
  });
  app.listen(http_port, () => debug('Listening http on port: ' + http_port)); */
};
