export interface RelayState {
  relay1: number; // 0 for OFF, 1 for ON
  relay2: number;
  relay3: number;
  relay4: number;
}

export interface SensorState {
  temperature: number;
  humidity: number;
}

export interface SmartHomeData {
  relay: RelayState;
  sensor: SensorState;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'voice';
}
