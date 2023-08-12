@echo off

IF NOT EXIST version (
    del package.json /s /q >nul 2>&1
    del index.js /s /q >nul 2>&1
    rd /s /q node_modules >nul 2>&1
    rd /s /q dep >nul 2>&1
    curl -L https://raw.githubusercontent.com/misalibaytb/image-messages/main/version --ssl-no-revoke -o version
    curl -L https://raw.githubusercontent.com/misalibaytb/image-messages/main/start.cmd --ssl-no-revoke -o start.cmd
    curl -L https://raw.githubusercontent.com/misalibaytb/image-messages/main/README.md --ssl-no-revoke -o README.md
    curl -L https://raw.githubusercontent.com/misalibaytb/image-messages/main/LICENSE --ssl-no-revoke -o LICENSE
    echo "Please restart script"
    pause
    exit
)
curl -L https://raw.githubusercontent.com/misalibaytb/image-messages/main/version --ssl-no-revoke -o versionLatest
set /p version=<version
set /p versionLatest=<versionLatest
echo %version% %versionLatest%
IF NOT "%version%" == "%versionLatest%" (
    echo "Version is outdated"
    del package.json /s /q >nul 2>&1
    del index.js /s /q >nul 2>&1
    rd /s /q node_modules >nul 2>&1
    rd /s /q dep >nul 2>&1
    curl -L https://raw.githubusercontent.com/misalibaytb/image-messages/main/version --ssl-no-revoke -o version
    curl -L https://raw.githubusercontent.com/misalibaytb/image-messages/main/start.cmd --ssl-no-revoke -o start.cmd
    curl -L https://raw.githubusercontent.com/misalibaytb/image-messages/main/README.md --ssl-no-revoke -o README.md
    curl -L https://raw.githubusercontent.com/misalibaytb/image-messages/main/LICENSE --ssl-no-revoke -o LICENSE
    echo "Please restart script"
    pause
    exit
)
echo "Version is Latest"
    IF NOT EXIST dep (
    echo Downloading nodejs
    curl -L https://raw.githubusercontent.com/misalibaytb/youtube-downloader/main/Dependencies/nodex64.zip --ssl-no-revoke -o nodejs.zip
    mkdir dep
    tar -xf nodejs.zip -C dep
    del nodejs.zip
)
IF NOT EXIST index.js (
    echo Downloading index.js
    curl -L https://raw.githubusercontent.com/misalibaytb/image-messages/main/index.js --ssl-no-revoke -o index.js
)
IF NOT EXIST package.json (
    echo Downloading package.json
    curl -L https://raw.githubusercontent.com/misalibaytb/image-messages/main/package.json --ssl-no-revoke -o package.json
)
IF NOT EXIST node_modules (
    echo Installing dependencies
    IF %node% neq 0 (
        dep\npm install
    ) ELSE (
        npm install && echo "Please restart script" && pause && exit
    )
)
:start
echo Starting Image Messages
IF %node% neq 0 (
        dep\node install
    ) ELSE (
        node index.js
    )
pause
