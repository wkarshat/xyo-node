/**
 * @Author: XY | The Findables Company <arietrouw>
 * @Date:   Friday, February 2, 2018 12:17 PM
 * @Email:  developer@xyfindables.com
 * @Filename: Diviner.js
 * @Last modified by:   arietrouw
 * @Last modified time: Tuesday, February 27, 2018 7:24 PM
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

"use strict";

const debug = require("debug")("Diviner"),
  Node = require("./Node.js"),
  HTTP = require("http"),
  Web3 = require("web3"),
  SOLC = require("solc"),
  format = require("string-format");

class Diviner extends Node {

  constructor(moniker, host, ports, config) {
    debug("constructor: ");
    process.title = "XYO-Diviner";
    super(moniker, host, ports, config);
    this.archivists = [];
    this.pendingQueries = [];
    this.completedQueries = [];
    this.web3 = null;
    this.blockHeadersSubscription = null;
    if (config && config.ethAddress) {
      this.connectToEthereum(config.ethAddress);
    }
  }

  connectToEthereum(address) {
    debug("connectToEthereum: ", address);
    this.web3 = new Web3(new Web3.providers.HttpProvider(address));

    debug("connectToEthereum[coinbase]: ", this.web3.eth.coinbase);

    let source, filter = this.web3.eth.filter('latest');

    filter.watch((error, result) => {
      if (error) {
        debug("Error: ", error);
      } else {
        debug("Watch: ", result);
      }
    });

    source = "" +
      "contract test {\n" +
      "   function multiply(uint a) returns(uint d) {\n" +
      "       return a * 7;\n" +
      "   }\n" +
      "}\n";

    this.sendSolidityQuery(source);
  }

  compileSolidity(source) {
    let input = {
        'source.sol': source
      },

      findImports = (path) => {
        if (path === 'source.sol') {
          return {
            contents: source
          };
        } else {
          return {
            error: 'File not found'
          };
        }
      },

      output = SOLC.compile({
        sources: input
      }, 1, findImports);

    return output.contracts['source.sol:test'];

  }

  sendSolidityQuery(source) {
    let compiled = this.compileSolidity(source),
      abi = JSON.parse(compiled.interface),
      contract = this.web3.eth.contract(abi),
      contractInstance = contract.new({
        data: '0x' + compiled.bytecode,
        from: this.web3.eth.coinbase,
        gas: 90000 * 2
      }, (err, res) => {
        if (err) {
          debug("Error:", err);
          return;
        }

        // Log the tx, you can explore status with eth.getTransaction()
        debug("TransactionHash: ", res.transactionHash);

        // If we have an address property, the contract was deployed
        if (res.address) {
          debug('Contract address: ', res.address);
        }
      });
  }

  query(question, callback) {
    debug("query");
    this.findBlocks(question, (blocks) => {
      this.processBlocks(question, blocks, (answer) => {
        callback({
          "success": (answer.accuracy >= question.accuracy && answer.certainty >= question.certainty),
          "question": question,
          "answer": answer,
          "blocks": blocks
        });
      });
    });
  }

  get(req, res) {
    debug("get");
    let contentType = req.headers['content-type'],
      pathParts = req.path.split("/");

    if (contentType && pathParts.length > 1) {
      let action = pathParts[1];

      switch (contentType) {
        case 'application/json':
          switch (action) {
            case "pending":
              return this.returnJSONPending(req, res);
            default:
              return super.get(req, res);
          }
        default:
          return super.get(req, res);
      }
    }
    return super.get(req, res);
  }

  post(req, res) {
    debug('post');
    let contentType = req.headers['content-type'],
      pathParts = req.path.split("/");

    if (contentType) {
      let action = pathParts[1];

      switch (contentType) {
        case 'application/json':
          switch (action) {
            case "query":
              return this.postQuery(req, res);
            default:
              break;
          }
          break;
        default:
          break;
      }
    }
    return super.post(req, res);
  }

  postQuery(req, res) {
    return res.status(200).send(req.path);
  }

  processBlocks(question, blocks, callback) {
    debug("processBlocks");
    callback(null, {});
  }

  findBlocks(pk, epoch, callback) {
    debug("findBlocks");
    let count = this.archivist.length,
      blocks = [];

    this.archivists.forEach((archivist) => {
      this.getBlock(pk, epoch, archivist, (err, block) => {
        if (!err) {
          blocks.push(JSON.parse(block));
        }
        count--;
        if (count === 0) {
          callback(blocks);
        }
      });
    });
  }

  getBlock(pk, epoch, url, callback) {
    debug("getBlock");
    HTTP.get(url + format("/?key={}&epoch={}", pk, epoch), (resp) => {
      let data = "";

      resp.on("data", (chunk) => {
        data += chunk;
      });

      resp.on("end", () => {
        callback(null, data);
      });

    }).on("error", (err) => {
      callback(err, null);
    });
  }

  getPending() {
    return {
      queries: [{
        target: "xxxxx",
        bounty: 1
      }, {
        target: "yyyyy",
        bounty: 1
      }]
    };
  }

  findPeers(diviners) {
    debug("findPeers");
    let key;

    for (key in diviners) {
      let diviner = diviners[key];

      if (!(diviner.ports.pipe === this.ports.pipe && diviner.host === this.host)) {
        this.addPeer(
          diviner.host,
          diviner.ports.pipe
        );
      }
    }
  }

  findArchivists(archivists) {
    debug("findArchivists");
    let key;

    for (key in archivists) {
      let archivist = archivists[key];

      if (!(archivist.ports.pipe === this.ports.pipe && archivist.host === this.host)) {
        this.addArchivist(
          archivist.host,
          archivist.ports.pipe
        );
      }
    }
  }

  addArchivist(host, ports) {
    debug("addArchivist");
    if (!(this.host === host && this.ports.pipe === ports.pipe)) {
      this.archivists.push({
        host: host,
        port: ports.pipe
      });
    }
  }

  update(config) {
    debug("update");
    super.update(config);
    if (this.archivists.length === 0) {
      this.findArchivists(config.archivists);
      this.findPeers(config.diviners);
    }
  }

  status() {
    let status = super.status();

    status.type = "Diviner";
    status.archivists = this.archivists.length;
    return status;
  }

  returnJSONPending(req, res) {
    debug('returnJSONPending');
    res.status(200).send(JSON.stringify(this.getPending()));
  }
}

module.exports = Diviner;
