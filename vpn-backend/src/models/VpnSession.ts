import mongoose, { Document, Schema } from 'mongoose';

export interface IVpnSession extends Document {
  userId: mongoose.Types.ObjectId;
  serverId: string;
  serverLocation: string;
  startTime: Date;
  endTime: Date | null;
  bytesUploaded: number;
  bytesDownloaded: number;
  connectionStatus: 'connected' | 'disconnected' | 'failed';
  ipAddress: string;
}

const VpnSessionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    serverId: {
      type: String,
      required: true,
    },
    serverLocation: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    bytesUploaded: {
      type: Number,
      default: 0,
    },
    bytesDownloaded: {
      type: Number,
      default: 0,
    },
    connectionStatus: {
      type: String,
      enum: ['connected', 'disconnected', 'failed'],
      default: 'connected',
    },
    ipAddress: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IVpnSession>('VpnSession', VpnSessionSchema); 