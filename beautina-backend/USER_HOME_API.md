# User Home API Documentation

## Endpoint

- **Method:** `GET`
- **Path:** `/user/userHome`
- **Middleware:** `checkApiKey`, `checkToken`
- **Controller:** `userController.userHome`
- **Model Function:** `userModel.userHome(req)`

---

## Purpose

This API returns home-screen data for a logged-in customer in a single response:

- Selected location info (city/state/country + selected/default address)
- Available service categories (filtered by search)
- Nearby service providers (filtered by category/search/location/distance)
- Favorite services
- Upcoming bookings

---

## Request Parameters

This is a `GET` API, so values are expected in **query params**.

| Param | Type | Required | Default | Description |
|---|---|---|---|---|
| `address_id` | number | No | - | Specific customer address to use for location context and distance calculation. |
| `category_id` | number | No | - | Filter providers by category. |
| `search` | string | No | `''` | Search text for categories/subcategories/services/provider names/business name. |
| `limit` | number | No | `20` | Max providers returned (clamped to `1..100`). |
| `radius_km` | number | No | `50` | Nearby radius in KM for provider filtering (clamped to `1..500`). |

### Validation

- `address_id`: positive integer (optional)
- `category_id`: positive integer (optional)
- `search`: max 255 chars (optional, can be empty)
- `limit`: integer between 1 and 100 (optional)
- `radius_km`: number between 1 and 500 (optional)

---

## Headers

- `x-api-key: <valid_api_key>`
- `Authorization: Bearer <user_token>`

`checkToken` sets `req.user_id`; this user must be a valid active customer.

---

## How It Works (Exact Flow)

1. **Read auth user**
   - Reads `req.user_id`.
   - If missing, returns operation failed (`missing_user_id`).

2. **Load customer**
   - Fetches customer from `tbl_users` with:
     - `id = req.user_id`
     - `user_role = 'customer'`
     - `is_active = TRUE`
     - `is_deleted = FALSE`
   - If not found, returns `user_not_found`.

3. **Resolve selected address**
   - If `address_id` is provided:
     - Loads that address from `tbl_addresses` for this user only.
     - If not found, returns `address_not_found`.
   - Else:
     - Picks default/latest address by `ORDER BY is_default DESC, id DESC LIMIT 1`.
   - Address lat/lng is used for distance logic.

4. **Prepare normalized values**
   - `searchLike = %search%`
   - `safeLimit = clamp(limit, 1..100)`
   - `safeRadiusKm = clamp(radius_km, 1..500)`
   - Parses selected address coordinates; if both numeric, distance filtering is enabled.

5. **Fetch categories**
   - Returns distinct active categories where approved and active providers have active services.
   - Applies search on category/subcategory/service names.

6. **Fetch service providers**
   - Joins services -> subcategories -> categories -> provider user -> provider profile.
   - Provider must be approved, active, not deleted, and working.
   - Adds favorite status from `tbl_favorites` (`favorite_type='provider'`).
   - Pulls provider coordinates from provider's default/latest address (`tbl_addresses`) using lateral join.
   - Applies filters:
     - `category_id` filter (if provided)
     - `search` filter
     - soft city/state/country matching against customer profile location
     - **distance filter** (if selected lat/lng exists)

7. **Distance formula used**

The provider distance is computed in SQL with this reference-style formula:

```sql
(6371 * acos(
  cos(radians(<selected_lat>)) * cos(radians(CAST(<provider_lat> AS FLOAT))) *
  cos(radians(CAST(<provider_lng> AS FLOAT)) - radians(<selected_lng>)) +
  sin(radians(<selected_lat>)) * sin(radians(CAST(<provider_lat> AS FLOAT)))
))
```

Filter condition:

```sql
distance_km <= radius_km
```

Notes:
- `6371` means Earth radius in KM.
- If user selected coordinates are missing, distance filter is bypassed.
- If provider coordinates are missing/invalid, `distance_km` becomes `NULL`.

8. **Fetch favorite services**
   - Returns up to 10 latest `favorite_type='service'` records with service/provider info.

9. **Fetch upcoming bookings**
   - Returns up to 10 customer bookings with status in `('pending','upcoming')`.
   - Must be active and not deleted.
   - Includes first booking item as `primary_item_name`.

10. **Build final response**
   - Returns `location`, `search_text`, `selected_category_id`, `selected_radius_km`, `service_categories`, `service_providers`, `favorite_services`, and `upcoming_bookings`.

---

## Success Response (Shape)

```json
{
  "code": 1,
  "message": "success",
  "data": {
    "location": {
      "city": "Riyadh",
      "state": "Riyadh",
      "country": "Saudi Arabia",
      "selected_address": {
        "address_id": 12,
        "address": "Olaya Street",
        "latitude": "24.7136",
        "longitude": "46.6753",
        "type": "home",
        "is_default": true
      }
    },
    "search_text": "hair",
    "selected_category_id": 2,
    "selected_radius_km": 20,
    "service_categories": [],
    "service_providers": [],
    "favorite_services": [],
    "upcoming_bookings": []
  }
}
```

---

## Error Cases

- `missing_user_id`
- `user_not_found`
- `address_not_found`
- generic `unsuccess` on server exception

All are returned with HTTP 200 in current project response style, with internal `code` indicating success/failure.

---

## Testing Guide

## 1) Basic call (no filters)

```bash
curl --location --request GET 'http://localhost:3000/v1/user/userHome' \
--header 'x-api-key: YOUR_API_KEY' \
--header 'Authorization: Bearer YOUR_USER_TOKEN'
```

Expected:
- Customer default address (if exists) is selected.
- Providers are sorted by nearest first when selected address has valid coordinates.
- `selected_radius_km` is `50`.

## 2) With all filters

```bash
curl --location --request GET 'http://localhost:3000/v1/user/userHome?address_id=12&category_id=2&search=hair&limit=20&radius_km=15' \
--header 'x-api-key: YOUR_API_KEY' \
--header 'Authorization: Bearer YOUR_USER_TOKEN'
```

Expected:
- Only category `2` providers.
- Search applied on category/subcategory/service/provider/business name.
- Distance formula filters providers to `<= 15 km`.
- At most 20 providers.

## 3) Body object (for QA documentation)

This API is GET, so body is not used by code.  
If your QA tool wants an object, use this as a **logical request object** and send its fields as query params:

```json
{
  "address_id": 12,
  "category_id": 2,
  "search": "hair",
  "limit": 20,
  "radius_km": 15
}
```

Equivalent query string:

```text
?address_id=12&category_id=2&search=hair&limit=20&radius_km=15
```

## 4) Edge tests

- **No address_id + no default address**
  - API still returns data; distance filtering is skipped.
- **Invalid address_id**
  - Returns `address_not_found`.
- **radius_km too low/high**
  - Validator rejects out-of-range values.
- **limit > 100**
  - Value is clamped to 100.

---

## DB Data Needed For Meaningful Nearby Tests

- Customer user with valid token.
- Customer address with valid numeric `latitude` and `longitude`.
- Providers with:
  - active user + approved/active/working profile,
  - active services tied to active category/subcategory,
  - provider address containing valid numeric `latitude` and `longitude`.

Without provider coordinates, distance may be `NULL` and nearby behavior will not be representative.
