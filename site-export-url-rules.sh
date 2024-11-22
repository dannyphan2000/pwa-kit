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
export SFCC_OAUTH_SCOPES="sfcc.sites.export sfcc.jobs.read sfcc.jobs.write"

export "ORG_ID=f_ecom_zzrf_001"

response=$(curl "https://account.demandware.com/dwsso/oauth2/access_token" \
  --request 'POST' \
  --user "$SFCC_CREDENTIALS" \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data "grant_type=client_credentials" \
  --data-urlencode "scope=SALESFORCE_COMMERCE_API:${SFCC_REALM_ID}_${SFCC_INSTANCE_ID} $SFCC_OAUTH_SCOPES" \
  --silent)

# Extract the access_token using jq (assuming it's installed)
access_token=$(echo "$response" | jq -r '.access_token')

# Export the access_token as a variable with Bearer prefix
export TOKEN="$access_token"

# Print the extracted token for verification
# echo "access_token: $TOKEN"

OCAPI_BASE="https://zzrf-001.dx.commercecloud.salesforce.com/s/-/dw/data/v23_2"
WEBDAV_BASE="https://zzrf-001.dx.commercecloud.salesforce.com/on/demandware.servlet/webdav/Sites/Impex/src/instance"

# Make a request to $OCAPI_BASE/jobs/sfcc-site-archive-export/executions
# to get the execution id and wait for it to finish
# Store the response and echo it for debugging
# Store the response and echo it for debugging
RESPONSE=$(curl -s $OCAPI_BASE/jobs/sfcc-site-archive-export/executions \
  -H 'content-type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
        "export_file": "site_archive.zip",
        "overwrite_export_file": true,
        "data_units": {
          "sites": {
            "RefArch": {
              "url_rules": true
            }
          }
        }
      }'
)

echo "Debug - Initial response:"
echo "$RESPONSE"

# Parse the execution id using grep and sed instead of jq
execution_id=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | sed 's/"id":"\([^"]*\)"/\1/')
echo "Debug - Parsed execution ID: $execution_id"

# Verify the execution ID is not null before proceeding
if [ -z "$execution_id" ]; then
    echo "Error: Failed to get execution ID from response"
    echo "Full response was:"
    echo "$RESPONSE"
    exit 1
fi

echo "Starting job execution with ID: $execution_id"

# Poll for job completion
echo "Waiting for job to finish..."
while true; do
    echo "Checking status of job execution $execution_id"

    status_response=$(curl -s "$OCAPI_BASE/jobs/sfcc-site-archive-export/executions/$execution_id" \
        -H "Authorization: Bearer $TOKEN")
    # Parse status and clean it up properly
    status=$(echo "$status_response" | grep -o '"execution_status":"[^"]*"' | head -n 1 | sed 's/"execution_status":"\([^"]*\)"/\1/' | tr -d '\n' | tr -d '\r' | tr -d '[:space:]')
    echo "Current status: $status"

    if [ "$status" = "finished" ] || [ "$status" = "error" ]; then
        echo "Break condition met. Status: '$status'"
        break
    fi
    sleep 5
done

if [ "$status" = "finished" ]; then
    echo "Job completed successfully. Downloading archive..."
    curl -s "$WEBDAV_BASE/site_archive.zip" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/octet-stream" \
        -H "x-dw-client-id: $SFCC_OAUTH_CLIENT_ID" \
        -o site_archive.zip

    echo "Extracting url-rules.xml..."
    unzip -p site_archive.zip site_archive/sites/RefArch/url-rules.xml
else
    echo "Job failed with status: $status"
    exit 1
fi
