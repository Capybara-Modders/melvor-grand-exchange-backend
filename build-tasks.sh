#!/etc/bash
# Check if the dependencies required to handle build are installed
if [ $(dpkg-query -W -f='${Status}' jq 2>/dev/null | grep -c "ok installed") -eq 0 ];
then
  echo jq not installed. Install jq to run this script.
  exit 0
fi
if [ $(dpkg-query -W -f='${Status}' zip 2>/dev/null | grep -c "ok installed") -eq 0 ];
then
  echo zip or unzip not installed. Install zip and unzip to run this script.
  exit 0
fi

# Remove existing build files. In retrospect, could probably just remove the entire build folder lol.
TargetPaths=("./build/sqlite.db" "./build/drizzle" "./build/build" "./build/package.json" "./build/logging" "./server.zip")
for TargetPath in ${TargetPaths[@]}; do
  rm -rf -f on $TargetPath
  echo $TargetPath "removed"
done

#Run install, generate and build, fresh.
pnpm install
pnpm run generate
pnpm run build

# Copy build resources into build folder.
cp -r "./drizzle" "./build/"
mkdir "./build/build"
mkdir "./build/logging"
cp "./node_modules/better-sqlite3/build/Release/better_sqlite3.node" "./build/build/"

# Write package.json to the build folder
ver=$(jq -r '.version' package.json)
jq -n --arg ver "$ver" '{name: "noita-mmb", version: $ver, description: "Noitas melvor multiplayer backend", scripts: { run: "node index.js prod"}, main: "index.js", author: "Noitabara"}' > "./build/package.json"
zip -r server.zip build
