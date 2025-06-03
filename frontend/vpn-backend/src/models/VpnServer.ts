import mongoose, { Document, Schema } from 'mongoose';

export interface IVpnServer extends Document {
  serverId: string;
  serverName: string;
  country: string;
  city: string;
  ipAddress: string;
  port: number;
  isActive: boolean;
  protocol: 'openvpn' | 'wireguard';
  load: number;
  bandwidth: number;
  status: 'online' | 'offline' | 'maintenance';
  serverConfig: string;
}

const VpnServerSchema: Schema = new Schema(
  {
    serverId: {
      type: String,
      required: true,
      unique: true,
    },
    serverName: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    port: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    protocol: {
      type: String,
      enum: ['openvpn', 'wireguard'],
      default: 'openvpn',
    },
    load: {
      type: Number,
      default: 0,
    },
    bandwidth: {
      type: Number,
      default: 1000,
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'maintenance'],
      default: 'online',
    },
    serverConfig: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IVpnServer>('VpnServer', VpnServerSchema); 