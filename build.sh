#!/bin/bash
# Package the extension for deployment to the Chrome Web Store

# Get version
version=$(grep -oh '[0-9]\+.[0-9]\+.[0-9]\+.[0-9]\+' src/manifest.json)
echo "Building extension v$version..."

# Create ZIP archive
zip -r --quiet $version.zip src
mv $version.zip versions/

echo "...done."
