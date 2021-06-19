import { BigInt, log } from "@graphprotocol/graph-ts";
import {
  AddPool,
  BlockReward,
  Claimed,
  Deposit,
  EmergencyWithdraw,
  Initialized,
  PoolAllocUpdated,
  UpdatePool,
  Withdraw,
} from "../generated/DelfyStaking/DelfyStakingPool";
import { Periphery, Pool, Token, User, UserPool } from "../generated/schema";
import { getPairTokens, getTokenName, getTokenSymbol, getUserInfo } from "./utils/contractCalls";
import { DEFAULT_NAME, DEFAULT_SYMBOL } from "./utils/stakingUtils";

export function handleInitialized(event: Initialized): void {
  let params = event.params;
  let peripheryId = event.address.toHexString();
  let periphery = new Periphery(peripheryId);
  let delfy = new Token(params.delfy.toHexString());
  let name = getTokenName(params.delfy);
  log.error("InitializedvError: ", []);
  let symbol = getTokenSymbol(params.delfy);
  log.error("InitializedvError 2: ", []);
  delfy.name = name;
  delfy.symbol = symbol;
  delfy.address = params.delfy;
  delfy.save();
  log.error("Error here: ", []);
  periphery.delfy = delfy.id;
  periphery.admin = event.transaction.from;
  periphery.globalStartBlock = params.startBlock;
  periphery.rewardPerBlock = params.rewardsPerblock;
  log.error("Herror here: ", []);
  periphery.totalAllocationPoints = BigInt.fromI32(0);
  periphery.save();
}

export function handleAddPool(event: AddPool): void {
  let params = event.params;
  let poolId = params.token.toHexString();
  let pool = new Pool(poolId);
  let token = new Token(params.token.toHexString());
  let name = getTokenName(params.token);
  let symbol = getTokenSymbol(params.token);
  if(name == DEFAULT_NAME && symbol == DEFAULT_SYMBOL){
  let pairTokens = getPairTokens(params.token)
  let halfName0 = getTokenName(pairTokens[0])
  let halfName1 = getTokenName(pairTokens[1])
  let halfSymbol0 = getTokenSymbol(pairTokens[0])
  let halfSymbol1 = getTokenSymbol(pairTokens[1])
  name = halfName0 +"_"+ halfName1
  symbol = halfSymbol0+"_"+halfSymbol1
  pool.type ="farm"
  }
else { pool.type = "pool"}
  token.name = name;
  token.symbol = symbol;
  token.address = params.token;
  token.save();
  pool.token = token.id;
  pool.poolSupply = BigInt.fromI32(0);
  pool.startBlock = event.block.number;
  pool.allocationPoints = params.allocationPoint;
  pool.lastRewardBlock = event.block.number
  pool.accruedShare = BigInt.fromI32(0)
  log.error("User deposit Error: ", []);
  pool.totalRewardsMinted = BigInt.fromI32(0);
  pool.save();
  let periphery = Periphery.load(event.address.toHexString());
  periphery.totalAllocationPoints = periphery.totalAllocationPoints.plus(
    params.allocationPoint,
  );
  periphery.save();
}

export function handleDeposit(event: Deposit): void {
  let params = event.params;
  // pool is already created and it's expected to exist
  let pool = Pool.load(params.pid.toHexString());
  // token is already created and it's expected to exist
  let token = Token.load(params.pid.toHexString());
  log.error("Deposit Error 1: ", []);
  let user = User.load(params.user.toHexString());
  if (user == null) {
    log.error("Gross Error: ", []);
    user = new User(params.user.toHexString());
    user.address = params.user;
    user.totalRewardsEarned = BigInt.fromI32(0);
    user.save();
  }
  let userPoolId =
    params.user.toHexString() + "-" + params.pid.toHexString();
  let userPool = UserPool.load(userPoolId);
  log.error("Pool Error 21: ", []);
  if (userPool == null) {
    userPool = new UserPool(userPoolId);
    userPool.totalAmountDeposited = BigInt.fromI32(0);
    userPool.pool = pool.id;
    log.error("Pool Error 22: ", []);
    userPool.user = user.id;
    log.error("Checking Errors: ", []);
  } 
  userPool.rewardDebt = getUserInfo(event.address, params.pid, params.user)
  log.error("Pool Error 23: ", []);
  userPool.lastWithdrawal = event.block.timestamp;
  userPool.lastClaim = event.block.timestamp;

  log.error("Pool Error 2: ", []);
  let _amount = userPool.totalAmountDeposited;
  log.error("fixed this error long ago: ", []);
  userPool.totalAmountDeposited = params.amount.plus(_amount);
  userPool.save();
  log.error("Deposit Error 3: ", []);
  pool.token = token.id;
  pool.poolSupply = pool.poolSupply.plus(params.amount);
  pool.save();
}

export function handleWithdraw(event: Withdraw): void {
  let params = event.params;
  let poolId = params.pid.toHexString();
  let pool = Pool.load(poolId);
  log.error("Withdrawal Error 1: ", []);
  let userPoolId = params.user
    .toHexString()
    .concat("-")
    .concat(params.pid.toHexString());
  let userPool = UserPool.load(userPoolId);
  log.error("Withdraw ERror: ", []);
  userPool.totalAmountDeposited = userPool.totalAmountDeposited.minus(params.amount);
  userPool.lastWithdrawal = event.block.timestamp;
  userPool.rewardDebt = getUserInfo(event.address, params.pid, params.user)

  userPool.save();
  log.error("Withdrawal Error 2: ", []);
  pool.poolSupply = pool.poolSupply.minus(params.amount);
  pool.save();
}

export function handleClaimed(event: Claimed): void {
  let params = event.params;
  let userId = params.user.toHexString();
  let user = User.load(userId);
  user.totalRewardsEarned = user.totalRewardsEarned.plus(params.amount);
  user.save();
  log.error("Claimed Error 1: ", []);
  let poolId = params.pid.toHexString();
  let pool = Pool.load(poolId);
  pool.totalRewardsMinted = pool.totalRewardsMinted.plus(params.amount);
  pool.save();
  log.error("Claimed Error 2: ", []);
  let userPoolId = userId.concat("-").concat(poolId);
  let userPool = UserPool.load(userPoolId);
  log.error("Claimed Error 3: ", []);
  userPool.lastClaim = event.block.timestamp;
  userPool.rewardDebt = getUserInfo(event.address, params.pid, params.user)
  userPool.save();
}

export function handlePoolAllocUpdated(event: PoolAllocUpdated): void {
  let params = event.params;
  let poolId = params.pool.toHexString();
  let pool = Pool.load(poolId);
  pool.allocationPoints = params.allocPoint;
  pool.save();
}

export function handleEmergencyWithdraw(event: EmergencyWithdraw): void {
  let params = event.params;
  let poolId = params.pid.toHexString();
  let userId = params.user.toHexString();
  let pool = Pool.load(poolId);
  pool.poolSupply = pool.poolSupply.minus(params.amount);
  pool.save();
  log.error("Emergency withdrawal: ", []);
  let userPool = UserPool.load(userId.concat("-").concat(poolId));
  userPool.lastWithdrawal = event.block.timestamp;
  userPool.totalAmountDeposited = BigInt.fromI32(0);
  userPool.rewardDebt = BigInt.fromI32(0)
  userPool.save();
}

export function handleBlockReward(event: BlockReward): void {
  let params = event.params;
  let peripheryId = event.address.toHexString();
  log.error("Block Rewards: ", []);
  let periphery = Periphery.load(peripheryId);
  periphery.rewardPerBlock = params.newReward;
  periphery.save();
}

export function handleUpdatePool(event: UpdatePool):void{
  let params = event.params
  let pool = Pool.load(params.poolId.toHexString())
  pool.accruedShare = params.accDelfyPerShare;
  pool.lastRewardBlock = event.block.number;
  pool.save()
}