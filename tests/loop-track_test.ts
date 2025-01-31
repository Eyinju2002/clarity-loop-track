import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Test recording activity and claiming rewards",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const user1 = accounts.get("wallet_1")!;
    
    let block = chain.mineBlock([
      Tx.contractCall(
        "fitness-tracker",
        "record-activity",
        [types.ascii("running"), types.uint(5000), types.uint(1800)],
        user1.address
      )
    ]);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 2);
    
    block = chain.mineBlock([
      Tx.contractCall(
        "fitness-tracker", 
        "claim-rewards",
        [types.uint(0)],
        user1.address
      )
    ]);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 3);
  },
});

Clarinet.test({
  name: "Test LOOP token transfers",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const user1 = accounts.get("wallet_1")!;
    const user2 = accounts.get("wallet_2")!;
    
    let block = chain.mineBlock([
      Tx.contractCall(
        "loop-token",
        "mint",
        [types.uint(1000), types.principal(user1.address)],
        deployer.address
      )
    ]);
    assertEquals(block.receipts.length, 1);
    
    block = chain.mineBlock([
      Tx.contractCall(
        "loop-token",
        "transfer",
        [types.uint(500), types.principal(user1.address), types.principal(user2.address)],
        user1.address
      )
    ]);
    assertEquals(block.receipts.length, 1);
  },
});
