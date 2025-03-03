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
    
    // Test valid activity recording
    let block = chain.mineBlock([
      Tx.contractCall(
        "fitness-tracker",
        "record-activity",
        [types.ascii("running"), types.uint(5000), types.uint(1800)],
        user1.address
      )
    ]);
    assertEquals(block.receipts[0].result, '(ok u0)');
    
    // Test invalid input
    block = chain.mineBlock([
      Tx.contractCall(
        "fitness-tracker",
        "record-activity", 
        [types.ascii("running"), types.uint(0), types.uint(1800)],
        user1.address
      )
    ]);
    assertEquals(block.receipts[0].result, '(err u101)');
    
    // Test invalid activity type length
    block = chain.mineBlock([
      Tx.contractCall(
        "fitness-tracker",
        "record-activity",
        [types.ascii("this-is-a-very-long-activity-type-that-should-fail"), types.uint(5000), types.uint(1800)],
        user1.address
      )
    ]);
    assertEquals(block.receipts[0].result, '(err u102)');
    
    // Test reward claiming
    block = chain.mineBlock([
      Tx.contractCall(
        "fitness-tracker", 
        "claim-rewards",
        [types.uint(0)],
        user1.address
      )
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
  },
});

Clarinet.test({
  name: "Test LOOP token transfers and supply management",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const user1 = accounts.get("wallet_1")!;
    const user2 = accounts.get("wallet_2")!;
    
    // Test minting
    let block = chain.mineBlock([
      Tx.contractCall(
        "loop-token",
        "mint",
        [types.uint(1000), types.principal(user1.address)],
        deployer.address
      )
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
    
    // Verify balance after mint
    block = chain.mineBlock([
      Tx.contractCall(
        "loop-token",
        "get-balance",
        [types.principal(user1.address)],
        user1.address
      )
    ]);
    assertEquals(block.receipts[0].result, '(ok u1000)');
    
    // Test transfer
    block = chain.mineBlock([
      Tx.contractCall(
        "loop-token",
        "transfer",
        [types.uint(500), types.principal(user1.address), types.principal(user2.address)],
        user1.address
      )
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
    
    // Verify balances after transfer
    block = chain.mineBlock([
      Tx.contractCall(
        "loop-token",
        "get-balance",
        [types.principal(user1.address)],
        user1.address
      )
    ]);
    assertEquals(block.receipts[0].result, '(ok u500)');
  },
});
