export interface LocalBusinessProspect {
  name: string;
  address: string;
  phoneNumber?: string;
  website?: string;
  rating?: number;
  totalReviews?: number;
  mapsUrl?: string;
  isOpenNow?: boolean;
}

export interface SearchLocalBusinessesOptions {
  query: string; // e.g. "dental clinic" or "real estate"
  location?: string; // e.g. "Bangalore" or "Austin, TX"
  maxResults?: number;
}

export interface LocalBusinessSearchResult {
  success: boolean;
  prospects: LocalBusinessProspect[];
  totalFound: number;
  error?: string;
}

/**
 * Searches for local business prospects via Google Places API (New).
 * Ideal for discovering clinics, agencies, contractors, and SMBs to pitch
 * VaniEdge 24/7 AI phone receptionist or web development services.
 */
export async function searchLocalBusinesses(
  options: SearchLocalBusinessesOptions
): Promise<LocalBusinessSearchResult> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const searchQuery = options.location ? `${options.query} in ${options.location}` : options.query;
  const limit = Math.min(options.maxResults || 20, 20);

  if (!apiKey) {
    return {
      success: false,
      prospects: [],
      totalFound: 0,
      error: "GOOGLE_MAPS_API_KEY is not set. Get an API key from Google Cloud Console with Places API enabled.",
    };
  }

  try {
    const url = "https://places.googleapis.com/v1/places:searchText";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.googleMapsUri,places.regularOpeningHours",
      },
      body: JSON.stringify({
        textQuery: searchQuery,
        pageSize: limit,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        prospects: [],
        totalFound: 0,
        error: `Google Places API returned status ${response.status}: ${errorText}`,
      };
    }

    interface GooglePlaceItem {
      displayName?: { text: string };
      formattedAddress?: string;
      nationalPhoneNumber?: string;
      internationalPhoneNumber?: string;
      websiteUri?: string;
      rating?: number;
      userRatingCount?: number;
      googleMapsUri?: string;
      regularOpeningHours?: { openNow?: boolean };
    }

    const data = (await response.json()) as { places?: GooglePlaceItem[] };
    const places = data.places || [];

    const prospects: LocalBusinessProspect[] = places.map((place) => ({
      name: place.displayName?.text || "Unknown Business",
      address: place.formattedAddress || "Address not provided",
      phoneNumber: place.internationalPhoneNumber || place.nationalPhoneNumber,
      website: place.websiteUri,
      rating: place.rating,
      totalReviews: place.userRatingCount,
      mapsUrl: place.googleMapsUri,
      isOpenNow: place.regularOpeningHours?.openNow,
    }));

    return {
      success: true,
      prospects,
      totalFound: prospects.length,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      prospects: [],
      totalFound: 0,
      error: errorMsg,
    };
  }
}
