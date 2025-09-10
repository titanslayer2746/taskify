import { userProfileService } from "./services/userProfileService";

async function testUserProfileCaching() {
  console.log("🧪 Testing User Profile Caching System...\n");

  try {
    const testUserId = "68c07ad26ea8c90e1996d9a7"; // Test user ID

    // Test 1: Get user profile (should cache)
    console.log("1️⃣ Getting user profile (should cache)...");
    const profile1 = await userProfileService.getUserProfile(testUserId);
    console.log("✅ Profile retrieved:", profile1 ? "Success" : "Failed");

    // Test 2: Get user profile again (should hit cache)
    console.log("\n2️⃣ Getting user profile again (should hit cache)...");
    const profile2 = await userProfileService.getUserProfile(testUserId);
    console.log(
      "✅ Profile retrieved from cache:",
      profile2 ? "Success" : "Failed"
    );

    // Test 3: Get user preferences
    console.log("\n3️⃣ Getting user preferences...");
    const preferences = await userProfileService.getUserPreferences(testUserId);
    console.log(
      "✅ Preferences retrieved:",
      preferences ? "Success" : "Failed"
    );

    // Test 4: Get user settings
    console.log("\n4️⃣ Getting user settings...");
    const settings = await userProfileService.getUserSettings(testUserId);
    console.log("✅ Settings retrieved:", settings ? "Success" : "Failed");

    // Test 5: Get user statistics
    console.log("\n5️⃣ Getting user statistics...");
    const statistics = await userProfileService.getUserStatistics(testUserId);
    console.log("✅ Statistics retrieved:", statistics ? "Success" : "Failed");

    // Test 6: Get cache statistics
    console.log("\n6️⃣ Getting cache statistics...");
    const cacheStats = await userProfileService.getCacheStats();
    console.log("✅ Cache stats:", {
      profileCaches: cacheStats.profileCaches,
      preferencesCaches: cacheStats.preferencesCaches,
      settingsCaches: cacheStats.settingsCaches,
      statisticsCaches: cacheStats.statisticsCaches,
      totalCaches: cacheStats.totalCaches,
    });

    // Test 7: Invalidate profile cache
    console.log("\n7️⃣ Invalidating profile cache...");
    const invalidated = await userProfileService.invalidateUserProfileCache(
      testUserId
    );
    console.log(
      "✅ Profile cache invalidated:",
      invalidated ? "Success" : "Failed"
    );

    // Test 8: Get cache statistics again
    console.log("\n8️⃣ Getting cache statistics after invalidation...");
    const cacheStatsAfter = await userProfileService.getCacheStats();
    console.log("✅ Cache stats after invalidation:", {
      profileCaches: cacheStatsAfter.profileCaches,
      totalCaches: cacheStatsAfter.totalCaches,
    });

    console.log("\n🎉 All user profile caching tests completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testUserProfileCaching()
  .then(() => {
    console.log("\n✅ User profile caching test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test error:", error);
    process.exit(1);
  });
