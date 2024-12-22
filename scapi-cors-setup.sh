#!/bin/bash
set -euo pipefail

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --id)
            SFCC_OAUTH_CLIENT_ID="$2"
            shift 2
            ;;
        --secret)
            SFCC_OAUTH_CLIENT_SECRET="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 --id <client_id> --secret <client_secret>"
            exit 1
            ;;
    esac
done

# Verify required arguments
if [ -z "${SFCC_OAUTH_CLIENT_ID:-}" ] || [ -z "${SFCC_OAUTH_CLIENT_SECRET:-}" ]; then
    echo "Error: Both --id and --secret are required"
    echo "Usage: $0 --id <client_id> --secret <client_secret>"
    exit 1
fi

# Remove the hardcoded exports and use the arguments
export "SFCC_CREDENTIALS=${SFCC_OAUTH_CLIENT_ID}:${SFCC_OAUTH_CLIENT_SECRET}"

export "SFCC_REALM_ID=zzrf"
export "SFCC_INSTANCE_ID=001"
export SFCC_OAUTH_SCOPES="sfcc.cors-preferences.rw"

export "ORG_ID=f_ecom_zzrf_001"

response=$(curl "https://account.demandware.com/dwsso/oauth2/access_token" \
  --request 'POST' \
  --user "$SFCC_CREDENTIALS" \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data "grant_type=client_credentials" \
  --data-urlencode "scope=SALESFORCE_COMMERCE_API:${SFCC_REALM_ID}_${SFCC_INSTANCE_ID} $SFCC_OAUTH_SCOPES" \
  --silent)

echo "$response"

# Extract the access_token using jq (assuming it's installed)
access_token=$(echo "$response" | jq -r '.access_token')

# Export the access_token as a variable with Bearer prefix
export TOKEN="$access_token"

echo $TOKEN

# After getting the access token, add the CORS API call
shortcode="kv7kzm78" # Using your realm ID as the shortcode
version="v1"     # Current CORS API version


# make a GET call to get the CORS configuration
cors_response=$(curl "https://${shortcode}.api.commercecloud.salesforce.com/configuration/cors/${version}/organizations/${ORG_ID}/cors?siteId=RefArchGlobal" \
  --request 'GET' \
  --header "Authorization: Bearer ${TOKEN}" \
  --header 'Content-Type: application/json' \
  --silent)

echo "CORS Configuration:"
echo "$cors_response" | jq '.'

# UNCOMMENT below to make a change to the CORS configuration

# make a PUT call to set the CORS allow-listed origins

# cors_response=$(curl "https://${shortcode}.api.commercecloud.salesforce.com/configuration/cors/${version}/organizations/${ORG_ID}/cors?siteId=RefArchGlobal" \
#   --request 'PUT' \
#   --header "Authorization: Bearer ${TOKEN}" \
#   --header 'Content-Type: application/json' \
#   --silent  \
#   -d "{
#   \"corsClientPreferences\": [
#     {
#       \"clientId\": \"${SFCC_OAUTH_CLIENT_ID}\",
#       \"origins\": [
#         \"https://scaffold-pwa-254-cors-demo.mobify-storefront.com\"
#       ]
#     }
#   ]
# }")

# echo "CORS Configuration:"
# echo "$cors_response" | jq '.'
