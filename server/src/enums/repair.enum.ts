export enum RepairStatus {
  PENDING = 'pending', // 待处理
  PROGRESS = 'progress', // 处理中
  COMPLETED = 'completed', // 已完成
  CANCELLED = 'cancelled', // 已取消
}

export enum DeviceType {
  AIR = 'air',
  WATER = 'water',
  DOOR = 'door',
  WINDOW = 'window',
  TABLE = 'table',
}
