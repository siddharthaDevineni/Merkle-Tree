const { keccak256 } = require("ethereum-cryptography/keccak");
const { bytesToHex } = require("ethereum-cryptography/utils");

class MerkleTree {
  constructor(leaves) {
    this.leaves = leaves.map(Buffer.from).map(keccak256);
    this.concat = (left, right) => keccak256(Buffer.concat([left, right]));
  }

  getRoot() {
    return bytesToHex(this._getRoot(this.leaves));
  }

  getProof(index, layer = this.leaves, proof = []) {
    if (layer.length == 1) {
      return proof;
    }
    if (index % 2 == 0 && layer[index + 1]) {
      proof.push({
        data: bytesToHex(layer[index + 1]),
        left: false,
      });
    } else if (index % 2 != 0 && layer[index - 1]) {
      proof.push({
        data: bytesToHex(layer[index - 1]),
        left: true,
      });
    }
    let layer1 = [];
    let ind = 0;
    while (ind < layer.length) {
      if (!layer[ind + 1]) {
        layer1.push(layer[ind]);
      } else {
        layer1.push(this.concat(layer[ind], layer[ind + 1]));
      }
      ind += 2;
    }
    return this.getProof(Math.floor(index / 2), layer1, proof);
  }

  // private function
  // in next iteration layer become layer1
  _getRoot(layer = this.leaves) {
    if (layer.length == 1) {
      return layer[0];
    }
    let index = 0;
    let layer1 = [];
    while (index < layer.length) {
      const left = layer[index];
      const right = layer[index + 1];

      if (!right) {
        layer1.push(left);
      } else {
        layer1.push(this.concat(left, right));
      }
      index += 2;
    }
    return this._getRoot(layer1);
  }
}

module.exports = MerkleTree;
