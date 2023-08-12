@echo off

node -v >nul 2>&1
set /a node=%errorlevel%
if %errorlevel% neq 0 (
    IF NOT EXIST dep (
    echo Downloading nodejs
    @REM curl -L https://raw.githubusercontent.com/misalibaytb/youtube-downloader/main/Dependencies/nodex64.zip -o nodejs.zip
    powershell -c "(New-Object System.Net.WebClient).DownloadFile('https://raw.githubusercontent.com/misalibaytb/youtube-downloader/main/Dependencies/nodex64.zip', 'nodejs.zip')"
    mkdir dep
    tar -xf nodejs.zip -C dep
    del nodejs.zip
)
)
IF NOT EXIST index.js (
    echo Downloading index.js
    @REM curl -L https://raw.githubusercontent.com/misalibaytb/image-messages/main/index.js -o index.js
    powershell -c "(New-Object System.Net.WebClient).DownloadFile('https://raw.githubusercontent.com/misalibaytb/image-messages/main/index.js', 'index.js')"
)
IF NOT EXIST package.json (
    echo Downloading package.json
    @REM curl -L https://raw.githubusercontent.com/misalibaytb/image-messages/main/package.json -o package.json
    powershell -c "(New-Object System.Net.WebClient).DownloadFile('https://raw.githubusercontent.com/misalibaytb/image-messages/main/package.json', 'package.json')"
)
IF NOT EXIST node_modules (
    echo Installing dependencies
    IF %node% neq 0 (
        dep\npm install
    ) ELSE (
        npm install && goto :start
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
