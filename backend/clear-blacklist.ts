import { redisUtils } from "./src/config/redis";

async function clearBlacklist() {
  try {
    console.log("🧹 Clearing blacklisted tokens...");

    // Get all blacklist keys
    const blacklistKeys = await redisUtils.keys("blacklist:*");
    console.log(`Found ${blacklistKeys.length} blacklisted tokens`);

    if (blacklistKeys.length === 0) {
      console.log("✅ No blacklisted tokens found");
      return;
    }

    // Delete all blacklist keys
    const results = await Promise.all(
      blacklistKeys.map((key) => redisUtils.del(key))
    );

    const deletedCount = results.filter(Boolean).length;
    console.log(`🗑️ Cleared ${deletedCount} blacklisted tokens`);

    // Also clear any JWT validation caches
    const jwtKeys = await redisUtils.keys("jwt:*");
    if (jwtKeys.length > 0) {
      const jwtResults = await Promise.all(
        jwtKeys.map((key) => redisUtils.del(key))
      );
      const jwtDeletedCount = jwtResults.filter(Boolean).length;
      console.log(`🗑️ Cleared ${jwtDeletedCount} JWT validation caches`);
    }

    console.log("✅ Blacklist cleared successfully!");
    console.log("🔄 Now try logging in again to get a fresh token");
  } catch (error) {
    console.error("❌ Error clearing blacklist:", error);
  } finally {
    process.exit(0);
  }
}

clearBlacklist();
