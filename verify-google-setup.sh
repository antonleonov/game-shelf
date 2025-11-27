#!/bin/bash

echo "🔍 Verifying Google OAuth Setup..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found in root directory"
    exit 1
fi

echo "✅ .env file found"
echo ""

# Check for GOOGLE_CLIENT_ID in .env
if grep -q "GOOGLE_CLIENT_ID=" .env; then
    CLIENT_ID=$(grep "GOOGLE_CLIENT_ID=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
    if [ -z "$CLIENT_ID" ] || [ "$CLIENT_ID" = "your-google-client-id-here" ]; then
        echo "❌ GOOGLE_CLIENT_ID is not set or still has placeholder value"
    else
        echo "✅ GOOGLE_CLIENT_ID is set: ${CLIENT_ID:0:20}..."
    fi
else
    echo "❌ GOOGLE_CLIENT_ID not found in .env"
fi

# Check for NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env
if grep -q "NEXT_PUBLIC_GOOGLE_CLIENT_ID=" .env; then
    NEXT_PUBLIC_ID=$(grep "NEXT_PUBLIC_GOOGLE_CLIENT_ID=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
    if [ -z "$NEXT_PUBLIC_ID" ] || [ "$NEXT_PUBLIC_ID" = "your-google-client-id-here" ]; then
        echo "❌ NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set or still has placeholder value"
    else
        echo "✅ NEXT_PUBLIC_GOOGLE_CLIENT_ID is set: ${NEXT_PUBLIC_ID:0:20}..."
    fi
else
    echo "❌ NEXT_PUBLIC_GOOGLE_CLIENT_ID not found in .env"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Make sure you clicked 'SAVE' in Google Cloud Console"
echo "2. Verify the Client ID in .env matches the one in Google Cloud Console"
echo "3. Restart your containers: docker compose restart frontend"
echo "4. Wait 1-2 minutes for Google changes to propagate"
echo "5. Clear browser cache or use incognito mode"
echo "6. Check browser console for the Client ID:"
echo "   Open DevTools → Console → Type: console.log(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)"

