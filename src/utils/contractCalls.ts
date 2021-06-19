import { Address, log, BigInt } from "@graphprotocol/graph-ts";
import { DelfyStakingPool } from "../../generated/DelfyStaking/DelfyStakingPool";
import { ERC20 } from "../../generated/DelfyStaking/ERC20";
import { NameSymbol } from "../../generated/DelfyStaking/NameSymbol";
import { Pair } from "../../generated/DelfyStaking/Pair";
import { PairTokens } from "../../generated/DelfyStaking/PairTokens";
import { UserInfo } from "../../generated/DelfyStaking/UserInfo";
import { ADDRESS_ZERO } from "./stakingUtils";

export function getTokenSymbol(address: Address): string {
  if (address == Address.fromHexString(ADDRESS_ZERO)) {
    return "BNB";
  } else {
    let erc20Symbol = ERC20.bind(address);
    let callResult = erc20Symbol.try_symbol();
    if (callResult.reverted) {
      log.error("ERC20 Symbol Errors", []);
      let NameSybol = NameSymbol.bind(address);
      let secondTry = NameSybol.try_symbol();
      if (secondTry.reverted) {
        return "ERROR";
      }
      return secondTry.value.toString();
    } else return callResult.value.toString();
  }
}

export function getTokenName(address: Address): string {
  if (address == Address.fromHexString(ADDRESS_ZERO)) {
    return "BINANCE COIN";
  } else {
    
    let erc20Name = ERC20.bind(address);
    let callResult = erc20Name.try_name();
    if (callResult.reverted) {
      log.error("ERC20 Name Errors", []);
      let NameSybol = NameSymbol.bind(address);
      let secondTry = NameSybol.try_name();
      if (secondTry.reverted) {
        return "ERROR";
      }
      return secondTry.value.toString();
    } else return callResult.value.toString();
  }
}

export function getUserInfo(address: Address,pid: Address, user: Address ):BigInt{
  let userInterface = DelfyStakingPool.bind(address)
  let callResult = userInterface.try_getUserPoolInfo(pid, user)
  if(callResult.reverted){
    let userInterface2 = UserInfo.bind(address)
    let userInfo = userInterface2.try_getUserPoolInfo(pid, user) 
    if(userInfo.reverted){
      log.error("UserInfo call Errors: ", [])
      return BigInt.fromI32(0)
    }
    let value = userInfo.value.value1
    return value
  } else return callResult.value.value1
}

export function getPairTokens(address: Address) : Address[]{
  let info = Pair.bind(address)
  let returnVal: Address[] = []
  let token0 = info.try_token0()
  if(token0.reverted){
    let info2 = PairTokens.bind(address)
    let token02 = info2.try_token0()
    if(token02.reverted){
      
      log.error("Token Pair Errors: ",[])
    }
    returnVal.push(token02.value)
    
  }
  returnVal.push(token0.value)
  let token1 = info.try_token1()
  if(token1.reverted){
    let info3 = PairTokens.bind(address)
    let token12 = info3.try_token1()
    if(token12.reverted){
      log.error("Token Pair Errors: ",[])
    }
    returnVal.push(token12.value)
  }
  returnVal.push(token1.value)
 
  return returnVal
}