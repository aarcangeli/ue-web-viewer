@echo off
setlocal
pushd "%~dp0"

echo Starting the server at http://localhost:8080
python -m http.server 8080
