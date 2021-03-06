// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class PairTokens extends ethereum.SmartContract {
  static bind(address: Address): PairTokens {
    return new PairTokens("PairTokens", address);
  }

  token0(): Address {
    let result = super.call("token0", "token0():(address)", []);

    return result[0].toAddress();
  }

  try_token0(): ethereum.CallResult<Address> {
    let result = super.tryCall("token0", "token0():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  token1(): Address {
    let result = super.call("token1", "token1():(address)", []);

    return result[0].toAddress();
  }

  try_token1(): ethereum.CallResult<Address> {
    let result = super.tryCall("token1", "token1():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }
}
