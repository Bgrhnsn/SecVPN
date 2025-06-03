# VPN Backend Service

A backend service for managing VPN connections, user authentication, and server management.

## Features

- User authentication with JWT
- VPN connection management
- Server monitoring and management
- Session statistics and reporting
- Admin dashboard for user and server management

## Tech Stack

- Node.js with Express
- TypeScript for type safety
- MongoDB with Mongoose for data storage
- JWT for authentication
- OpenVPN for VPN implementation

## Setup

1. Clone the repository
2. Install dependencies
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Start the development server
   ```
   npm run dev
   ```

## Project Structure

```
vpn-backend/
├── src/
│   ├── config/       # Configuration files
│   ├── controllers/  # Request handlers
│   ├── middleware/   # Express middleware
│   ├── models/       # Mongoose models
│   ├── routes/       # Express routes
│   ├── index.ts      # Entry point
├── vpn-configs/      # OpenVPN configuration files
├── .env              # Environment variables
├── tsconfig.json     # TypeScript configuration
└── package.json      # Project dependencies
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in and get token
- `GET /api/auth/profile` - Get user profile

### User Management

- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (Admin only)
- `DELETE /api/users/:id` - Delete a user (Admin only)

### VPN

- `GET /api/vpn/servers` - Get all VPN servers
- `POST /api/vpn/connect` - Connect to a VPN server
- `POST /api/vpn/disconnect` - Disconnect from VPN
- `GET /api/vpn/status` - Get current VPN connection status
- `GET /api/vpn/stats` - Get VPN usage statistics

### VPN Server Management (Admin only)

- `GET /api/vpn/server/:id` - Get server status
- `POST /api/vpn/server` - Add a new server
- `PUT /api/vpn/server/:id` - Update a server
- `DELETE /api/vpn/server/:id` - Delete a server

## License

This project is licensed under the MIT License. 