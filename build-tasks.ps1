# Check if the paths below exist, if so delete them so we can recreate them.
$BuildPaths = @("./build/sqlite.db", "./build/drizzle", "./build/build", "./build/package.json")
foreach ($TargetPath in $BuildPaths) {
  if (Test-Path $TargetPath) {
    Remove-Item $TargetPath -Recurse
    Write-Host "$TargetPath Deleted."
  }
}

# Run our pnpm install/run/build dealio so we have the latest and greatest on our node version.
pnpm install
pnpm run generate
pnpm run build

#Copy the built files into the correct directory
Copy-Item -Path "./drizzle" -Destination "./build/" -Recurse
New-Item -ItemType Directory -Path "./build/build"
Copy-Item -Path "./node_modules/better-sqlite3/build/Release/better_sqlite3.node" -Destination "./build/build/"

#Copy the data from our existing package.json so I don't have to manually update the version.
$sourcepjs = Get-Content -Raw .\package.json | ConvertFrom-Json

#Create a new package.json for the built server to use.
$packagejson = @{
  name = $sourcepjs.name
  version = $sourcepjs.version
  description = $sourcepjs.description
  main = "index.js"
  author = "Noitabara"
}
$packagejson | ConvertTo-Json -depth 100 | Out-File "./build/package.json"

#Compress everyhing into a zip for github release/easy delivery.
$compress = @{
  Path = "./build/*"
  CompressionLevel = "Fastest"
  DestinationPath = "./server.zip"
}

Compress-Archive @compress -Update