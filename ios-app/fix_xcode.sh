#!/bin/bash

# Clean Xcode derived data
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# Clean Xcode module cache
rm -rf ~/Library/Developer/Xcode/DerivedData/ModuleCache.noindex

# Clean Xcode user data (be careful - this removes your window layouts)
# Uncomment if needed:
# rm -rf ~/Library/Developer/Xcode/UserData

echo "Xcode caches cleaned. Please restart Xcode."

