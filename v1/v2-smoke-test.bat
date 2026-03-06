@echo off
setlocal

echo ===== Dispatch V2 Smoke Test =====

echo [1] Health
powershell -NoProfile -Command "try{(Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3000/health -TimeoutSec 8).StatusCode}catch{Write-Output $_.Exception.Message}"

echo [2] Tech list
powershell -NoProfile -Command "try{(Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3000/techs -TimeoutSec 8).StatusCode}catch{Write-Output $_.Exception.Message}"

echo [3] Schedule endpoint
powershell -NoProfile -Command "try{(Invoke-WebRequest -UseBasicParsing \"http://127.0.0.1:3000/my-schedule?tech=all&range=week\" -TimeoutSec 8).StatusCode}catch{Write-Output $_.Exception.Message}"

echo [4] PM summary
powershell -NoProfile -Command "try{(Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3000/pm-summary -TimeoutSec 8).StatusCode}catch{Write-Output $_.Exception.Message}"

echo [5] Closeout rules
powershell -NoProfile -Command "try{(Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3000/closeout-rules -TimeoutSec 8).StatusCode}catch{Write-Output $_.Exception.Message}"

echo [6] Time rollup sample
powershell -NoProfile -Command "try{(Invoke-WebRequest -UseBasicParsing \"http://127.0.0.1:3000/time-rollup?tech=Chris&project=Project%20A\" -TimeoutSec 8).StatusCode}catch{Write-Output $_.Exception.Message}"

echo ===== Done =====
