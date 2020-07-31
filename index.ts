import { BigNumber } from 'bignumber.js'

class BlockExplorer {
  private readonly apiKey: String = 'M36UUW2KGN3PBCCW98SQFM9NFCE93JZ5J6';
  private readonly apiUrl: String = 'https://api.etherscan.io/api';
  private readonly request = require("request-promise");

  async init() {
    interface HashTable<T> {
      [key: string]: T;
    }

    let addresses: HashTable<BigNumber> = {};

    const blockCount: number = await this.getBlockCount();
    console.log(`Block count: ${JSON.stringify(blockCount)}`);

    let blocks: number = 10;
    while (blocks > 0) {
      var block = await this.getBlock(blockCount - blocks);
      block.transactions.forEach(tx => {
        const val = new BigNumber(parseInt(tx.value, 16));
        if (!addresses[tx.to]) {
          addresses[tx.to] = val;
        } else {
          addresses[tx.to] = val.plus(addresses[tx.to]);
        }
        if (!addresses[tx.from]) {
          addresses[tx.from] = val;
        } else {
          addresses[tx.from] = val.plus(addresses[tx.from]);
        }
      });
      blocks--;
    }

    let rich: BigNumber = new BigNumber(0);
    let richAddress: string = '';
    Object.keys(addresses).forEach(function (key) {
      let value = addresses[key];
      if (value.gt(rich)) {
        rich = value;
        richAddress = key;
      }
    });

    console.log('richest:', richAddress, 'volume:', rich.toString(10));
  }

  private async getBlockCount() {
    let blockTag: string = '';
    var options = {
      body: { jsonrpc: '2.0', method: '', params: [] },
      method: 'POST',
      url: `${this.apiUrl}?module=proxy&action=eth_blockNumber&apikey=${this.apiKey}`,
      headers:
      {
        'Content-Type': 'application/json'
      },
      json: true
    };

    await this.request(options, function (error, response, body) {
      if (error) throw new Error(error);
      blockTag = body.result;
    });

    return parseInt(blockTag, 16);
  }

  private async getBlock(blockNumber: number) {
    let block: any;
    var options = {
      body: { jsonrpc: '2.0', method: '', params: [] },
      method: 'POST',
      url: `${this.apiUrl}?module=proxy&action=eth_getBlockByNumber&tag=0x${blockNumber.toString(16)}&boolean=true&apikey=${this.apiKey}`,
      headers: { 'Content-Type': 'application/json' },
      json: true
    };

    await this.request(options, function (error, response, body) {
      if (error) throw new Error(error);
      block = body.result;
    });

    return block;
  }
}

new BlockExplorer().init();