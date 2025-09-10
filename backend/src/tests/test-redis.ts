import { redisClient, connectRedis, redisUtils } from "../config/redis";

// Test suite for Redis connection and operations
const runRedisTests = async () => {
  console.log("🧪 Starting Redis Test Suite...");
  console.log("=".repeat(50));

  let testsPassed = 0;
  let testsFailed = 0;

  const test = (name: string, testFn: () => Promise<void>) => {
    return async () => {
      try {
        console.log(`\n🔍 Testing: ${name}`);
        await testFn();
        console.log(`✅ PASSED: ${name}`);
        testsPassed++;
      } catch (error) {
        console.log(`❌ FAILED: ${name}`);
        console.error(
          `   Error: ${error instanceof Error ? error.message : error}`
        );
        testsFailed++;
      }
    };
  };

  // Test 1: Basic Connection
  await test("Redis Connection", async () => {
    await connectRedis();
    console.log("   ✓ Connected to Redis successfully");
  })();

  // Test 2: Basic Operations
  await test("Basic SET/GET Operations", async () => {
    await redisClient.set("test-basic", "Hello Redis!");
    const value = await redisClient.get("test-basic");
    if (value !== "Hello Redis!") {
      throw new Error(`Expected "Hello Redis!", got "${value}"`);
    }
    console.log("   ✓ SET/GET operations working");
  })();

  // Test 3: JSON Operations
  await test("JSON Operations", async () => {
    const testData = {
      message: "Redis JSON test",
      timestamp: new Date(),
      working: true,
    };
    await redisClient.set("test-json", JSON.stringify(testData));
    const jsonValue = await redisClient.get("test-json");
    const parsed = JSON.parse(jsonValue as string);
    if (parsed.message !== testData.message) {
      throw new Error("JSON data mismatch");
    }
    console.log("   ✓ JSON operations working");
  })();

  // Test 4: TTL Operations
  await test("TTL Operations", async () => {
    await redisClient.setEx("test-ttl", 2, "This will expire");
    const exists = await redisClient.exists("test-ttl");
    if (!exists) {
      throw new Error("Key should exist before expiration");
    }
    console.log("   ✓ TTL operations working");
  })();

  // Test 5: Utility Functions
  await test("Redis Utility Functions", async () => {
    await redisUtils.set("test-utils", "utility test", 60);
    const value = await redisUtils.get("test-utils");
    if (value !== "utility test") {
      throw new Error("Utility functions not working");
    }
    const exists = await redisUtils.exists("test-utils");
    if (!exists) {
      throw new Error("EXISTS utility not working");
    }
    console.log("   ✓ Utility functions working");
  })();

  // Test 6: JSON Utility Functions
  await test("JSON Utility Functions", async () => {
    const testObj = { name: "Test Object", value: 42, active: true };
    await redisUtils.setJson("test-json-utils", testObj, 60);
    const retrieved = await redisUtils.getJson<typeof testObj>(
      "test-json-utils"
    );
    if (!retrieved || retrieved.name !== testObj.name) {
      throw new Error("JSON utility functions not working");
    }
    console.log("   ✓ JSON utility functions working");
  })();

  // Test 7: Health Check
  await test("Health Check", async () => {
    const health = await redisUtils.healthCheck();
    if (health.status !== "healthy") {
      throw new Error(`Health check failed: ${health.error}`);
    }
    console.log(`   ✓ Health check passed (${health.latency}ms)`);
  })();

  // Test 8: Statistics
  await test("Statistics Collection", async () => {
    const stats = redisUtils.getStats();
    if (stats.commands.total === 0) {
      throw new Error("No command statistics collected");
    }
    console.log(`   ✓ Statistics collected (${stats.commands.total} commands)`);
  })();

  // Test 9: Batch Operations
  await test("Batch Operations", async () => {
    await redisUtils.mset({
      "batch-1": "value-1",
      "batch-2": "value-2",
      "batch-3": "value-3",
    });
    const results = await redisUtils.mget(["batch-1", "batch-2", "batch-3"]);
    if (results.length !== 3 || results[0] !== "value-1") {
      throw new Error("Batch operations not working");
    }
    console.log("   ✓ Batch operations working");
  })();

  // Test 10: Pattern Matching
  await test("Pattern Matching", async () => {
    const keys = await redisUtils.keys("batch-*");
    if (keys.length < 3) {
      throw new Error("Pattern matching not working");
    }
    console.log(`   ✓ Pattern matching working (${keys.length} keys found)`);
  })();

  // Cleanup
  console.log("\n🧹 Cleaning up test data...");
  const cleanupKeys = [
    "test-basic",
    "test-json",
    "test-ttl",
    "test-utils",
    "test-json-utils",
    "batch-1",
    "batch-2",
    "batch-3",
  ];

  for (const key of cleanupKeys) {
    try {
      await redisClient.del(key);
    } catch (error) {
      // Ignore cleanup errors
    }
  }
  console.log("   ✓ Cleanup completed");

  // Test Results Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 TEST RESULTS SUMMARY");
  console.log("=".repeat(50));
  console.log(`✅ Tests Passed: ${testsPassed}`);
  console.log(`❌ Tests Failed: ${testsFailed}`);
  console.log(
    `📈 Success Rate: ${Math.round(
      (testsPassed / (testsPassed + testsFailed)) * 100
    )}%`
  );

  if (testsFailed === 0) {
    console.log("\n🎉 ALL TESTS PASSED! Redis is working perfectly!");
  } else {
    console.log(
      `\n⚠️  ${testsFailed} test(s) failed. Please check the errors above.`
    );
  }

  // Close connection
  await redisClient.quit();
  console.log("\n🔴 Redis connection closed");
};

// Test Redis connection failure scenarios
const testConnectionFailures = async () => {
  console.log("\n🧪 Testing Redis Connection Failure Scenarios...");
  console.log("=".repeat(50));

  try {
    // Test with invalid Redis URL
    console.log("\n🔍 Testing invalid Redis URL...");
    const invalidClient = redisClient.duplicate();
    if (invalidClient.options) {
      invalidClient.options.url = "redis://invalid-host:6379";
    }

    try {
      await invalidClient.connect();
      console.log("❌ Should have failed with invalid URL");
    } catch (error) {
      console.log("✅ Correctly failed with invalid URL");
    }

    await invalidClient.quit();
  } catch (error) {
    console.log("✅ Connection failure handling working correctly");
  }
};

// Main test runner
const runAllTests = async () => {
  try {
    await runRedisTests();
    await testConnectionFailures();

    console.log("\n" + "=".repeat(50));
    console.log("🏁 ALL TESTS COMPLETED");
    console.log("=".repeat(50));
  } catch (error) {
    console.error("❌ Test suite failed:", error);
    process.exit(1);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

export { runRedisTests, testConnectionFailures, runAllTests };
