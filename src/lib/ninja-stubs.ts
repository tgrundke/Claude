/**
 * NinjaOne (NinjaRMM) API Simulation Stubs
 * In production, these would call the NinjaOne REST API to pull endpoint data.
 * For demo purposes, returns realistic sample data with simulated delay.
 */

import type { Server, Workstation, ServerRole } from "@/types/environment";

export interface NinjaDevice {
  id: number;
  systemName: string;
  dnsName: string;
  nodeClass: "WINDOWS_SERVER" | "WINDOWS_WORKSTATION" | "MAC" | "LINUX_SERVER" | "LINUX_WORKSTATION";
  organizationId: number;
  locationId: number;
  locationName: string;
  online: boolean;
  lastContact: string;
  os: {
    name: string;
    version: string;
    architecture: string;
  };
  system: {
    manufacturer: string;
    model: string;
    serialNumber: string;
    biosVersion: string;
  };
  processors: {
    name: string;
    cores: number;
    speed: string;
  }[];
  memory: {
    totalGb: number;
  };
  disks: {
    name: string;
    sizeGb: number;
    type: "SSD" | "HDD" | "NVMe";
  }[];
  networkInterfaces: {
    name: string;
    ipAddress: string;
    macAddress: string;
  }[];
  // Server-specific
  roles?: string[];
  isVirtual?: boolean;
  hypervisor?: string;
  // Workstation-specific
  assignedUser?: string;
  department?: string;
}

export interface NinjaImportResult {
  servers: Omit<Server, "id" | "clientId">[];
  workstations: Omit<Workstation, "id" | "clientId">[];
  totalDevices: number;
  importedAt: string;
}

// Demo data representing a realistic SMB client endpoint environment
const DEMO_NINJA_DEVICES: NinjaDevice[] = [
  // Servers
  {
    id: 1001,
    systemName: "DC01",
    dnsName: "DC01.contoso.local",
    nodeClass: "WINDOWS_SERVER",
    organizationId: 100,
    locationId: 1,
    locationName: "Main Office",
    online: true,
    lastContact: new Date().toISOString(),
    os: { name: "Windows Server", version: "2022 Standard", architecture: "x64" },
    system: { manufacturer: "Dell", model: "PowerEdge R640", serialNumber: "DELLSRV001ABC", biosVersion: "2.18.1" },
    processors: [{ name: "Intel Xeon Silver 4214R", cores: 12, speed: "2.40 GHz" }],
    memory: { totalGb: 64 },
    disks: [
      { name: "C:", sizeGb: 480, type: "SSD" },
      { name: "D:", sizeGb: 960, type: "SSD" },
    ],
    networkInterfaces: [{ name: "Ethernet0", ipAddress: "192.168.10.10", macAddress: "00:50:56:AA:01:01" }],
    roles: ["Active Directory Domain Services", "DNS Server", "DHCP Server"],
    isVirtual: false,
  },
  {
    id: 1002,
    systemName: "FS01",
    dnsName: "FS01.contoso.local",
    nodeClass: "WINDOWS_SERVER",
    organizationId: 100,
    locationId: 1,
    locationName: "Main Office",
    online: true,
    lastContact: new Date().toISOString(),
    os: { name: "Windows Server", version: "2019 Standard", architecture: "x64" },
    system: { manufacturer: "Dell", model: "PowerEdge R740", serialNumber: "DELLSRV002DEF", biosVersion: "2.15.0" },
    processors: [{ name: "Intel Xeon Silver 4210", cores: 10, speed: "2.20 GHz" }],
    memory: { totalGb: 32 },
    disks: [
      { name: "C:", sizeGb: 240, type: "SSD" },
      { name: "E:", sizeGb: 4000, type: "HDD" },
    ],
    networkInterfaces: [{ name: "Ethernet0", ipAddress: "192.168.10.11", macAddress: "00:50:56:AA:01:02" }],
    roles: ["File and Storage Services"],
    isVirtual: false,
  },
  {
    id: 1003,
    systemName: "APP01",
    dnsName: "APP01.contoso.local",
    nodeClass: "WINDOWS_SERVER",
    organizationId: 100,
    locationId: 1,
    locationName: "Main Office",
    online: true,
    lastContact: new Date().toISOString(),
    os: { name: "Windows Server", version: "2022 Standard", architecture: "x64" },
    system: { manufacturer: "Dell", model: "PowerEdge R640", serialNumber: "DELLSRV003GHI", biosVersion: "2.18.1" },
    processors: [{ name: "Intel Xeon Silver 4214R", cores: 12, speed: "2.40 GHz" }],
    memory: { totalGb: 48 },
    disks: [
      { name: "C:", sizeGb: 240, type: "SSD" },
      { name: "D:", sizeGb: 480, type: "SSD" },
    ],
    networkInterfaces: [{ name: "Ethernet0", ipAddress: "192.168.10.12", macAddress: "00:50:56:AA:01:03" }],
    roles: ["Application Server"],
    isVirtual: true,
    hypervisor: "Hyper-V",
  },
  {
    id: 1004,
    systemName: "SQL01",
    dnsName: "SQL01.contoso.local",
    nodeClass: "WINDOWS_SERVER",
    organizationId: 100,
    locationId: 1,
    locationName: "Main Office",
    online: true,
    lastContact: new Date().toISOString(),
    os: { name: "Windows Server", version: "2019 Standard", architecture: "x64" },
    system: { manufacturer: "HPE", model: "ProLiant DL380 Gen10", serialNumber: "HPESRV004JKL", biosVersion: "U30" },
    processors: [{ name: "Intel Xeon Gold 5218", cores: 16, speed: "2.30 GHz" }],
    memory: { totalGb: 128 },
    disks: [
      { name: "C:", sizeGb: 480, type: "SSD" },
      { name: "D:", sizeGb: 1920, type: "NVMe" },
    ],
    networkInterfaces: [{ name: "Ethernet0", ipAddress: "192.168.10.13", macAddress: "00:50:56:AA:01:04" }],
    roles: ["SQL Server"],
    isVirtual: false,
  },
  {
    id: 1005,
    systemName: "BKP01",
    dnsName: "BKP01.contoso.local",
    nodeClass: "WINDOWS_SERVER",
    organizationId: 100,
    locationId: 1,
    locationName: "Main Office",
    online: true,
    lastContact: new Date().toISOString(),
    os: { name: "Windows Server", version: "2022 Standard", architecture: "x64" },
    system: { manufacturer: "Dell", model: "PowerEdge T440", serialNumber: "DELLSRV005MNO", biosVersion: "2.16.0" },
    processors: [{ name: "Intel Xeon Silver 4110", cores: 8, speed: "2.10 GHz" }],
    memory: { totalGb: 32 },
    disks: [
      { name: "C:", sizeGb: 240, type: "SSD" },
      { name: "D:", sizeGb: 8000, type: "HDD" },
    ],
    networkInterfaces: [{ name: "Ethernet0", ipAddress: "192.168.10.14", macAddress: "00:50:56:AA:01:05" }],
    roles: ["Backup Server"],
    isVirtual: false,
  },
  // Workstations
  {
    id: 2001,
    systemName: "WS-JSMITH",
    dnsName: "WS-JSMITH.contoso.local",
    nodeClass: "WINDOWS_WORKSTATION",
    organizationId: 100,
    locationId: 1,
    locationName: "Main Office",
    online: true,
    lastContact: new Date().toISOString(),
    os: { name: "Windows 11", version: "23H2", architecture: "x64" },
    system: { manufacturer: "Dell", model: "OptiPlex 7090", serialNumber: "DELLWS001PQR", biosVersion: "1.15.0" },
    processors: [{ name: "Intel Core i7-11700", cores: 8, speed: "2.50 GHz" }],
    memory: { totalGb: 16 },
    disks: [{ name: "C:", sizeGb: 512, type: "NVMe" }],
    networkInterfaces: [{ name: "Ethernet0", ipAddress: "192.168.20.101", macAddress: "00:50:56:BB:01:01" }],
    assignedUser: "John Smith",
    department: "Accounting",
  },
  {
    id: 2002,
    systemName: "WS-JDOE",
    dnsName: "WS-JDOE.contoso.local",
    nodeClass: "WINDOWS_WORKSTATION",
    organizationId: 100,
    locationId: 1,
    locationName: "Main Office",
    online: true,
    lastContact: new Date().toISOString(),
    os: { name: "Windows 11", version: "23H2", architecture: "x64" },
    system: { manufacturer: "Dell", model: "Latitude 5540", serialNumber: "DELLWS002STU", biosVersion: "1.12.0" },
    processors: [{ name: "Intel Core i7-1365U", cores: 10, speed: "1.80 GHz" }],
    memory: { totalGb: 32 },
    disks: [{ name: "C:", sizeGb: 512, type: "NVMe" }],
    networkInterfaces: [{ name: "Wi-Fi", ipAddress: "192.168.20.102", macAddress: "00:50:56:BB:01:02" }],
    assignedUser: "Jane Doe",
    department: "Engineering",
  },
  {
    id: 2003,
    systemName: "WS-MBROWN",
    dnsName: "WS-MBROWN.contoso.local",
    nodeClass: "WINDOWS_WORKSTATION",
    organizationId: 100,
    locationId: 1,
    locationName: "Main Office",
    online: false,
    lastContact: new Date(Date.now() - 86400000 * 3).toISOString(),
    os: { name: "Windows 11", version: "22H2", architecture: "x64" },
    system: { manufacturer: "Lenovo", model: "ThinkPad T14 Gen 3", serialNumber: "LNVOWS003VWX", biosVersion: "1.46" },
    processors: [{ name: "AMD Ryzen 7 PRO 6850U", cores: 8, speed: "2.70 GHz" }],
    memory: { totalGb: 16 },
    disks: [{ name: "C:", sizeGb: 256, type: "NVMe" }],
    networkInterfaces: [{ name: "Wi-Fi", ipAddress: "192.168.20.103", macAddress: "00:50:56:BB:01:03" }],
    assignedUser: "Mike Brown",
    department: "Sales",
  },
  {
    id: 2004,
    systemName: "WS-LJOHNSON",
    dnsName: "WS-LJOHNSON.contoso.local",
    nodeClass: "WINDOWS_WORKSTATION",
    organizationId: 100,
    locationId: 1,
    locationName: "Main Office",
    online: true,
    lastContact: new Date().toISOString(),
    os: { name: "Windows 11", version: "23H2", architecture: "x64" },
    system: { manufacturer: "Dell", model: "OptiPlex 7090", serialNumber: "DELLWS004YZA", biosVersion: "1.15.0" },
    processors: [{ name: "Intel Core i5-11500", cores: 6, speed: "2.70 GHz" }],
    memory: { totalGb: 16 },
    disks: [{ name: "C:", sizeGb: 256, type: "SSD" }],
    networkInterfaces: [{ name: "Ethernet0", ipAddress: "192.168.20.104", macAddress: "00:50:56:BB:01:04" }],
    assignedUser: "Lisa Johnson",
    department: "HR",
  },
  {
    id: 2005,
    systemName: "WS-TWILSON",
    dnsName: "WS-TWILSON.contoso.local",
    nodeClass: "WINDOWS_WORKSTATION",
    organizationId: 100,
    locationId: 1,
    locationName: "Main Office",
    online: true,
    lastContact: new Date().toISOString(),
    os: { name: "Windows 11", version: "23H2", architecture: "x64" },
    system: { manufacturer: "Dell", model: "Precision 5570", serialNumber: "DELLWS005BCD", biosVersion: "1.20.0" },
    processors: [{ name: "Intel Core i9-12900H", cores: 14, speed: "2.50 GHz" }],
    memory: { totalGb: 64 },
    disks: [{ name: "C:", sizeGb: 1024, type: "NVMe" }],
    networkInterfaces: [{ name: "Ethernet0", ipAddress: "192.168.20.105", macAddress: "00:50:56:BB:01:05" }],
    assignedUser: "Tom Wilson",
    department: "Engineering",
  },
  {
    id: 2006,
    systemName: "WS-AGARCIA",
    dnsName: "WS-AGARCIA.contoso.local",
    nodeClass: "WINDOWS_WORKSTATION",
    organizationId: 100,
    locationId: 1,
    locationName: "Main Office",
    online: true,
    lastContact: new Date().toISOString(),
    os: { name: "Windows 10", version: "22H2", architecture: "x64" },
    system: { manufacturer: "HP", model: "EliteDesk 800 G6", serialNumber: "HPEWS006EFG", biosVersion: "S02" },
    processors: [{ name: "Intel Core i5-10500", cores: 6, speed: "3.10 GHz" }],
    memory: { totalGb: 8 },
    disks: [{ name: "C:", sizeGb: 256, type: "SSD" }],
    networkInterfaces: [{ name: "Ethernet0", ipAddress: "192.168.20.106", macAddress: "00:50:56:BB:01:06" }],
    assignedUser: "Ana Garcia",
    department: "Reception",
  },
  {
    id: 2007,
    systemName: "WS-RLEE",
    dnsName: "WS-RLEE.contoso.local",
    nodeClass: "WINDOWS_WORKSTATION",
    organizationId: 100,
    locationId: 2,
    locationName: "Branch Office",
    online: true,
    lastContact: new Date().toISOString(),
    os: { name: "Windows 11", version: "23H2", architecture: "x64" },
    system: { manufacturer: "Lenovo", model: "ThinkCentre M90q Gen 3", serialNumber: "LNVOWS007HIJ", biosVersion: "M3RKT4EA" },
    processors: [{ name: "Intel Core i7-12700", cores: 12, speed: "2.10 GHz" }],
    memory: { totalGb: 32 },
    disks: [{ name: "C:", sizeGb: 512, type: "NVMe" }],
    networkInterfaces: [{ name: "Ethernet0", ipAddress: "10.10.1.101", macAddress: "00:50:56:BB:01:07" }],
    assignedUser: "Robert Lee",
    department: "Engineering",
  },
  {
    id: 2008,
    systemName: "MAC-KPATEL",
    dnsName: "MAC-KPATEL.local",
    nodeClass: "MAC",
    organizationId: 100,
    locationId: 1,
    locationName: "Main Office",
    online: true,
    lastContact: new Date().toISOString(),
    os: { name: "macOS", version: "Sonoma 14.4", architecture: "arm64" },
    system: { manufacturer: "Apple", model: "MacBook Pro 14\" M3 Pro", serialNumber: "C02ZN1234567", biosVersion: "" },
    processors: [{ name: "Apple M3 Pro", cores: 12, speed: "" }],
    memory: { totalGb: 36 },
    disks: [{ name: "Macintosh HD", sizeGb: 1024, type: "NVMe" }],
    networkInterfaces: [{ name: "Wi-Fi", ipAddress: "192.168.20.110", macAddress: "A0:78:17:CC:DD:01" }],
    assignedUser: "Kavita Patel",
    department: "Marketing",
  },
];

function inferServerRole(roles?: string[]): ServerRole {
  if (!roles || roles.length === 0) return "other";
  const roleStr = roles.join(" ").toLowerCase();
  if (roleStr.includes("domain") || roleStr.includes("active directory")) return "domain_controller";
  if (roleStr.includes("file") || roleStr.includes("storage")) return "file_server";
  if (roleStr.includes("sql") || roleStr.includes("database")) return "database_server";
  if (roleStr.includes("backup")) return "backup_server";
  if (roleStr.includes("mail") || roleStr.includes("exchange")) return "mail_server";
  if (roleStr.includes("web") || roleStr.includes("iis")) return "web_server";
  if (roleStr.includes("print")) return "print_server";
  if (roleStr.includes("application")) return "application_server";
  return "other";
}

function getStorageType(disks: NinjaDevice["disks"]): "SSD" | "HDD" | "NVMe" | "Mixed" {
  const types = new Set(disks.map((d) => d.type));
  if (types.size > 1) return "Mixed";
  return disks[0]?.type || "SSD";
}

function getTotalStorage(disks: NinjaDevice["disks"]): number {
  return disks.reduce((sum, d) => sum + d.sizeGb, 0);
}

function transformToServer(device: NinjaDevice): Omit<Server, "id" | "clientId"> {
  return {
    hostname: device.systemName,
    role: inferServerRole(device.roles),
    make: device.system.manufacturer,
    model: device.system.model,
    serialNumber: device.system.serialNumber,
    os: device.os.name,
    osVersion: device.os.version,
    cpuInfo: device.processors.map((p) => `${p.name} (${p.cores} cores)`).join(", "),
    ramGb: device.memory.totalGb,
    storageGb: getTotalStorage(device.disks),
    storageType: getStorageType(device.disks),
    ipAddress: device.networkInterfaces[0]?.ipAddress || "",
    isVirtual: device.isVirtual || false,
    hypervisor: device.hypervisor || "",
    currentBackupMethod: "",
    criticalApps: device.roles?.join(", ") || "",
    age: "",
    location: device.locationName,
    notes: `Imported from NinjaOne. DNS: ${device.dnsName}. Online: ${device.online ? "Yes" : "No"}. Last contact: ${new Date(device.lastContact).toLocaleDateString()}`,
  };
}

function transformToWorkstation(device: NinjaDevice): Omit<Workstation, "id" | "clientId"> {
  return {
    hostname: device.systemName,
    make: device.system.manufacturer,
    model: device.system.model,
    serialNumber: device.system.serialNumber,
    os: device.os.name,
    osVersion: device.os.version,
    cpuInfo: device.processors.map((p) => `${p.name} (${p.cores} cores)`).join(", "),
    ramGb: device.memory.totalGb,
    storageGb: getTotalStorage(device.disks),
    assignedUser: device.assignedUser || "",
    department: device.department || "",
    age: "",
    location: device.locationName,
    notes: `Imported from NinjaOne. DNS: ${device.dnsName}. Online: ${device.online ? "Yes" : "No"}. Last contact: ${new Date(device.lastContact).toLocaleDateString()}`,
  };
}

/**
 * Simulates fetching devices from the NinjaOne API.
 * In production: GET /v2/devices
 */
export async function fetchNinjaDevices(): Promise<NinjaDevice[]> {
  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 1800));
  return DEMO_NINJA_DEVICES;
}

/**
 * Fetches NinjaOne devices and transforms them into our environment data model.
 * Returns servers and workstations separately.
 */
export async function importFromNinja(): Promise<NinjaImportResult> {
  const devices = await fetchNinjaDevices();

  const serverDevices = devices.filter((d) =>
    d.nodeClass === "WINDOWS_SERVER" || d.nodeClass === "LINUX_SERVER"
  );
  const workstationDevices = devices.filter((d) =>
    d.nodeClass === "WINDOWS_WORKSTATION" || d.nodeClass === "MAC" || d.nodeClass === "LINUX_WORKSTATION"
  );

  return {
    servers: serverDevices.map(transformToServer),
    workstations: workstationDevices.map(transformToWorkstation),
    totalDevices: devices.length,
    importedAt: new Date().toISOString(),
  };
}
