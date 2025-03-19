#!/bin/bash
# BJNL-prd test
set -eu

CODE='performance-001'
ORG='f_ecom_bjnl_prd'
CLIENT='e7e22b7f-a904-4f3a-8022-49dbee696485'
REDIRECT='http://localhost:3000/callback'
SITE='RefArch'

BASE="https://$CODE.api.commercecloud.salesforce.com"
BASE_AUTH="$BASE/shopper/auth/v1/organizations/$ORG"

echo '--> 1. Get a SLAS JWT...'
VERIFIER=$(
    openssl rand -base64 96 | tr -d '\n' | tr '/+' '_-' | tr -d '='
)
CHALLENGE=$(
    echo -n $VERIFIER | openssl dgst -binary -sha256 | openssl base64 -A | tr '/' '_' | tr '+' '-' | tr -d '='
)

USID_AND_CODE=$(
    curl "$BASE_AUTH/oauth2/authorize" \
        -sSfG \
        -d "redirect_uri=$REDIRECT" \
        -d 'response_type=code' \
        -d 'hint=guest' \
        -d "client_id=$CLIENT" \
        -d "code_challenge=$CHALLENGE" \
        -D- |
        grep -i 'location' | cut -d'?' -f2 | tr -d '\n\r'
)

RESPONSE=$(
    curl "$BASE_AUTH/oauth2/token" \
        -sSfX 'POST' \
        -d "client_id=$CLIENT" \
        -d "channel_id=$SITE" \
        -d "code_verifier=$VERIFIER" \
        -d $USID_AND_CODE \
        -d 'grant_type=authorization_code_pkce' \
        -d "redirect_uri=$REDIRECT"
)
TOKEN=$(echo $RESPONSE | jq -r '.access_token')
echo $TOKEN

echo '--> 2. Get a product'
PRODUCT=$(
    curl "$BASE/search/shopper-search/v1/organizations/$ORG/product-search?siteId=$SITE&refine=cgid%3Dmens&sort=best-matches&currency=USD&locale=en-US&expand=promotions%2Cvariations%2Cprices%2Cimages%2Cpage_meta_tags%2Ccustom_properties&allImages=true&perPricebook=true&allVariationProperties=true&offset=0&limit=3" \
        -sH "Authorization: Bearer $TOKEN"
)

echo $PRODUCT
echo '^ This should return product information but instead has an error about the meta tag'