# Habitty Backend

## CORS Configuration

This backend is configured with environment-specific CORS settings to allow secure communication between frontend and backend.

### Environment Setup

1. **Copy the environment example file:**

   ```bash
   cp env.example .env
   ```

2. **Configure your environment variables:**

   ```bash
   # Development
   NODE_ENV=development
   CORS_ORIGIN_DEV=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173

   # Production
   NODE_ENV=production
   CORS_ORIGIN_PROD=https://your-frontend-domain.com
   ```

### CORS Configuration Details

#### Development Environment

- **Allowed Origins**: `http://localhost:5173`, `http://localhost:3000`, `http://127.0.0.1:5173`
- **Credentials**: Enabled
- **Methods**: GET, POST, PUT, PATCH, DELETE, OPTIONS
- **Headers**: Content-Type, Authorization, X-Requested-With, Accept, Origin

#### Production Environment

- **Allowed Origins**: Configured via `CORS_ORIGIN_PROD` environment variable
- **Credentials**: Enabled
- **Methods**: GET, POST, PUT, PATCH, DELETE, OPTIONS
- **Headers**: Content-Type, Authorization, X-Requested-With, Accept, Origin

### Adding New Origins

To add new allowed origins:

1. **Development**: Add to `CORS_ORIGIN_DEV` environment variable (comma-separated)
2. **Production**: Add to `CORS_ORIGIN_PROD` environment variable (comma-separated)

### Security Features

- **Origin Validation**: Only specified origins are allowed
- **Credentials Support**: Cookies and authorization headers are supported
- **Method Restrictions**: Only necessary HTTP methods are allowed
- **Header Restrictions**: Only required headers are allowed
- **Error Handling**: Detailed CORS error messages for debugging

### Testing CORS

You can test CORS configuration using curl:

```bash
# Test from allowed origin
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type,Authorization" \
     -X OPTIONS \
     http://localhost:3001/api/health

# Test from disallowed origin
curl -H "Origin: http://malicious-site.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type,Authorization" \
     -X OPTIONS \
     http://localhost:3001/api/health
```

### Troubleshooting

If you encounter CORS errors:

1. Check that your frontend origin is in the allowed origins list
2. Verify the environment variables are set correctly
3. Ensure the backend is running with the correct environment
4. Check the browser console for detailed error messages

## Email (SendGrid) Configuration

1. Set the following environment variables (see `env.example`):

   ```bash
   SENDGRID_API_KEY=your-sendgrid-api-key
   SENDGRID_FROM="Taskify <no-reply@yourdomain.com>"
   ```

2. Ensure your SendGrid sender identity/domain is verified for the `SENDGRID_FROM` address.

3. The backend uses SendGrid to send OTP and password reset emails via `src/services/emailService.ts`.