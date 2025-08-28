// Quantity types for different consumption methods
export type QuantityType = 'decimal' | 'milligrams' | 'size_category';

export interface QuantityValue {
  amount: number;
  unit: string;
  type: QuantityType;
}

export const FLOWER_SIZES = ['tiny', 'small', 'medium', 'large'] as const;
export type FlowerSize = typeof FLOWER_SIZES[number];

export interface ConsumptionSession {
  id: string;
  date: string;
  time: string;
  location: string;
  latitude?: number;
  longitude?: number;
  who_with: string;
  vessel: string;
  accessory_used: string;
  my_vessel: boolean;
  my_substance: boolean;
  strain_name: string;
  thc_percentage?: number;
  purchased_legally: boolean;
  state_purchased?: string;
  tobacco: boolean;
  kief: boolean;
  concentrate: boolean;
  quantity: QuantityValue;
  quantity_legacy?: number;
  created_at: string;
  updated_at: string;
}

export type CreateConsumptionSession = Omit<
  ConsumptionSession,
  'id' | 'created_at' | 'updated_at'
>;

export const VESSEL_TYPES = [
  'Joint',
  'Blunt',
  'Pipe',
  'Bong',
  'Vape Pen',
  'Dab Rig',
  'Edibles',
  'Tincture',
  'Other',
] as const;
export type VesselType = typeof VESSEL_TYPES[number];

export const VESSEL_QUANTITY_CONFIG = {
  Joint: { type: 'decimal' as QuantityType, unit: 'joint portion', placeholder: '0.25', step: 0.01 },
  Blunt: { type: 'decimal' as QuantityType, unit: 'blunt portion', placeholder: '0.33', step: 0.01 },
  Pipe: { type: 'size_category' as QuantityType, unit: 'bowl size', options: FLOWER_SIZES },
  Bong: { type: 'size_category' as QuantityType, unit: 'bowl size', options: FLOWER_SIZES },
  'Vape Pen': { type: 'decimal' as QuantityType, unit: 'puffs', placeholder: '5', step: 1 },
  'Dab Rig': { type: 'decimal' as QuantityType, unit: 'dabs', placeholder: '1', step: 0.5 },
  Edibles: { type: 'milligrams' as QuantityType, unit: 'mg THC', placeholder: '10', step: 1 },
  Tincture: { type: 'milligrams' as QuantityType, unit: 'mg THC', placeholder: '5', step: 1 },
  Other: { type: 'decimal' as QuantityType, unit: 'units', placeholder: '1', step: 0.1 },
} as const;

export const getQuantityConfig = (vessel: VesselType) => VESSEL_QUANTITY_CONFIG[vessel] || VESSEL_QUANTITY_CONFIG.Other;

export const createQuantityValue = (
  vessel: VesselType,
  amount: number | FlowerSize,
): QuantityValue => {
  const config = getQuantityConfig(vessel);
  if (config.type === 'size_category') {
    const sizeIndex = FLOWER_SIZES.indexOf(amount as FlowerSize);
    return { amount: sizeIndex, unit: config.unit, type: config.type };
  }
  return { amount: amount as number, unit: config.unit, type: config.type };
};

export const formatQuantity = (quantity: QuantityValue): string => {
  if (quantity.type === 'size_category') {
    return `${FLOWER_SIZES[quantity.amount]} ${quantity.unit}`;
  }
  return `${quantity.amount} ${quantity.unit}`;
};

export const migrateLegacyQuantity = (vessel: VesselType, legacyQuantity: number): QuantityValue =>
  createQuantityValue(vessel, legacyQuantity);

export const ACCESSORY_TYPES = [
  'None',
  'Grinder',
  'Rolling Papers',
  'Lighter',
  'Torch',
  'Dab Tool',
  'Carb Cap',
  'Glass Screen',
  'Filter Tips',
  'Other',
] as const;
export type AccessoryType = typeof ACCESSORY_TYPES[number];

export interface ConsumptionFormData extends Omit<CreateConsumptionSession, 'quantity'> {
  quantity: number | FlowerSize;
}

export interface ConsumptionFilters {
  startDate?: string;
  endDate?: string;
  strainName?: string;
  location?: string;
  vessel?: string;
  limit?: number;
  offset?: number;
}

export interface ConsumptionStats {
  totalSessions: number;
  mostUsedStrain: string;
  mostUsedVessel: string;
  totalQuantityConsumed: number;
  favoriteLocation: string;
  averageSessionsPerWeek: number;
}

export interface QuantityAnalytics {
  totalQuantityByVessel: Record<string, number>;
  averageQuantityByVessel: Record<string, number>;
  quantityTrendOverTime: Array<{
    period: string;
    totalQuantity: number;
    averageQuantity: number;
    sessions: number;
  }>;
  mostConsumedStrains: Array<{ strain: string; totalQuantity: number }>;
  quantityEfficiency: {
    averagePerSession: number;
    mostEfficientVessel: string;
    quantityPerWeek: number;
  };
}

export interface AppState {
  currentSession?: Partial<ConsumptionFormData>;
  sessions: ConsumptionSession[];
  isLoading: boolean;
  isSaving: boolean;
  filters: ConsumptionFilters;
  searchTerm: string;
  activeView: 'log' | 'history' | 'analytics' | 'settings';
  showMobileMenu: boolean;
  newlyCreatedSessionId: string | null;
  preferences: {
    defaultLocation: string;
    enableNotifications: boolean;
    dataRetentionDays?: number;
  };
}
