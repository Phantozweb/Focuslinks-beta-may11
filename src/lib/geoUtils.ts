/**
 * geoUtils.ts — Geocoding utility for FocusLinks OptoMap
 *
 * Provides offline geocoding for city/country names and ISO country codes.
 * Covers all countries and cities found in the FocusLinks user base:
 * India, Nigeria, Kenya, Kuwait, Bangladesh, Pakistan, Saudi Arabia,
 * China, Syria, Australia, US, UAE, and more.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GeoCoord {
  lat: number;
  lng: number;
}

export interface GeoResult extends GeoCoord {
  city?: string;
  country?: string;
}

export interface CountryCentroid extends GeoCoord {
  country: string;
}

// ─── Country Centroids (ISO code → { lat, lng, country name }) ──────────────

export const COUNTRY_CENTROIDS: Record<string, CountryCentroid> = {
  IN: { lat: 20.5937, lng: 78.9629, country: 'India' },
  NG: { lat: 9.082, lng: 8.6753, country: 'Nigeria' },
  KE: { lat: -0.0236, lng: 37.9062, country: 'Kenya' },
  KW: { lat: 29.3117, lng: 47.4818, country: 'Kuwait' },
  BD: { lat: 23.685, lng: 90.3563, country: 'Bangladesh' },
  CN: { lat: 35.8617, lng: 104.1954, country: 'China' },
  PK: { lat: 30.3753, lng: 69.3451, country: 'Pakistan' },
  SA: { lat: 23.8859, lng: 45.0792, country: 'Saudi Arabia' },
  SY: { lat: 34.8021, lng: 38.9968, country: 'Syria' },
  AU: { lat: -25.2744, lng: 133.7751, country: 'Australia' },
  US: { lat: 37.0902, lng: -95.7129, country: 'United States' },
  AE: { lat: 23.4241, lng: 53.8478, country: 'United Arab Emirates' },
  GB: { lat: 55.3781, lng: -3.436, country: 'United Kingdom' },
  CA: { lat: 56.1304, lng: -106.3468, country: 'Canada' },
  DE: { lat: 51.1657, lng: 10.4515, country: 'Germany' },
  FR: { lat: 46.2276, lng: 2.2137, country: 'France' },
  QA: { lat: 25.3548, lng: 51.1839, country: 'Qatar' },
  OM: { lat: 21.4735, lng: 55.9754, country: 'Oman' },
  BH: { lat: 26.0667, lng: 50.5577, country: 'Bahrain' },
  JO: { lat: 30.5852, lng: 36.2384, country: 'Jordan' },
  LB: { lat: 33.8547, lng: 35.8623, country: 'Lebanon' },
  IQ: { lat: 33.2232, lng: 43.6793, country: 'Iraq' },
  EG: { lat: 26.8206, lng: 30.8025, country: 'Egypt' },
  GH: { lat: 7.9465, lng: -1.0232, country: 'Ghana' },
  ZA: { lat: -30.5595, lng: 22.9375, country: 'South Africa' },
  TZ: { lat: -6.369, lng: 34.8888, country: 'Tanzania' },
  UG: { lat: 1.3733, lng: 32.2903, country: 'Uganda' },
  MY: { lat: 4.2105, lng: 101.9758, country: 'Malaysia' },
  SG: { lat: 1.3521, lng: 103.8198, country: 'Singapore' },
  PH: { lat: 12.8797, lng: 121.774, country: 'Philippines' },
  ID: { lat: -0.7893, lng: 113.9213, country: 'Indonesia' },
  TH: { lat: 15.87, lng: 100.9925, country: 'Thailand' },
  NP: { lat: 28.3949, lng: 84.124, country: 'Nepal' },
  LK: { lat: 7.8731, lng: 80.7718, country: 'Sri Lanka' },
  MM: { lat: 21.9162, lng: 95.956, country: 'Myanmar' },
  AF: { lat: 33.9391, lng: 67.71, country: 'Afghanistan' },
  IR: { lat: 32.4279, lng: 53.688, country: 'Iran' },
  TR: { lat: 38.9637, lng: 35.2433, country: 'Turkey' },
  IT: { lat: 41.8719, lng: 12.5674, country: 'Italy' },
  ES: { lat: 40.4637, lng: -3.7492, country: 'Spain' },
  NL: { lat: 52.1326, lng: 5.2913, country: 'Netherlands' },
  SE: { lat: 60.1282, lng: 18.6435, country: 'Sweden' },
  NO: { lat: 60.472, lng: 8.4689, country: 'Norway' },
  RU: { lat: 61.524, lng: 105.3188, country: 'Russia' },
  BR: { lat: -14.235, lng: -51.9253, country: 'Brazil' },
  MX: { lat: 23.6345, lng: -102.5528, country: 'Mexico' },
  AR: { lat: -38.4161, lng: -63.6167, country: 'Argentina' },
  JP: { lat: 36.2048, lng: 138.2529, country: 'Japan' },
  KR: { lat: 35.9078, lng: 127.7669, country: 'South Korea' },
  NZ: { lat: -40.9006, lng: 174.886, country: 'New Zealand' },
  IE: { lat: 53.1424, lng: -7.6921, country: 'Ireland' },
  PT: { lat: 39.3999, lng: -8.2245, country: 'Portugal' },
  PL: { lat: 51.9194, lng: 19.1451, country: 'Poland' },
  CH: { lat: 46.8182, lng: 8.2275, country: 'Switzerland' },
  AT: { lat: 47.5162, lng: 14.5501, country: 'Austria' },
  BE: { lat: 50.5039, lng: 4.4699, country: 'Belgium' },
  DK: { lat: 56.2639, lng: 9.5018, country: 'Denmark' },
  FI: { lat: 61.9241, lng: 25.7482, country: 'Finland' },
  CZ: { lat: 49.8175, lng: 15.473, country: 'Czech Republic' },
  IL: { lat: 31.0461, lng: 34.8516, country: 'Israel' },
  CY: { lat: 35.1264, lng: 33.4299, country: 'Cyprus' },
  MT: { lat: 35.9375, lng: 14.3754, country: 'Malta' },
  GR: { lat: 39.0742, lng: 21.8243, country: 'Greece' },
  HU: { lat: 47.1625, lng: 19.5033, country: 'Hungary' },
  RO: { lat: 45.9432, lng: 24.9668, country: 'Romania' },
  UA: { lat: 48.3794, lng: 31.1656, country: 'Ukraine' },
  ET: { lat: 9.145, lng: 40.4897, country: 'Ethiopia' },
  CM: { lat: 7.3697, lng: 12.3547, country: 'Cameroon' },
  SN: { lat: 14.4974, lng: -14.4524, country: 'Senegal' },
  CI: { lat: 7.5399, lng: -5.5471, country: 'Ivory Coast' },
  RW: { lat: -1.9403, lng: 29.8739, country: 'Rwanda' },
  MU: { lat: -20.3484, lng: 57.5522, country: 'Mauritius' },
  SC: { lat: -4.6796, lng: 55.492, country: 'Seychelles' },
};

// ─── City Coordinates (lowercase name → { lat, lng, country }) ──────────────

export const CITY_COORDS: Record<string, GeoCoord & { country: string }> = {
  // ── India ──────────────────────────────────────────────────────────────
  'chennai': { lat: 13.0827, lng: 80.2707, country: 'India' },
  'madras': { lat: 13.0827, lng: 80.2707, country: 'India' },
  'mumbai': { lat: 19.076, lng: 72.8777, country: 'India' },
  'bombay': { lat: 19.076, lng: 72.8777, country: 'India' },
  'delhi': { lat: 28.7041, lng: 77.1025, country: 'India' },
  'new delhi': { lat: 28.6139, lng: 77.209, country: 'India' },
  'bangalore': { lat: 12.9716, lng: 77.5946, country: 'India' },
  'bengaluru': { lat: 12.9716, lng: 77.5946, country: 'India' },
  'hyderabad': { lat: 17.385, lng: 78.4867, country: 'India' },
  'kolkata': { lat: 22.5726, lng: 88.3639, country: 'India' },
  'calcutta': { lat: 22.5726, lng: 88.3639, country: 'India' },
  'madurai': { lat: 9.9252, lng: 78.1198, country: 'India' },
  'coimbatore': { lat: 11.0168, lng: 76.9558, country: 'India' },
  'tirunelveli': { lat: 8.7139, lng: 77.7567, country: 'India' },
  'shillong': { lat: 25.5788, lng: 91.8933, country: 'India' },
  'ranchi': { lat: 23.3441, lng: 85.3096, country: 'India' },
  'kushinagar': { lat: 26.7371, lng: 83.8847, country: 'India' },
  'jaipur': { lat: 26.9124, lng: 75.7873, country: 'India' },
  'lucknow': { lat: 26.8467, lng: 80.9462, country: 'India' },
  'ahmedabad': { lat: 23.0225, lng: 72.5714, country: 'India' },
  'pune': { lat: 18.5204, lng: 73.8567, country: 'India' },
  'nagpur': { lat: 21.1458, lng: 79.0882, country: 'India' },
  'indore': { lat: 22.7196, lng: 75.8577, country: 'India' },
  'bhopal': { lat: 23.2599, lng: 77.4126, country: 'India' },
  'visakhapatnam': { lat: 17.6868, lng: 83.2185, country: 'India' },
  'vijayawada': { lat: 16.5074, lng: 80.6466, country: 'India' },
  'thiruvananthapuram': { lat: 8.5241, lng: 76.9366, country: 'India' },
  'trivandrum': { lat: 8.5241, lng: 76.9366, country: 'India' },
  'kozhikode': { lat: 11.2588, lng: 75.7804, country: 'India' },
  'calicut': { lat: 11.2588, lng: 75.7804, country: 'India' },
  'ernakulam': { lat: 9.9816, lng: 76.2999, country: 'India' },
  'kochi': { lat: 9.9312, lng: 76.2673, country: 'India' },
  'bhubaneswar': { lat: 20.2961, lng: 85.8245, country: 'India' },
  'cuttack': { lat: 20.4619, lng: 85.8827, country: 'India' },
  'dehradun': { lat: 30.3165, lng: 78.0322, country: 'India' },
  'srinagar': { lat: 34.0837, lng: 74.7973, country: 'India' },
  'guwahati': { lat: 26.1445, lng: 91.7362, country: 'India' },
  'patna': { lat: 25.6093, lng: 85.1376, country: 'India' },
  'varanasi': { lat: 25.3176, lng: 83.0064, country: 'India' },
  'agra': { lat: 27.1767, lng: 78.0081, country: 'India' },
  'surat': { lat: 21.1702, lng: 72.8311, country: 'India' },
  'vadodara': { lat: 22.3072, lng: 73.1812, country: 'India' },
  'rajkot': { lat: 22.3039, lng: 70.8022, country: 'India' },
  'udaipur': { lat: 24.5854, lng: 73.7125, country: 'India' },
  'jodhpur': { lat: 26.2389, lng: 73.0243, country: 'India' },
  'amritsar': { lat: 31.634, lng: 74.8723, country: 'India' },
  'ludhiana': { lat: 30.901, lng: 75.8573, country: 'India' },
  'chandigarh': { lat: 30.7333, lng: 76.7794, country: 'India' },
  'mohali': { lat: 30.6765, lng: 76.7407, country: 'India' },
  'noida': { lat: 28.5355, lng: 77.391, country: 'India' },
  'gurgaon': { lat: 28.4595, lng: 77.0266, country: 'India' },
  'gurugram': { lat: 28.4595, lng: 77.0266, country: 'India' },
  'faridabad': { lat: 28.4089, lng: 77.3178, country: 'India' },
  'ghaziabad': { lat: 28.6692, lng: 77.4538, country: 'India' },
  'meerut': { lat: 28.9845, lng: 77.7064, country: 'India' },
  'allahabad': { lat: 25.4316, lng: 81.8463, country: 'India' },
  'prayagraj': { lat: 25.4316, lng: 81.8463, country: 'India' },
  'bareilly': { lat: 28.367, lng: 79.4304, country: 'India' },
  'aligarh': { lat: 27.8973, lng: 78.0882, country: 'India' },
  'gorakhpur': { lat: 26.7606, lng: 83.3732, country: 'India' },
  'dhanbad': { lat: 23.7957, lng: 86.4304, country: 'India' },
  'jamshedpur': { lat: 22.8046, lng: 86.2029, country: 'India' },
  'durgapur': { lat: 23.5204, lng: 87.3119, country: 'India' },
  'siliguri': { lat: 26.7271, lng: 88.3953, country: 'India' },
  'asansol': { lat: 23.684, lng: 86.9524, country: 'India' },
  'tiruchirappalli': { lat: 10.7905, lng: 78.7047, country: 'India' },
  'trichy': { lat: 10.7905, lng: 78.7047, country: 'India' },
  'salem': { lat: 11.6643, lng: 78.146, country: 'India' },
  'erode': { lat: 11.341, lng: 77.7172, country: 'India' },
  'hosur': { lat: 12.7414, lng: 77.8298, country: 'India' },
  'tumkur': { lat: 13.0675, lng: 77.1015, country: 'India' },
  'mangalore': { lat: 12.9141, lng: 74.856, country: 'India' },
  'mangaluru': { lat: 12.9141, lng: 74.856, country: 'India' },
  'hubli': { lat: 15.3647, lng: 75.124, country: 'India' },
  'dharwad': { lat: 15.4529, lng: 75.0077, country: 'India' },
  'belgaum': { lat: 15.8525, lng: 74.4986, country: 'India' },
  'solapur': { lat: 17.6805, lng: 75.8968, country: 'India' },
  'aurangabad': { lat: 19.8762, lng: 75.3433, country: 'India' },
  'nasik': { lat: 19.9975, lng: 73.7898, country: 'India' },
  'nashik': { lat: 19.9975, lng: 73.7898, country: 'India' },
  'kolhapur': { lat: 16.705, lng: 74.2433, country: 'India' },
  'thoothukudi': { lat: 8.7642, lng: 78.1348, country: 'India' },
  'tuticorin': { lat: 8.7642, lng: 78.1348, country: 'India' },
  'nagercoil': { lat: 8.1833, lng: 77.4292, country: 'India' },
  'kanyakumari': { lat: 8.0883, lng: 77.5385, country: 'India' },
  'pondicherry': { lat: 11.9416, lng: 79.8083, country: 'India' },
  'puducherry': { lat: 11.9416, lng: 79.8083, country: 'India' },
  'goa': { lat: 15.2993, lng: 74.124, country: 'India' },
  'panaji': { lat: 15.4909, lng: 73.8278, country: 'India' },
  'vasco': { lat: 15.3982, lng: 73.8314, country: 'India' },
  'imphal': { lat: 24.817, lng: 93.9368, country: 'India' },
  'agartala': { lat: 23.8315, lng: 91.2868, country: 'India' },
  'aizawl': { lat: 23.7271, lng: 92.7176, country: 'India' },
  'kohima': { lat: 25.6751, lng: 94.1086, country: 'India' },
  'itanagar': { lat: 27.0844, lng: 93.6053, country: 'India' },
  'dispur': { lat: 26.1445, lng: 91.7362, country: 'India' },
  'gangtok': { lat: 27.3389, lng: 88.6065, country: 'India' },
  'darjeeling': { lat: 27.036, lng: 88.2627, country: 'India' },

  // Indian states/regions as fallback locations
  'tamil nadu': { lat: 11.1271, lng: 78.6569, country: 'India' },
  'kerala': { lat: 10.8505, lng: 76.2711, country: 'India' },
  'karnataka': { lat: 15.3173, lng: 75.7139, country: 'India' },
  'maharashtra': { lat: 19.7515, lng: 75.7139, country: 'India' },
  'andhra pradesh': { lat: 15.9129, lng: 79.740, country: 'India' },
  'telangana': { lat: 18.1124, lng: 79.0193, country: 'India' },
  'west bengal': { lat: 22.9868, lng: 87.855, country: 'India' },
  'jharkhand': { lat: 23.6102, lng: 85.2799, country: 'India' },
  'uttar pradesh': { lat: 26.8467, lng: 80.9462, country: 'India' },
  'meghalaya': { lat: 25.467, lng: 91.3662, country: 'India' },
  'punjab': { lat: 31.1471, lng: 75.3412, country: 'India' },
  'gujarat': { lat: 22.2587, lng: 71.1924, country: 'India' },
  'rajasthan': { lat: 27.0238, lng: 74.2179, country: 'India' },
  'odisha': { lat: 20.9517, lng: 85.0985, country: 'India' },
  'bihar': { lat: 25.0961, lng: 85.3131, country: 'India' },
  'madhya pradesh': { lat: 22.9734, lng: 78.6569, country: 'India' },
  'haryana': { lat: 29.0588, lng: 76.0856, country: 'India' },
  'uttarakhand': { lat: 30.0668, lng: 79.0193, country: 'India' },
  'himachal pradesh': { lat: 31.1048, lng: 77.1734, country: 'India' },
  'assam': { lat: 26.2442, lng: 92.5378, country: 'India' },
  'tripura': { lat: 23.9408, lng: 91.9882, country: 'India' },
  'manipur': { lat: 24.6637, lng: 93.9063, country: 'India' },
  'mizoram': { lat: 23.1645, lng: 92.9376, country: 'India' },
  'nagaland': { lat: 26.1584, lng: 94.5624, country: 'India' },
  'arunachal pradesh': { lat: 28.218, lng: 94.7278, country: 'India' },
  'sikkim': { lat: 27.533, lng: 88.5122, country: 'India' },
  'chhattisgarh': { lat: 21.2787, lng: 81.8661, country: 'India' },
  'jammu and kashmir': { lat: 33.7782, lng: 76.5762, country: 'India' },
  'jammu': { lat: 32.7266, lng: 74.857, country: 'India' },
  'andaman and nicobar': { lat: 11.6234, lng: 92.7265, country: 'India' },

  // ── Nigeria ────────────────────────────────────────────────────────────
  'lagos': { lat: 6.5244, lng: 3.3792, country: 'Nigeria' },
  'ikeja': { lat: 6.5954, lng: 3.339, country: 'Nigeria' },
  'amuwo odofin': { lat: 6.4713, lng: 3.2853, country: 'Nigeria' },
  'lekki': { lat: 6.4576, lng: 3.5444, country: 'Nigeria' },
  'victoria island': { lat: 6.4281, lng: 3.4219, country: 'Nigeria' },
  'abuja': { lat: 9.0579, lng: 7.4951, country: 'Nigeria' },
  'port harcourt': { lat: 4.8156, lng: 7.0498, country: 'Nigeria' },
  'kano': { lat: 12.0022, lng: 8.592, country: 'Nigeria' },
  'ibadan': { lat: 7.3775, lng: 3.947, country: 'Nigeria' },
  'benin city': { lat: 6.335, lng: 5.627, country: 'Nigeria' },
  'kaduna': { lat: 10.5105, lng: 7.4165, country: 'Nigeria' },
  'maiduguri': { lat: 11.8469, lng: 13.1571, country: 'Nigeria' },
  'zaria': { lat: 11.0748, lng: 7.7126, country: 'Nigeria' },
  'aba': { lat: 5.1023, lng: 7.3582, country: 'Nigeria' },
  'jos': { lat: 9.8965, lng: 8.8583, country: 'Nigeria' },
  'ilorin': { lat: 8.4966, lng: 4.5421, country: 'Nigeria' },
  'enugu': { lat: 6.4424, lng: 7.4934, country: 'Nigeria' },
  'calabar': { lat: 4.9631, lng: 8.3246, country: 'Nigeria' },
  'uyo': { lat: 5.0382, lng: 7.9268, country: 'Nigeria' },
  'warri': { lat: 5.5493, lng: 5.7537, country: 'Nigeria' },
  'owo': { lat: 7.1911, lng: 5.5857, country: 'Nigeria' },
  'akure': { lat: 7.2504, lng: 5.196, country: 'Nigeria' },
  'ado ekiti': { lat: 7.6213, lng: 5.2217, country: 'Nigeria' },
  'osogbo': { lat: 7.5566, lng: 4.5554, country: 'Nigeria' },
  'abeokuta': { lat: 7.1499, lng: 3.3437, country: 'Nigeria' },
  'sokoto': { lat: 13.0609, lng: 5.2409, country: 'Nigeria' },

  // Nigerian states
  'lagos state': { lat: 6.3951, lng: 3.3841, country: 'Nigeria' },
  'rivers state': { lat: 4.7581, lng: 7.0114, country: 'Nigeria' },
  'oyo state': { lat: 8.1554, lng: 3.5992, country: 'Nigeria' },
  'ogun state': { lat: 7.2744, lng: 3.3731, country: 'Nigeria' },
  'kaduna state': { lat: 10.3966, lng: 7.7011, country: 'Nigeria' },
  'kano state': { lat: 11.9314, lng: 8.5336, country: 'Nigeria' },
  'delta state': { lat: 5.5372, lng: 5.7849, country: 'Nigeria' },
  'edo state': { lat: 6.6211, lng: 5.9349, country: 'Nigeria' },
  'anambra state': { lat: 6.2103, lng: 6.9242, country: 'Nigeria' },
  'imo state': { lat: 5.4798, lng: 7.0265, country: 'Nigeria' },
  'enugu state': { lat: 6.4464, lng: 7.5014, country: 'Nigeria' },
  'cross river state': { lat: 5.7423, lng: 8.3546, country: 'Nigeria' },
  'akwa ibom state': { lat: 5.0136, lng: 7.8809, country: 'Nigeria' },
  'oyo': { lat: 8.1554, lng: 3.5992, country: 'Nigeria' },
  'ondo': { lat: 7.0962, lng: 5.0579, country: 'Nigeria' },
  'ondo state': { lat: 7.0962, lng: 5.0579, country: 'Nigeria' },
  'ekiti state': { lat: 7.6551, lng: 5.2264, country: 'Nigeria' },
  'kwara state': { lat: 8.6442, lng: 4.6154, country: 'Nigeria' },
  'niger state': { lat: 9.6158, lng: 6.5656, country: 'Nigeria' },
  'plateau state': { lat: 9.2002, lng: 9.7531, country: 'Nigeria' },
  'borno state': { lat: 12.0016, lng: 13.1678, country: 'Nigeria' },

  // ── Kenya ──────────────────────────────────────────────────────────────
  'nairobi': { lat: -1.2921, lng: 36.8219, country: 'Kenya' },
  'mombasa': { lat: -4.0435, lng: 39.6682, country: 'Kenya' },
  'kisumu': { lat: -0.0917, lng: 34.768, country: 'Kenya' },
  'kakamega': { lat: 0.2838, lng: 34.7519, country: 'Kenya' },
  'nakuru': { lat: -0.3031, lng: 36.080, country: 'Kenya' },
  'eldoret': { lat: 0.5143, lng: 35.2698, country: 'Kenya' },
  'nyeri': { lat: -0.4202, lng: 36.9441, country: 'Kenya' },
  'thika': { lat: -1.0333, lng: 37.0689, country: 'Kenya' },
  'malindi': { lat: -3.2174, lng: 40.1167, country: 'Kenya' },
  'kitale': { lat: 1.0157, lng: 35.0065, country: 'Kenya' },
  'machakos': { lat: -1.5169, lng: 37.2615, country: 'Kenya' },
  'meru': { lat: 0.0481, lng: 37.6537, country: 'Kenya' },
  'garissa': { lat: -0.4528, lng: 39.646, country: 'Kenya' },
  'lamu': { lat: -2.2717, lng: 40.902, country: 'Kenya' },

  // ── Bangladesh ─────────────────────────────────────────────────────────
  'dhaka': { lat: 23.8103, lng: 90.4125, country: 'Bangladesh' },
  'chittagong': { lat: 22.3569, lng: 91.7832, country: 'Bangladesh' },
  'sylhet': { lat: 24.8949, lng: 91.8687, country: 'Bangladesh' },
  'rajshahi': { lat: 24.3745, lng: 88.6042, country: 'Bangladesh' },
  'khulna': { lat: 22.8456, lng: 89.5403, country: 'Bangladesh' },
  'comilla': { lat: 23.4682, lng: 91.1786, country: 'Bangladesh' },
  'rangpur': { lat: 25.7439, lng: 89.2752, country: 'Bangladesh' },
  'mymensingh': { lat: 24.7471, lng: 90.403, country: 'Bangladesh' },
  'barishal': { lat: 22.6843, lng: 90.3563, country: 'Bangladesh' },
  'gazipur': { lat: 23.9998, lng: 90.4196, country: 'Bangladesh' },
  'narayanganj': { lat: 23.6337, lng: 90.4965, country: 'Bangladesh' },
  'cox bazar': { lat: 21.4272, lng: 92.0058, country: 'Bangladesh' },

  // ── Pakistan ───────────────────────────────────────────────────────────
  'karachi': { lat: 24.8607, lng: 67.0011, country: 'Pakistan' },
  'lahore': { lat: 31.5204, lng: 74.3587, country: 'Pakistan' },
  'islamabad': { lat: 33.6844, lng: 73.0479, country: 'Pakistan' },
  'rawalpindi': { lat: 33.5651, lng: 73.0169, country: 'Pakistan' },
  'faisalabad': { lat: 31.4504, lng: 73.135, country: 'Pakistan' },
  'multan': { lat: 30.1575, lng: 71.5249, country: 'Pakistan' },
  'peshawar': { lat: 34.0151, lng: 71.5249, country: 'Pakistan' },
  'quetta': { lat: 30.1798, lng: 66.975, country: 'Pakistan' },
  'sialkot': { lat: 32.4945, lng: 74.5229, country: 'Pakistan' },
  'gujranwala': { lat: 32.1877, lng: 74.1945, country: 'Pakistan' },
  'hyderabad pakistan': { lat: 25.396, lng: 68.3578, country: 'Pakistan' },
  'bahawalpur': { lat: 29.3956, lng: 71.6836, country: 'Pakistan' },
  'sargodha': { lat: 32.074, lng: 72.6861, country: 'Pakistan' },
  'sukkur': { lat: 27.7052, lng: 68.8574, country: 'Pakistan' },
  'abbottabad': { lat: 34.1688, lng: 73.2215, country: 'Pakistan' },
  'mardan': { lat: 34.198, lng: 72.0404, country: 'Pakistan' },

  // ── Saudi Arabia ───────────────────────────────────────────────────────
  'riyadh': { lat: 24.7136, lng: 46.6753, country: 'Saudi Arabia' },
  'jeddah': { lat: 21.4858, lng: 39.1925, country: 'Saudi Arabia' },
  'mecca': { lat: 21.3891, lng: 39.8579, country: 'Saudi Arabia' },
  'makkah': { lat: 21.3891, lng: 39.8579, country: 'Saudi Arabia' },
  'medina': { lat: 24.5247, lng: 39.5692, country: 'Saudi Arabia' },
  'madinah': { lat: 24.5247, lng: 39.5692, country: 'Saudi Arabia' },
  'dammam': { lat: 26.3927, lng: 49.9777, country: 'Saudi Arabia' },
  'khobar': { lat: 26.2172, lng: 50.1971, country: 'Saudi Arabia' },
  'taif': { lat: 21.4317, lng: 40.4601, country: 'Saudi Arabia' },
  'tabuk': { lat: 28.3838, lng: 36.5588, country: 'Saudi Arabia' },
  'buraidah': { lat: 26.3358, lng: 43.9757, country: 'Saudi Arabia' },
  'abha': { lat: 18.2164, lng: 42.5053, country: 'Saudi Arabia' },
  'yanbu': { lat: 24.0838, lng: 38.0638, country: 'Saudi Arabia' },
  'najran': { lat: 17.4933, lng: 44.1276, country: 'Saudi Arabia' },
  'jizan': { lat: 16.8894, lng: 42.5613, country: 'Saudi Arabia' },
  'hail': { lat: 27.5316, lng: 41.6966, country: 'Saudi Arabia' },
  'al ahsa': { lat: 25.3599, lng: 49.5747, country: 'Saudi Arabia' },

  // ── Kuwait ─────────────────────────────────────────────────────────────
  'kuwait city': { lat: 29.3759, lng: 47.9774, country: 'Kuwait' },
  'kuwait': { lat: 29.3759, lng: 47.9774, country: 'Kuwait' },
  'hawally': { lat: 29.334, lng: 47.9989, country: 'Kuwait' },
  'salmiya': { lat: 29.3363, lng: 48.0821, country: 'Kuwait' },
  'jahra': { lat: 29.3344, lng: 47.6739, country: 'Kuwait' },
  'farwaniya': { lat: 29.2738, lng: 47.9453, country: 'Kuwait' },
  'mangaf': { lat: 29.1042, lng: 48.1297, country: 'Kuwait' },
  'fahaheel': { lat: 29.0833, lng: 48.1333, country: 'Kuwait' },

  // ── China ──────────────────────────────────────────────────────────────
  'beijing': { lat: 39.9042, lng: 116.4074, country: 'China' },
  'shanghai': { lat: 31.2304, lng: 121.4737, country: 'China' },
  'guangzhou': { lat: 23.1291, lng: 113.2644, country: 'China' },
  'shenzhen': { lat: 22.5431, lng: 114.0579, country: 'China' },
  'chengdu': { lat: 30.5728, lng: 104.0668, country: 'China' },
  'wuhan': { lat: 30.5928, lng: 114.3055, country: 'China' },
  'hangzhou': { lat: 30.2741, lng: 120.1551, country: 'China' },
  'nanjing': { lat: 32.0603, lng: 118.7969, country: 'China' },
  'chongqing': { lat: 29.4316, lng: 106.9123, country: 'China' },
  'tianjin': { lat: 39.3434, lng: 117.3616, country: 'China' },
  'xian': { lat: 34.2637, lng: 108.9389, country: 'China' },
  "xi'an": { lat: 34.2637, lng: 108.9389, country: 'China' },
  'suzhou': { lat: 31.299, lng: 120.5853, country: 'China' },
  'dongguan': { lat: 23.0207, lng: 113.7518, country: 'China' },
  'foshan': { lat: 23.0218, lng: 113.1219, country: 'China' },
  'zhengzhou': { lat: 34.7466, lng: 113.6253, country: 'China' },
  'changsha': { lat: 28.228, lng: 112.9388, country: 'China' },
  'shenyang': { lat: 41.8057, lng: 123.4315, country: 'China' },
  'harbin': { lat: 45.8038, lng: 126.535, country: 'China' },
  'dalian': { lat: 38.914, lng: 121.6147, country: 'China' },
  'kunming': { lat: 25.0389, lng: 102.7183, country: 'China' },
  'qingdao': { lat: 36.0671, lng: 120.3826, country: 'China' },
  'xiamen': { lat: 24.4798, lng: 118.0894, country: 'China' },
  'nanning': { lat: 22.817, lng: 108.3665, country: 'China' },

  // ── Syria ──────────────────────────────────────────────────────────────
  'damascus': { lat: 33.5138, lng: 36.2765, country: 'Syria' },
  'aleppo': { lat: 36.2021, lng: 37.1343, country: 'Syria' },
  'homs': { lat: 34.7324, lng: 36.7137, country: 'Syria' },
  'latakia': { lat: 35.5317, lng: 35.7918, country: 'Syria' },
  'hama': { lat: 35.1318, lng: 36.7514, country: 'Syria' },
  'tartus': { lat: 34.889, lng: 35.8864, country: 'Syria' },
  'deir ez zor': { lat: 35.3315, lng: 40.1444, country: 'Syria' },
  'idlib': { lat: 35.9316, lng: 36.6355, country: 'Syria' },
  'daraa': { lat: 32.6259, lng: 36.102, country: 'Syria' },
  'al hasakah': { lat: 36.5059, lng: 40.7375, country: 'Syria' },

  // ── Australia ──────────────────────────────────────────────────────────
  'sydney': { lat: -33.8688, lng: 151.2093, country: 'Australia' },
  'melbourne': { lat: -37.8136, lng: 144.9631, country: 'Australia' },
  'brisbane': { lat: -27.4698, lng: 153.0251, country: 'Australia' },
  'perth': { lat: -31.9505, lng: 115.8605, country: 'Australia' },
  'adelaide': { lat: -34.9285, lng: 138.6007, country: 'Australia' },
  'gold coast': { lat: -28.0167, lng: 153.4, country: 'Australia' },
  'canberra': { lat: -35.2809, lng: 149.13, country: 'Australia' },
  'hobart': { lat: -42.8821, lng: 147.3272, country: 'Australia' },
  'darwin': { lat: -12.4634, lng: 130.8456, country: 'Australia' },
  'newcastle': { lat: -32.9267, lng: 151.7789, country: 'Australia' },
  ' wollongong': { lat: -34.4246, lng: 150.8931, country: 'Australia' },
  'geelong': { lat: -38.1471, lng: 144.3607, country: 'Australia' },
  'townsville': { lat: -19.259, lng: 146.8167, country: 'Australia' },
  'cairns': { lat: -16.9186, lng: 145.7781, country: 'Australia' },

  // ── United States ──────────────────────────────────────────────────────
  'new york': { lat: 40.7128, lng: -74.006, country: 'United States' },
  'los angeles': { lat: 34.0522, lng: -118.2437, country: 'United States' },
  'chicago': { lat: 41.8781, lng: -87.6298, country: 'United States' },
  'houston': { lat: 29.7604, lng: -95.3698, country: 'United States' },
  'phoenix': { lat: 33.4484, lng: -112.074, country: 'United States' },
  'philadelphia': { lat: 39.9526, lng: -75.1652, country: 'United States' },
  'san antonio': { lat: 29.4241, lng: -98.4936, country: 'United States' },
  'san diego': { lat: 32.7157, lng: -117.1611, country: 'United States' },
  'dallas': { lat: 32.7767, lng: -96.797, country: 'United States' },
  'austin': { lat: 30.2672, lng: -97.7431, country: 'United States' },
  'san francisco': { lat: 37.7749, lng: -122.4194, country: 'United States' },
  'seattle': { lat: 47.6062, lng: -122.3321, country: 'United States' },
  'denver': { lat: 39.7392, lng: -104.9903, country: 'United States' },
  'boston': { lat: 42.3601, lng: -71.0589, country: 'United States' },
  'atlanta': { lat: 33.749, lng: -84.388, country: 'United States' },
  'miami': { lat: 25.7617, lng: -80.1918, country: 'United States' },
  'washington': { lat: 38.9072, lng: -77.0369, country: 'United States' },
  'washington dc': { lat: 38.9072, lng: -77.0369, country: 'United States' },
  'portland': { lat: 45.5152, lng: -122.6784, country: 'United States' },
  'las vegas': { lat: 36.1699, lng: -115.1398, country: 'United States' },
  'nashville': { lat: 36.1627, lng: -86.7816, country: 'United States' },
  'detroit': { lat: 42.3314, lng: -83.0458, country: 'United States' },
  'minneapolis': { lat: 44.9778, lng: -93.265, country: 'United States' },
  'orlando': { lat: 28.5383, lng: -81.3792, country: 'United States' },
  'tampa': { lat: 27.9506, lng: -82.4572, country: 'United States' },
  'baltimore': { lat: 39.2904, lng: -76.6122, country: 'United States' },

  // ── United Arab Emirates ───────────────────────────────────────────────
  'dubai': { lat: 25.2048, lng: 55.2708, country: 'United Arab Emirates' },
  'abu dhabi': { lat: 24.4539, lng: 54.3773, country: 'United Arab Emirates' },
  'sharjah': { lat: 25.3463, lng: 55.4209, country: 'United Arab Emirates' },
  'ajman': { lat: 25.4052, lng: 55.5136, country: 'United Arab Emirates' },
  'ras al khaimah': { lat: 25.7895, lng: 55.9432, country: 'United Arab Emirates' },
  'fujairah': { lat: 25.1288, lng: 56.3264, country: 'United Arab Emirates' },
  'umm al quwain': { lat: 25.5647, lng: 55.5552, country: 'United Arab Emirates' },
  'al ain': { lat: 24.1915, lng: 55.7606, country: 'United Arab Emirates' },

  // ── United Kingdom ─────────────────────────────────────────────────────
  'london': { lat: 51.5074, lng: -0.1278, country: 'United Kingdom' },
  'birmingham': { lat: 52.4862, lng: -1.8904, country: 'United Kingdom' },
  'manchester': { lat: 53.4808, lng: -2.2426, country: 'United Kingdom' },
  'liverpool': { lat: 53.4084, lng: -2.9916, country: 'United Kingdom' },
  'leeds': { lat: 53.7964, lng: -1.5479, country: 'United Kingdom' },
  'glasgow': { lat: 55.8642, lng: -4.2518, country: 'United Kingdom' },
  'edinburgh': { lat: 55.9533, lng: -3.1883, country: 'United Kingdom' },
  'bristol': { lat: 51.4545, lng: -2.5879, country: 'United Kingdom' },
  'cardiff': { lat: 51.4816, lng: -3.1791, country: 'United Kingdom' },

  // ── Other notable cities ───────────────────────────────────────────────
  'cairo': { lat: 30.0444, lng: 31.2357, country: 'Egypt' },
  'doha': { lat: 25.2854, lng: 51.531, country: 'Qatar' },
  'muscat': { lat: 23.588, lng: 58.3829, country: 'Oman' },
  'manama': { lat: 26.2285, lng: 50.586, country: 'Bahrain' },
  'amman': { lat: 31.9454, lng: 35.9284, country: 'Jordan' },
  'beirut': { lat: 33.8938, lng: 35.5018, country: 'Lebanon' },
  'baghdad': { lat: 33.3152, lng: 44.3661, country: 'Iraq' },
  'istanbul': { lat: 41.0082, lng: 28.9784, country: 'Turkey' },
  'ankara': { lat: 39.9334, lng: 32.8597, country: 'Turkey' },
  'tel aviv': { lat: 32.0853, lng: 34.7818, country: 'Israel' },
  'jerusalem': { lat: 31.7683, lng: 35.2137, country: 'Israel' },
  'kuala lumpur': { lat: 3.139, lng: 101.6869, country: 'Malaysia' },
  'singapore': { lat: 1.3521, lng: 103.8198, country: 'Singapore' },
  'manila': { lat: 14.5995, lng: 120.9842, country: 'Philippines' },
  'jakarta': { lat: -6.2088, lng: 106.8456, country: 'Indonesia' },
  'bangkok': { lat: 13.7563, lng: 100.5018, country: 'Thailand' },
  'kathmandu': { lat: 27.7172, lng: 85.324, country: 'Nepal' },
  'colombo': { lat: 6.9271, lng: 79.8612, country: 'Sri Lanka' },
  'yangon': { lat: 16.8661, lng: 96.1951, country: 'Myanmar' },
  'toronto': { lat: 43.6532, lng: -79.3832, country: 'Canada' },
  'vancouver': { lat: 49.2827, lng: -123.1207, country: 'Canada' },
  'montreal': { lat: 45.5017, lng: -73.5673, country: 'Canada' },
  'auckland': { lat: -36.8485, lng: 174.7633, country: 'New Zealand' },
  'dublin': { lat: 53.3498, lng: -6.2603, country: 'Ireland' },
  'berlin': { lat: 52.52, lng: 13.405, country: 'Germany' },
  'munich': { lat: 48.1351, lng: 11.582, country: 'Germany' },
  'frankfurt': { lat: 50.1109, lng: 8.6821, country: 'Germany' },
  'paris': { lat: 48.8566, lng: 2.3522, country: 'France' },
  'lyon': { lat: 45.764, lng: 4.8357, country: 'France' },
  'marseille': { lat: 43.2965, lng: 5.3698, country: 'France' },
  'rome': { lat: 41.9028, lng: 12.4964, country: 'Italy' },
  'milan': { lat: 45.4642, lng: 9.19, country: 'Italy' },
  'madrid': { lat: 40.4168, lng: -3.7038, country: 'Spain' },
  'barcelona': { lat: 41.3874, lng: 2.1686, country: 'Spain' },
  'amsterdam': { lat: 52.3676, lng: 4.9041, country: 'Netherlands' },
  'stockholm': { lat: 59.3293, lng: 18.0686, country: 'Sweden' },
  'oslo': { lat: 59.9139, lng: 10.7522, country: 'Norway' },
  'tokyo': { lat: 35.6762, lng: 139.6503, country: 'Japan' },
  'seoul': { lat: 37.5665, lng: 126.978, country: 'South Korea' },
  'moscow': { lat: 55.7558, lng: 37.6173, country: 'Russia' },
  'sao paulo': { lat: -23.5505, lng: -46.6333, country: 'Brazil' },
  'rio de janeiro': { lat: -22.9068, lng: -43.1729, country: 'Brazil' },
  'mexico city': { lat: 19.4326, lng: -99.1332, country: 'Mexico' },
  'buenos aires': { lat: -34.6037, lng: -58.3816, country: 'Argentina' },
  'addis ababa': { lat: 9.025, lng: 38.7469, country: 'Ethiopia' },
  'accra': { lat: 5.6037, lng: -0.187, country: 'Ghana' },
  'dar es salaam': { lat: -6.7924, lng: 39.2083, country: 'Tanzania' },
  'kampala': { lat: 0.3476, lng: 32.5825, country: 'Uganda' },
  'douala': { lat: 4.0511, lng: 9.7679, country: 'Cameroon' },
  'dakar': { lat: 14.7167, lng: -17.4677, country: 'Senegal' },
  'kigali': { lat: -1.9403, lng: 29.8739, country: 'Rwanda' },
  'johannesburg': { lat: -26.2041, lng: 28.0473, country: 'South Africa' },
  'cape town': { lat: -33.9249, lng: 18.4241, country: 'South Africa' },
  'pretoria': { lat: -25.7479, lng: 28.2293, country: 'South Africa' },
};

// ─── Country Name → Code mapping ─────────────────────────────────────────────

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  'india': 'IN',
  'nigeria': 'NG',
  'kenya': 'KE',
  'kuwait': 'KW',
  'bangladesh': 'BD',
  'china': 'CN',
  'pakistan': 'PK',
  'saudi arabia': 'SA',
  'syria': 'SY',
  'australia': 'AU',
  'united states': 'US',
  'usa': 'US',
  'us': 'US',
  'united arab emirates': 'AE',
  'uae': 'AE',
  'united kingdom': 'GB',
  'uk': 'GB',
  'england': 'GB',
  'canada': 'CA',
  'germany': 'DE',
  'france': 'FR',
  'qatar': 'QA',
  'oman': 'OM',
  'bahrain': 'BH',
  'jordan': 'JO',
  'lebanon': 'LB',
  'iraq': 'IQ',
  'egypt': 'EG',
  'ghana': 'GH',
  'south africa': 'ZA',
  'tanzania': 'TZ',
  'uganda': 'UG',
  'malaysia': 'MY',
  'singapore': 'SG',
  'philippines': 'PH',
  'indonesia': 'ID',
  'thailand': 'TH',
  'nepal': 'NP',
  'sri lanka': 'LK',
  'myanmar': 'MM',
  'afghanistan': 'AF',
  'iran': 'IR',
  'turkey': 'TR',
  'italy': 'IT',
  'spain': 'ES',
  'netherlands': 'NL',
  'sweden': 'SE',
  'norway': 'NO',
  'russia': 'RU',
  'brazil': 'BR',
  'mexico': 'MX',
  'argentina': 'AR',
  'japan': 'JP',
  'south korea': 'KR',
  'korea': 'KR',
  'new zealand': 'NZ',
  'ireland': 'IE',
  'portugal': 'PT',
  'poland': 'PL',
  'switzerland': 'CH',
  'austria': 'AT',
  'belgium': 'BE',
  'denmark': 'DK',
  'finland': 'FI',
  'czech republic': 'CZ',
  'israel': 'IL',
  'cyprus': 'CY',
  'malta': 'MT',
  'greece': 'GR',
  'hungary': 'HU',
  'romania': 'RO',
  'ukraine': 'UA',
  'ethiopia': 'ET',
  'cameroon': 'CM',
  'senegal': 'SN',
  'ivory coast': 'CI',
  'cote d\'ivoire': 'CI',
  'rwanda': 'RW',
  'mauritius': 'MU',
  'seychelles': 'SC',
};

// ─── Geocoding Functions ─────────────────────────────────────────────────────

/**
 * Geocodes an ISO country code to a centroid coordinate.
 * Returns null if the code is not recognized.
 */
export function geocodeCountryCode(code: string): GeoResult & { country: string } | null {
  const normalized = code.trim().toUpperCase();
  const centroid = COUNTRY_CENTROIDS[normalized];
  if (!centroid) return null;
  return { lat: centroid.lat, lng: centroid.lng, country: centroid.country };
}

/**
 * Parses a human-readable location string (e.g., "Chennai, Tamil Nadu, India")
 * and returns geocoded coordinates with optional city/country names.
 *
 * Strategy:
 * 1. Split by comma, trim parts
 * 2. Try to match the LAST part as a country name → get country centroid
 * 3. Try to match the FIRST part as a city → get city coordinates
 * 4. Return city coords if found (more precise), otherwise country centroid
 * 5. If nothing matches, return null
 */
export function geocodeLocation(locationString: string): GeoResult | null {
  if (!locationString || typeof locationString !== 'string') return null;

  const cleaned = locationString.trim();
  if (!cleaned) return null;

  const parts = cleaned
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (parts.length === 0) return null;

  // Single part — could be a country name, state, or city
  if (parts.length === 1) {
    const single = parts[0].toLowerCase();

    // Try city first (more specific)
    const cityMatch = CITY_COORDS[single];
    if (cityMatch) {
      return { lat: cityMatch.lat, lng: cityMatch.lng, city: parts[0], country: cityMatch.country };
    }

    // Try country code (2 uppercase chars)
    if (single.length === 2 && single === single.toUpperCase()) {
      const cc = geocodeCountryCode(single);
      if (cc) return cc;
    }

    // Try country name
    const code = COUNTRY_NAME_TO_CODE[single];
    if (code) {
      const centroid = COUNTRY_CENTROIDS[code];
      if (centroid) return { lat: centroid.lat, lng: centroid.lng, country: centroid.country };
    }

    // Try matching the single part against city names with spaces
    const cityWithSpace = findCityFuzzy(single);
    if (cityWithSpace) return cityWithSpace;

    return null;
  }

  // Multiple parts — try to parse "City, State, Country" pattern
  const lastPart = parts[parts.length - 1].toLowerCase();
  const firstPart = parts[0].toLowerCase();

  // Try to identify country from the last part
  let countryCode: string | null = null;
  let countryName: string | null = null;

  // Check if last part is a known country name
  const lastPartCode = COUNTRY_NAME_TO_CODE[lastPart];
  if (lastPartCode) {
    countryCode = lastPartCode;
    countryName = COUNTRY_CENTROIDS[countryCode]?.country || parts[parts.length - 1];
  }
  // Check if last part is a 2-letter country code
  else if (lastPart.length === 2 && lastPart === lastPart.toUpperCase()) {
    const cc = geocodeCountryCode(lastPart);
    if (cc) {
      countryCode = lastPart.toUpperCase();
      countryName = cc.country;
    }
  }
  // Check if any part is a country name (scan all parts)
  else {
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i].toLowerCase();
      const pCode = COUNTRY_NAME_TO_CODE[p];
      if (pCode) {
        countryCode = pCode;
        countryName = COUNTRY_CENTROIDS[pCode]?.country || parts[i];
        break;
      }
      // Check for 2-letter code
      if (p.length === 2 && p === p.toUpperCase()) {
        const cc = geocodeCountryCode(p);
        if (cc) {
          countryCode = p.toUpperCase();
          countryName = cc.country;
          break;
        }
      }
    }
  }

  // Try to identify city from the first part
  let cityMatch: (GeoCoord & { country: string }) | null = null;
  let matchedCityName: string | null = null;

  // Direct match on first part
  const directCity = CITY_COORDS[firstPart];
  if (directCity) {
    cityMatch = directCity;
    matchedCityName = parts[0];
  } else {
    // Try first two parts combined (e.g., "New Delhi", "San Diego")
    for (let len = Math.min(3, parts.length - 1); len >= 2; len--) {
      const combined = parts.slice(0, len).join(' ').toLowerCase();
      const combinedMatch = CITY_COORDS[combined];
      if (combinedMatch) {
        cityMatch = combinedMatch;
        matchedCityName = parts.slice(0, len).join(' ');
        break;
      }
    }
  }

  // If we found a city match, return it (most precise)
  if (cityMatch) {
    return {
      lat: cityMatch.lat,
      lng: cityMatch.lng,
      city: matchedCityName || undefined,
      country: cityMatch.country,
    };
  }

  // If we found a country, return its centroid
  if (countryCode) {
    const centroid = COUNTRY_CENTROIDS[countryCode];
    if (centroid) {
      return { lat: centroid.lat, lng: centroid.lng, country: countryName || centroid.country };
    }
  }

  // Last resort: try all parts as city names
  for (const part of parts) {
    const lower = part.toLowerCase();
    const match = CITY_COORDS[lower];
    if (match) {
      return { lat: match.lat, lng: match.lng, city: part, country: match.country };
    }
  }

  // Fuzzy match on the full string
  return findCityFuzzy(cleaned.toLowerCase());
}

/**
 * Fuzzy matching for city names — tries to find a city key that contains
 * the input or vice versa. Useful for handling slight variations.
 */
function findCityFuzzy(input: string): GeoResult | null {
  // Try exact match first (shouldn't reach here if geocodeLocation worked)
  const exact = CITY_COORDS[input];
  if (exact) return { lat: exact.lat, lng: exact.lng, country: exact.country };

  // Try matching input against city keys that contain it or vice versa
  const cityKeys = Object.keys(CITY_COORDS);
  for (const key of cityKeys) {
    if (key.includes(input) || input.includes(key)) {
      const match = CITY_COORDS[key];
      if (match) {
        return { lat: match.lat, lng: match.lng, city: key, country: match.country };
      }
    }
  }

  // Try matching against country names
  const code = COUNTRY_NAME_TO_CODE[input];
  if (code) {
    const centroid = COUNTRY_CENTROIDS[code];
    if (centroid) return { lat: centroid.lat, lng: centroid.lng, country: centroid.country };
  }

  return null;
}

/**
 * Returns a list of all supported country codes.
 */
export function getSupportedCountryCodes(): string[] {
  return Object.keys(COUNTRY_CENTROIDS);
}

/**
 * Returns a list of all known city names.
 */
export function getKnownCityNames(): string[] {
  return Object.keys(CITY_COORDS);
}

/**
 * Gets the country code for a country name. Returns null if not found.
 */
export function getCountryCode(countryName: string): string | null {
  return COUNTRY_NAME_TO_CODE[countryName.toLowerCase()] || null;
}
