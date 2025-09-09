# Redis Setup Documentation

## Overview

This document provides comprehensive instructions for setting up and testing Redis in the Habitty application.

## Prerequisites

- Node.js (v16 or higher)
- Redis server (v6 or higher)
- WSL (Windows Subsystem for Linux) for Windows users

## Installation

### 1. Redis Server Installation

#### Option A: Using WSL (Recommended for Windows)

```bash
# Update package list
sudo apt update

# Install Redis server
sudo apt install redis-server

# Start Redis service
sudo service redis-server start

# Test Redis installation
redis-cli ping
# Expected output: PONG
```

#### Option B: Using Docker

```bash
# Pull and run Redis container
docker run -d --name redis-server -p 6379:6379 redis:latest

# Test Redis connection
docker exec -it redis-server redis-cli ping
# Expected output: PONG
```

#### Option C: Native Installation (Windows)

1. Download Redis for Windows from: https://github.com/microsoftarchive/redis/releases
2. Extract and run `redis-server.exe`
3. Test with `redis-cli.exe ping`

### 2. Node.js Redis Client Installation

```bash
# Navigate to backend directory
cd backend

# Install Redis client packages
npm install redis @types/redis
```

## Configuration

### 1. Environment Variables

Create a `.env` file in the backend directory:

```env
# Redis Configuration
REDIS_URL=redis://localhost:6379

# Other environment variables...
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/habittty
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 2. Redis Configuration File

The Redis configuration is located in `src/config/redis.ts` and includes:

- Connection settings with automatic reconnection
- Error handling and logging
- Performance monitoring
- Utility functions for common operations

## Testing

### 1. Basic Connection Test

```bash
# Run the comprehensive test suite
npx ts-node src/test-redis.ts
```

### 2. Manual Testing

```bash
# Test Redis CLI directly
redis-cli ping

# Test with data
redis-cli set test "Hello Redis"
redis-cli get test
redis-cli del test
```

### 3. Health Check Endpoints

Once your server is running, you can test Redis health via HTTP:

```bash
# Basic health check
curl http://localhost:3001/api/health

# Redis-specific health check
curl http://localhost:3001/api/health/redis

# Redis monitoring statistics
curl http://localhost:3001/api/monitoring/redis
```

## Test Suite Coverage

The Redis test suite (`src/test-redis.ts`) covers:

### ✅ Connection Tests

- Basic Redis connection
- Connection failure scenarios
- Reconnection handling

### ✅ Operation Tests

- SET/GET operations
- JSON data handling
- TTL (Time To Live) operations
- EXISTS checks
- DELETE operations

### ✅ Utility Function Tests

- Redis utility functions
- JSON utility functions
- Batch operations (MSET/MGET)
- Pattern matching (KEYS)

### ✅ Monitoring Tests

- Health check functionality
- Statistics collection
- Performance metrics
- Error tracking

### ✅ Failure Scenario Tests

- Invalid Redis URL handling
- Connection timeout scenarios
- Error recovery mechanisms

## Expected Test Results

### Successful Test Output

```
🧪 Starting Redis Test Suite...
==================================================

🔍 Testing: Redis Connection
   ✓ Connected to Redis successfully
✅ PASSED: Redis Connection

🔍 Testing: Basic SET/GET Operations
   ✓ SET/GET operations working
✅ PASSED: Basic SET/GET Operations

... (additional tests)

==================================================
📊 TEST RESULTS SUMMARY
==================================================
✅ Tests Passed: 10
❌ Tests Failed: 0
📈 Success Rate: 100%

🎉 ALL TESTS PASSED! Redis is working perfectly!
```

## Troubleshooting

### Common Issues

#### 1. Connection Refused

```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution**: Ensure Redis server is running

```bash
# Check if Redis is running
sudo service redis-server status

# Start Redis if not running
sudo service redis-server start
```

#### 2. Permission Denied

```
Error: Permission denied
```

**Solution**: Check Redis server permissions

```bash
# Check Redis configuration
sudo nano /etc/redis/redis.conf

# Ensure bind-address is correct
bind 127.0.0.1
```

#### 3. Port Already in Use

```
Error: Port 6379 is already in use
```

**Solution**: Find and stop conflicting processes

```bash
# Find process using port 6379
sudo lsof -i :6379

# Kill the process
sudo kill -9 <PID>
```

#### 4. WSL Redis Not Accessible

```
Error: Redis connection failed
```

**Solution**: Ensure WSL Redis is accessible from Windows

```bash
# In WSL, check Redis is bound to all interfaces
sudo nano /etc/redis/redis.conf
# Change: bind 127.0.0.1
# To: bind 0.0.0.0

# Restart Redis
sudo service redis-server restart
```

### Performance Issues

#### High Latency

- Check Redis server resources
- Monitor memory usage
- Consider Redis configuration optimization

#### Connection Timeouts

- Increase connection timeout in Redis config
- Check network connectivity
- Verify Redis server performance

## Monitoring and Maintenance

### 1. Health Monitoring

- Use `/api/health/redis` endpoint for health checks
- Monitor `/api/monitoring/redis` for performance metrics
- Set up alerts for connection failures

### 2. Performance Monitoring

- Track command latency via monitoring endpoint
- Monitor success rates and error rates
- Review Redis server logs regularly

### 3. Maintenance Tasks

- Regular Redis server updates
- Monitor memory usage and cleanup
- Backup Redis data if persistence is enabled

## Production Considerations

### 1. Security

- Use authentication (AUTH command)
- Bind to specific interfaces
- Use SSL/TLS for encrypted connections
- Implement firewall rules

### 2. Performance

- Configure appropriate memory limits
- Set up Redis clustering for high availability
- Use Redis Sentinel for failover
- Monitor and optimize slow queries

### 3. Backup and Recovery

- Enable Redis persistence (RDB/AOF)
- Set up regular backups
- Test recovery procedures
- Document disaster recovery plans

## Support and Resources

### Documentation

- [Redis Official Documentation](https://redis.io/documentation)
- [Node.js Redis Client](https://github.com/redis/node-redis)
- [Redis Commands Reference](https://redis.io/commands)

### Community

- [Redis Community Forum](https://forum.redis.io/)
- [Stack Overflow Redis Tag](https://stackoverflow.com/questions/tagged/redis)

### Monitoring Tools

- RedisInsight (Redis GUI)
- Redis Commander (Web-based admin)
- Prometheus + Grafana for monitoring

---

**Last Updated**: September 2024
**Version**: 1.0.0
**Maintainer**: Habitty Development Team
