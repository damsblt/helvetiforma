#!/bin/bash
echo "=== Checking helvetiforma-cms deployment ==="
echo ""
echo "1. Checking if CMS is accessible..."
curl -I https://helvetiforma-cms.vercel.app/admin 2>&1 | head -20
echo ""
echo "2. Checking API endpoint..."
curl -I https://helvetiforma-cms.vercel.app/api/pages 2>&1 | head -20
echo ""
echo "3. Listing Vercel projects..."
vercel projects ls 2>&1 | grep helvetiforma
echo ""
echo "4. Checking deployment logs..."
vercel logs https://helvetiforma-cms.vercel.app/ --output 2>&1 | tail -50



