export interface Firewall {
  id: string;
  clientId: string;
  make: string;
  model: string;
  serialNumber: string;
  firmwareVersion: string;
  managementIp: string;
  wanIp: string;
  lanSubnets: string;
  hasVpn: boolean;
  vpnConfig: string;
  age: string;
  location: string;
  notes: string;
}

export interface Server {
  id: string;
  clientId: string;
  hostname: string;
  role: ServerRole;
  make: string;
  model: string;
  serialNumber: string;
  os: string;
  osVersion: string;
  cpuInfo: string;
  ramGb: number;
  storageGb: number;
  storageType: "SSD" | "HDD" | "NVMe" | "Mixed";
  ipAddress: string;
  isVirtual: boolean;
  hypervisor: string;
  currentBackupMethod: string;
  criticalApps: string;
  age: string;
  location: string;
  notes: string;
}

export type ServerRole =
  | "domain_controller"
  | "file_server"
  | "application_server"
  | "database_server"
  | "mail_server"
  | "web_server"
  | "print_server"
  | "backup_server"
  | "other";

export const SERVER_ROLE_LABELS: Record<ServerRole, string> = {
  domain_controller: "Domain Controller",
  file_server: "File Server",
  application_server: "Application Server",
  database_server: "Database Server",
  mail_server: "Mail Server",
  web_server: "Web Server",
  print_server: "Print Server",
  backup_server: "Backup Server",
  other: "Other",
};

export interface Workstation {
  id: string;
  clientId: string;
  hostname: string;
  make: string;
  model: string;
  serialNumber: string;
  os: string;
  osVersion: string;
  cpuInfo: string;
  ramGb: number;
  storageGb: number;
  assignedUser: string;
  department: string;
  age: string;
  location: string;
  notes: string;
}

export interface NetworkSwitch {
  id: string;
  clientId: string;
  make: string;
  model: string;
  serialNumber: string;
  managementIp: string;
  portCount: number;
  poeCapable: boolean;
  isManaged: boolean;
  vlanConfig: string;
  age: string;
  location: string;
  notes: string;
}

export interface GenericAsset {
  id: string;
  clientId: string;
  assetType: AssetType;
  name: string;
  make: string;
  model: string;
  serialNumber: string;
  ipAddress: string;
  location: string;
  assignedUser: string;
  warrantyExpiration: string;
  age: string;
  notes: string;
}

export type AssetType =
  | "printer"
  | "access_point"
  | "ups"
  | "nas"
  | "voip_phone"
  | "camera"
  | "projector"
  | "other";

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  printer: "Printer",
  access_point: "Access Point",
  ups: "UPS",
  nas: "NAS",
  voip_phone: "VoIP Phone",
  camera: "Camera",
  projector: "Projector",
  other: "Other",
};
