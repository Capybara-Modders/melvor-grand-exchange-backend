rm -rf build/sqlite.db
rm -rf build/drizzle

cp -r ./drizzle build/

zip -r server.zip build/

echo "Done!"