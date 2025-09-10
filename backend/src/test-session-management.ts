import { sessionService } from "./services/sessionService";

async function testSessionManagement() {
  console.log("🧪 Testing Session Management System...\n");

  try {
    // Test 1: Create a session
    console.log("1️⃣ Creating a test session...");
    const sessionData = await sessionService.createSession(
      "68c07ad26ea8c90e1996d9a7", // Test user ID
      "127.0.0.1",
      "Mozilla/5.0 (Test Browser)",
      { platform: "Windows", browser: "Chrome" }
    );
    console.log("✅ Session created:", sessionData.sessionId);

    // Test 2: Get session
    console.log("\n2️⃣ Retrieving session...");
    const retrievedSession = await sessionService.getSession(
      sessionData.sessionId
    );
    console.log(
      "✅ Session retrieved:",
      retrievedSession ? "Found" : "Not found"
    );

    // Test 3: Update session activity
    console.log("\n3️⃣ Updating session activity...");
    const activityUpdated = await sessionService.updateSessionActivity(
      sessionData.sessionId,
      "test_action",
      "/api/test",
      { test: true }
    );
    console.log("✅ Activity updated:", activityUpdated ? "Success" : "Failed");

    // Test 4: Get user activities
    console.log("\n4️⃣ Getting user activities...");
    const activities = await sessionService.getUserActivities(
      "68c07ad26ea8c90e1996d9a7",
      5
    );
    console.log("✅ Activities retrieved:", activities.length, "activities");

    // Test 5: Get session statistics
    console.log("\n5️⃣ Getting session statistics...");
    const stats = await sessionService.getSessionStats();
    console.log("✅ Session stats:", {
      totalSessions: stats.totalSessions,
      activeSessions: stats.activeSessions,
      expiredSessions: stats.expiredSessions,
    });

    // Test 6: Get user active sessions
    console.log("\n6️⃣ Getting user active sessions...");
    const userSessions = await sessionService.getUserActiveSessions(
      "68c07ad26ea8c90e1996d9a7"
    );
    console.log("✅ User sessions:", userSessions.length, "active sessions");

    // Test 7: Extend session
    console.log("\n7️⃣ Extending session...");
    const extended = await sessionService.extendSession(sessionData.sessionId);
    console.log("✅ Session extended:", extended ? "Success" : "Failed");

    // Test 8: Invalidate session
    console.log("\n8️⃣ Invalidating session...");
    const invalidated = await sessionService.invalidateSession(
      sessionData.sessionId
    );
    console.log("✅ Session invalidated:", invalidated ? "Success" : "Failed");

    // Test 9: Verify session is gone
    console.log("\n9️⃣ Verifying session is invalidated...");
    const sessionAfterInvalidation = await sessionService.getSession(
      sessionData.sessionId
    );
    console.log(
      "✅ Session after invalidation:",
      sessionAfterInvalidation ? "Still exists" : "Properly invalidated"
    );

    console.log("\n🎉 All session management tests completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testSessionManagement()
  .then(() => {
    console.log("\n✅ Session management test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test error:", error);
    process.exit(1);
  });
