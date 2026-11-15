export type Category = 'freight' | 'origin';
export type ProfileStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';
export type CalcMethodCode = 'FLAT' | 'WEIGHT' | 'FLAT_WEIGHT';

export interface RateRow {
  destPort: string;
  flatAmount?: number;
  minAmount?: number;
  maxAmount?: number;
  rates: number[];
}

export interface RateProfileFields {
  category: Category;
  chargeCode: string;
  carrierCode: string;
  transportMode: string;
  serviceType: string;
  originPort: string;
  calculationMethod: CalcMethodCode;
  currencyCode: string;
  effectiveDate: string;
  expirationDate: string;
  externalMarkup?: number;
  internalMarkup?: number;
  status: ProfileStatus;
  remarks?: string;
  weightBreaks: string[];
  rows: RateRow[];
}

export interface RateProfile extends RateProfileFields {
  id: number;
  profileCode: string;
  version: number;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export type SaveProfileInput = RateProfileFields & { id?: number; version?: number };

export type PendingAction = { action: 'deactivate' | 'delete'; profile: RateProfile };

export interface SortState {
  key: keyof RateProfile;
  dir: 'asc' | 'desc';
}
