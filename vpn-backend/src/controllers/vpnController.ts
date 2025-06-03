import { Request, Response } from 'express';
import VpnServer from '../models/VpnServer';
import VpnSession from '../models/VpnSession';

// @desc    Connect to VPN
// @route   POST /api/vpn/connect
// @access  Private
export const connectVpn = async (req: Request, res: Response) => {
  try {
    const { serverId } = req.body;

    // Validate server exists
    const server = await VpnServer.findOne({ serverId, isActive: true });
    if (!server) {
      return res.status(404).json({ message: 'Server not found or inactive' });
    }

    // Check if user has an active session
    const activeSession = await VpnSession.findOne({
      userId: req.user._id,
      endTime: null,
    });

    if (activeSession) {
      return res.status(400).json({
        message: 'You have an active connection. Disconnect first.',
      });
    }

    // Create a new VPN session
    const vpnSession = await VpnSession.create({
      userId: req.user._id,
      serverId: server.serverId,
      serverLocation: `${server.city}, ${server.country}`,
      startTime: new Date(),
      ipAddress: req.ip || '0.0.0.0', // Getting client IP
      connectionStatus: 'connected',
    });

    res.status(201).json({
      message: 'Connected successfully',
      sessionId: vpnSession._id,
      server: {
        name: server.serverName,
        location: `${server.city}, ${server.country}`,
        ip: server.ipAddress,
      },
      config: server.serverConfig,
    });
  } catch (error) {
    console.error('VPN connection error:', error);
    res.status(500).json({ message: 'Server error during VPN connection' });
  }
};

// @desc    Disconnect from VPN
// @route   POST /api/vpn/disconnect
// @access  Private
export const disconnectVpn = async (req: Request, res: Response) => {
  try {
    const activeSession = await VpnSession.findOne({
      userId: req.user._id,
      endTime: null,
    });

    if (!activeSession) {
      return res.status(400).json({ message: 'No active VPN connection found' });
    }

    // Update session with end time and stats
    activeSession.endTime = new Date();
    activeSession.connectionStatus = 'disconnected';
    // In a real application, you would get actual stats
    activeSession.bytesUploaded = req.body.bytesUploaded || activeSession.bytesUploaded;
    activeSession.bytesDownloaded = req.body.bytesDownloaded || activeSession.bytesDownloaded;

    await activeSession.save();

    res.json({
      message: 'Disconnected successfully',
      sessionId: activeSession._id,
      duration: Math.floor(
        (new Date().getTime() - activeSession.startTime.getTime()) / 1000
      ),
    });
  } catch (error) {
    console.error('VPN disconnection error:', error);
    res.status(500).json({ message: 'Server error during VPN disconnection' });
  }
};

// @desc    Get VPN connection status
// @route   GET /api/vpn/status
// @access  Private
export const getVpnStatus = async (req: Request, res: Response) => {
  try {
    const activeSession = await VpnSession.findOne({
      userId: req.user._id,
      endTime: null,
    }).populate('userId', 'username');

    if (!activeSession) {
      return res.json({
        connected: false,
        message: 'Not connected to VPN',
      });
    }

    // Find server info
    const server = await VpnServer.findOne({ serverId: activeSession.serverId });

    res.json({
      connected: true,
      sessionId: activeSession._id,
      server: server ? {
        name: server.serverName,
        location: `${server.city}, ${server.country}`,
        ip: server.ipAddress,
      } : { name: 'Unknown', location: activeSession.serverLocation },
      startTime: activeSession.startTime,
      duration: Math.floor(
        (new Date().getTime() - activeSession.startTime.getTime()) / 1000
      ),
      bytesUploaded: activeSession.bytesUploaded,
      bytesDownloaded: activeSession.bytesDownloaded,
    });
  } catch (error) {
    console.error('VPN status error:', error);
    res.status(500).json({ message: 'Server error fetching VPN status' });
  }
};

// @desc    Get all VPN servers
// @route   GET /api/vpn/servers
// @access  Private
export const getServers = async (req: Request, res: Response) => {
  try {
    const servers = await VpnServer.find({ isActive: true }).select(
      '-serverConfig'
    );
    res.json(servers);
  } catch (error) {
    console.error('Get servers error:', error);
    res.status(500).json({ message: 'Server error fetching servers' });
  }
};

// @desc    Get VPN server status
// @route   GET /api/vpn/server/:id
// @access  Private/Admin
export const getServerStatus = async (req: Request, res: Response) => {
  try {
    const server = await VpnServer.findOne({ serverId: req.params.id });

    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }

    // Get active sessions count
    const activeSessions = await VpnSession.countDocuments({
      serverId: server.serverId,
      endTime: null,
    });

    res.json({
      ...server.toObject(),
      activeSessions,
    });
  } catch (error) {
    console.error('Server status error:', error);
    res.status(500).json({ message: 'Server error fetching server status' });
  }
};

// @desc    Add a new VPN server
// @route   POST /api/vpn/server
// @access  Private/Admin
export const addServer = async (req: Request, res: Response) => {
  try {
    const {
      serverId,
      serverName,
      country,
      city,
      ipAddress,
      port,
      protocol,
      serverConfig,
    } = req.body;

    const serverExists = await VpnServer.findOne({ serverId });
    if (serverExists) {
      return res.status(400).json({
        message: 'Server with that ID already exists',
      });
    }

    const server = await VpnServer.create({
      serverId,
      serverName,
      country,
      city,
      ipAddress,
      port,
      protocol: protocol || 'openvpn',
      serverConfig,
    });

    res.status(201).json(server);
  } catch (error) {
    console.error('Add server error:', error);
    res.status(500).json({ message: 'Server error adding VPN server' });
  }
};

// @desc    Update a VPN server
// @route   PUT /api/vpn/server/:id
// @access  Private/Admin
export const updateServer = async (req: Request, res: Response) => {
  try {
    const server = await VpnServer.findOne({ serverId: req.params.id });

    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }

    const {
      serverName,
      country,
      city,
      ipAddress,
      port,
      isActive,
      protocol,
      load,
      bandwidth,
      status,
      serverConfig,
    } = req.body;

    if (serverName) server.serverName = serverName;
    if (country) server.country = country;
    if (city) server.city = city;
    if (ipAddress) server.ipAddress = ipAddress;
    if (port) server.port = port;
    if (isActive !== undefined) server.isActive = isActive;
    if (protocol) server.protocol = protocol;
    if (load !== undefined) server.load = load;
    if (bandwidth) server.bandwidth = bandwidth;
    if (status) server.status = status;
    if (serverConfig) server.serverConfig = serverConfig;

    const updatedServer = await server.save();
    res.json(updatedServer);
  } catch (error) {
    console.error('Update server error:', error);
    res.status(500).json({ message: 'Server error updating VPN server' });
  }
};

// @desc    Delete a VPN server
// @route   DELETE /api/vpn/server/:id
// @access  Private/Admin
export const deleteServer = async (req: Request, res: Response) => {
  try {
    const server = await VpnServer.findOne({ serverId: req.params.id });

    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }

    // Check for active sessions
    const activeSessionsCount = await VpnSession.countDocuments({
      serverId: server.serverId,
      endTime: null,
    });

    if (activeSessionsCount > 0) {
      return res.status(400).json({
        message: `Cannot delete server with ${activeSessionsCount} active connections`,
      });
    }

    await VpnServer.deleteOne({ _id: server._id });
    res.json({ message: 'Server removed' });
  } catch (error) {
    console.error('Delete server error:', error);
    res.status(500).json({ message: 'Server error deleting VPN server' });
  }
};

// @desc    Get user's VPN session statistics
// @route   GET /api/vpn/stats
// @access  Private
export const getSessionStats = async (req: Request, res: Response) => {
  try {
    // Get sessions in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sessions = await VpnSession.find({
      userId: req.user._id,
      startTime: { $gte: thirtyDaysAgo },
    }).sort({ startTime: -1 });

    // Calculate total stats
    const totalStats = sessions.reduce(
      (acc, session) => {
        acc.totalSessions += 1;
        
        // Calculate duration only for completed sessions
        if (session.endTime) {
          const durationMs = session.endTime.getTime() - session.startTime.getTime();
          acc.totalDuration += Math.floor(durationMs / 1000); // in seconds
        }
        
        acc.totalBytesUploaded += session.bytesUploaded;
        acc.totalBytesDownloaded += session.bytesDownloaded;
        return acc;
      },
      {
        totalSessions: 0,
        totalDuration: 0,
        totalBytesUploaded: 0,
        totalBytesDownloaded: 0,
      }
    );

    res.json({
      sessions: sessions.map(s => ({
        id: s._id,
        serverId: s.serverId,
        serverLocation: s.serverLocation,
        startTime: s.startTime,
        endTime: s.endTime,
        duration: s.endTime 
          ? Math.floor((s.endTime.getTime() - s.startTime.getTime()) / 1000)
          : null,
        bytesUploaded: s.bytesUploaded,
        bytesDownloaded: s.bytesDownloaded,
        status: s.connectionStatus,
      })),
      stats: {
        ...totalStats,
        averageDuration: totalStats.totalSessions > 0 
          ? Math.floor(totalStats.totalDuration / totalStats.totalSessions)
          : 0,
      },
    });
  } catch (error) {
    console.error('Session stats error:', error);
    res.status(500).json({ message: 'Server error fetching session statistics' });
  }
}; 