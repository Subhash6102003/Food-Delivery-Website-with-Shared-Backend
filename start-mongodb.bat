@echo off
echo Starting MongoDB...
echo Creating data directory if it doesn't exist
mkdir "C:\data\db" 2>nul

echo Attempting to start MongoDB
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath="C:\data\db"

echo If MongoDB failed to start, please check:
echo 1. MongoDB is installed at the path above (adjust if needed)
echo 2. You have permissions to access C:\data\db