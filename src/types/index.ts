export type Mansion = {
  id: number;
  slug: string;
  name: string;
  nameKana: string | null;
  normalizedName: string;
  address: string;
  areaName: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  landRights: string | null;
  totalUnits: number | null;
  builtYearMonth: string | null;
  builtYear: number | null;
  ageYears: number | null;
  developer: string | null;
  constructorName: string | null;
  accessInfo: string | null;
  schoolDistrict: string | null;
  zoning: string | null;
  structureText: string | null;
  floors: number | null;
  parkingInfo: string | null;
  layoutTypes: string | null;
  description: string | null;
  featuredImageUrl: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  managements?: MansionManagement[];
  sales?: MansionSale[];
  transactions?: MansionTransaction[];
  _count?: {
    sales: number;
    transactions: number;
  };
};

export type MansionManagement = {
  id: number;
  mansionId: number;
  managementCompany: string | null;
  managementStyle: string | null;
  monthlyManagementFee: number | null;
  monthlyRepairReserveFee: number | null;
  petAllowed: boolean | null;
  parkingAvailable: boolean | null;
  notes: string | null;
  updatedAt: string;
};

export type MansionSale = {
  id: number;
  mansionId: number;
  roomNumber: string | null;
  floorNumber: number | null;
  layout: string | null;
  exclusiveArea: number | null;
  balconyArea: number | null;
  direction: string | null;
  price: number | null;
  pricePerTsubo: number | null;
  status: string;
  listingSourceName: string | null;
  listingSourceUrl: string | null;
  fetchedAt: string | null;
  publishedAt: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  mansion?: Pick<Mansion, "id" | "name" | "slug" | "address" | "city">;
};

export type MansionTransaction = {
  id: number;
  mansionId: number;
  contractYearMonth: string | null;
  floorNumber: number | null;
  layout: string | null;
  exclusiveArea: number | null;
  contractPriceMin: number | null;
  contractPriceMax: number | null;
  pricePerTsuboMin: number | null;
  pricePerTsuboMax: number | null;
  sourceName: string | null;
  notes: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  mansion?: Pick<Mansion, "id" | "name" | "slug" | "address" | "city">;
};

export type SearchParams = {
  city?: string;
  areaName?: string;
  minPrice?: number;
  maxPrice?: number;
  layout?: string;
  minArea?: number;
  maxArea?: number;
  builtYearFrom?: number;
  keyword?: string;
  page?: number;
  limit?: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ApiError = {
  error: string;
  details?: string;
};
