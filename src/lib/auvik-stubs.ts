/**
 * Auvik API Simulation Stubs
 * In production, these would call the Auvik REST API to pull network device data.
 * For demo purposes, returns realistic sample data with simulated delay.
 */

import type { Firewall, NetworkSwitch, GenericAsset, AssetType } from "@/types/environment";

export interface AuvikDevice {
  id: string;
  deviceName: string;
  deviceType: "firewall" | "switch" | "access_point" | "router" | "ups" | "other";
  make: string;
  model: string;
  serialNumber: string;
  firmwareVersion: string;
  ipAddress: string;
  macAddress: string;
  lastSeen: string;
  online: boolean;
  site: string;
  // Firewall-specific
  wanIp?: string;
  lanSubnets?: string;
  hasVpn?: boolean;
  // Switch-specific
  portCount?: number;
  poeCapable?: boolean;
  isManaged?: boolean;
  vlanConfig?: string;
}

export interface AuvikImportResult {
  firewalls: Omit<Firewall, "id" | "clientId">[];
  switches: Omit<NetworkSwitch, "id" | "clientId">[];
  assets: Omit<GenericAsset, "id" | "clientId">[];
  totalDevices: number;
  importedAt: string;
}

// Demo data representing a realistic SMB client network environment
const DEMO_AUVIK_DEVICES: AuvikDevice[] = [
  {
    id: "auvik-fw-001",
    deviceName: "FW-MAIN-01",
    deviceType: "firewall",
    make: "Fortinet",
    model: "FortiGate 60F",
    serialNumber: "FGT60FTK22345678",
    firmwareVersion: "7.4.3",
    ipAddress: "192.168.1.1",
    macAddress: "00:09:0F:AA:BB:01",
    lastSeen: new Date().toISOString(),
    online: true,
    site: "Main Office",
    wanIp: "203.0.113.45",
    lanSubnets: "192.168.1.0/24, 192.168.10.0/24, 192.168.20.0/24",
    hasVpn: true,
  },
  {
    id: "auvik-fw-002",
    deviceName: "FW-BRANCH-01",
    deviceType: "firewall",
    make: "Fortinet",
    model: "FortiGate 40F",
    serialNumber: "FGT40FTK22987654",
    firmwareVersion: "7.4.2",
    ipAddress: "10.10.1.1",
    macAddress: "00:09:0F:CC:DD:02",
    lastSeen: new Date().toISOString(),
    online: true,
    site: "Branch Office",
    wanIp: "198.51.100.22",
    lanSubnets: "10.10.1.0/24",
    hasVpn: true,
  },
  {
    id: "auvik-sw-001",
    deviceName: "SW-CORE-01",
    deviceType: "switch",
    make: "Cisco",
    model: "Catalyst 9200L-48P",
    serialNumber: "FCW2345G0AB",
    firmwareVersion: "17.9.4",
    ipAddress: "192.168.1.2",
    macAddress: "00:1A:2B:CC:DD:01",
    lastSeen: new Date().toISOString(),
    online: true,
    site: "Main Office - Server Room",
    portCount: 48,
    poeCapable: true,
    isManaged: true,
    vlanConfig: "VLAN 1: Default, VLAN 10: Servers, VLAN 20: Workstations, VLAN 30: Guest",
  },
  {
    id: "auvik-sw-002",
    deviceName: "SW-ACCESS-01",
    deviceType: "switch",
    make: "Cisco",
    model: "Catalyst 9200L-24P",
    serialNumber: "FCW2345G0CD",
    firmwareVersion: "17.9.4",
    ipAddress: "192.168.1.3",
    macAddress: "00:1A:2B:CC:DD:02",
    lastSeen: new Date().toISOString(),
    online: true,
    site: "Main Office - Floor 1",
    portCount: 24,
    poeCapable: true,
    isManaged: true,
    vlanConfig: "VLAN 20: Workstations, VLAN 30: Guest",
  },
  {
    id: "auvik-sw-003",
    deviceName: "SW-BRANCH-01",
    deviceType: "switch",
    make: "Ubiquiti",
    model: "USW-24-PoE",
    serialNumber: "F09FC2A12345",
    firmwareVersion: "6.6.61",
    ipAddress: "10.10.1.2",
    macAddress: "78:8A:20:AA:BB:01",
    lastSeen: new Date().toISOString(),
    online: true,
    site: "Branch Office",
    portCount: 24,
    poeCapable: true,
    isManaged: true,
    vlanConfig: "VLAN 1: Default, VLAN 10: LAN",
  },
  {
    id: "auvik-ap-001",
    deviceName: "AP-MAIN-01",
    deviceType: "access_point",
    make: "Ubiquiti",
    model: "U6-Pro",
    serialNumber: "F09FC2B67890",
    firmwareVersion: "6.6.55",
    ipAddress: "192.168.1.50",
    macAddress: "78:8A:20:CC:DD:01",
    lastSeen: new Date().toISOString(),
    online: true,
    site: "Main Office - Floor 1",
  },
  {
    id: "auvik-ap-002",
    deviceName: "AP-MAIN-02",
    deviceType: "access_point",
    make: "Ubiquiti",
    model: "U6-Pro",
    serialNumber: "F09FC2B67891",
    firmwareVersion: "6.6.55",
    ipAddress: "192.168.1.51",
    macAddress: "78:8A:20:CC:DD:02",
    lastSeen: new Date().toISOString(),
    online: true,
    site: "Main Office - Floor 2",
  },
  {
    id: "auvik-ap-003",
    deviceName: "AP-BRANCH-01",
    deviceType: "access_point",
    make: "Ubiquiti",
    model: "U6-Lite",
    serialNumber: "F09FC2B67892",
    firmwareVersion: "6.6.55",
    ipAddress: "10.10.1.50",
    macAddress: "78:8A:20:CC:DD:03",
    lastSeen: new Date().toISOString(),
    online: true,
    site: "Branch Office",
  },
  {
    id: "auvik-ups-001",
    deviceName: "UPS-SERVER-01",
    deviceType: "ups",
    make: "APC",
    model: "Smart-UPS 1500VA",
    serialNumber: "AS1234567890",
    firmwareVersion: "UPS 09.8",
    ipAddress: "192.168.1.100",
    macAddress: "00:C0:B7:AA:BB:01",
    lastSeen: new Date().toISOString(),
    online: true,
    site: "Main Office - Server Room",
  },
];

function mapDeviceTypeToAssetType(deviceType: string): AssetType {
  switch (deviceType) {
    case "access_point": return "access_point";
    case "ups": return "ups";
    default: return "other";
  }
}

function transformToFirewall(device: AuvikDevice): Omit<Firewall, "id" | "clientId"> {
  return {
    make: device.make,
    model: device.model,
    serialNumber: device.serialNumber,
    firmwareVersion: device.firmwareVersion,
    managementIp: device.ipAddress,
    wanIp: device.wanIp || "",
    lanSubnets: device.lanSubnets || "",
    hasVpn: device.hasVpn || false,
    vpnConfig: "",
    age: "",
    location: device.site,
    notes: `Imported from Auvik. Device: ${device.deviceName}. MAC: ${device.macAddress}. Last seen: ${new Date(device.lastSeen).toLocaleDateString()}`,
  };
}

function transformToSwitch(device: AuvikDevice): Omit<NetworkSwitch, "id" | "clientId"> {
  return {
    make: device.make,
    model: device.model,
    serialNumber: device.serialNumber,
    managementIp: device.ipAddress,
    portCount: device.portCount || 0,
    poeCapable: device.poeCapable || false,
    isManaged: device.isManaged || false,
    vlanConfig: device.vlanConfig || "",
    age: "",
    location: device.site,
    notes: `Imported from Auvik. Device: ${device.deviceName}. Firmware: ${device.firmwareVersion}. MAC: ${device.macAddress}`,
  };
}

function transformToAsset(device: AuvikDevice): Omit<GenericAsset, "id" | "clientId"> {
  return {
    assetType: mapDeviceTypeToAssetType(device.deviceType),
    name: device.deviceName,
    make: device.make,
    model: device.model,
    serialNumber: device.serialNumber,
    ipAddress: device.ipAddress,
    location: device.site,
    assignedUser: "",
    warrantyExpiration: "",
    age: "",
    notes: `Imported from Auvik. Firmware: ${device.firmwareVersion}. MAC: ${device.macAddress}`,
  };
}

/**
 * Simulates fetching devices from the Auvik API.
 * In production: GET /v1/inventory/device/info
 */
export async function fetchAuvikDevices(): Promise<AuvikDevice[]> {
  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return DEMO_AUVIK_DEVICES;
}

/**
 * Fetches Auvik devices and transforms them into our environment data model.
 * Returns firewalls, switches, and other assets (APs, UPS, etc.) separately.
 */
export async function importFromAuvik(): Promise<AuvikImportResult> {
  const devices = await fetchAuvikDevices();

  const firewallDevices = devices.filter((d) => d.deviceType === "firewall");
  const switchDevices = devices.filter((d) => d.deviceType === "switch");
  const otherDevices = devices.filter((d) => !["firewall", "switch"].includes(d.deviceType));

  return {
    firewalls: firewallDevices.map(transformToFirewall),
    switches: switchDevices.map(transformToSwitch),
    assets: otherDevices.map(transformToAsset),
    totalDevices: devices.length,
    importedAt: new Date().toISOString(),
  };
}
