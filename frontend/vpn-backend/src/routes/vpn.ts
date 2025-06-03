import express, { RequestHandler } from 'express';
import { protect, admin } from '../middleware/auth';
import {
  connectVpn,
  disconnectVpn,
  getVpnStatus,
  getServers,
  getServerStatus,
  addServer,
  updateServer,
  deleteServer,
  getSessionStats
} from '../controllers/vpnController';

const router = express.Router();

// User VPN routes
router.post('/connect', protect, connectVpn as RequestHandler);
router.post('/disconnect', protect, disconnectVpn as RequestHandler);
router.get('/status', protect, getVpnStatus as RequestHandler);
router.get('/servers', protect, getServers as RequestHandler);
router.get('/stats', protect, getSessionStats as RequestHandler);

// Admin VPN server management routes
router.get('/server/:id', protect, admin, getServerStatus as RequestHandler);
router.post('/server', protect, admin, addServer as RequestHandler);
router.put('/server/:id', protect, admin, updateServer as RequestHandler);
router.delete('/server/:id', protect, admin, deleteServer as RequestHandler);

export default router; 