export interface RegionInfo {
  countryCode: string;
  region?: string;
}

export interface BirthDateInput {
  day: number;
  month: number;
  year: number;
}

export interface AgeVerificationResult {
  ageVerified: boolean;
  isAdult: boolean;
  age: number | null;
  countryCode: string;
  region: string;
  verificationMethod: string;
  verificationProvider: string;
  ageVerifiedAt: string | null;
  reason: string;
}
