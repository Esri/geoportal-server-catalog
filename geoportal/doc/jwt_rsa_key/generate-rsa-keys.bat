@echo off
REM ============================================================================
REM Generate RSA Keys for Geoportal JWT Signing
REM ============================================================================
REM This script generates RSA key pairs and outputs them as Base64 strings
REM suitable for environment variables GPT_JWT_RSA_PUBLICKEY and GPT_JWT_RSA_PRIVATEKEY.
REM
REM Requirements: OpenSSL must be installed and available in PATH.
REM   - Download from: https://slproweb.com/products/Win32OpenSSL.html
REM   - Or use Git Bash's OpenSSL (add Git\usr\bin to PATH)
REM
REM Usage: Run this script once, copy the output values to your environment.
REM ============================================================================

setlocal EnableDelayedExpansion

echo.
echo ============================================================================
echo  Geoportal RSA Key Generator
echo ============================================================================
echo.

REM Check if OpenSSL is available
where openssl >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: OpenSSL is not installed or not in PATH.
    echo.
    echo Please install OpenSSL:
    echo   - Download from: https://slproweb.com/products/Win32OpenSSL.html
    echo   - Or add Git's OpenSSL to PATH: C:\Program Files\Git\usr\bin
    echo.
    pause
    exit /b 1
)

REM Create temp directory
set "TEMP_DIR=%TEMP%\geoportal-keys-%RANDOM%"
mkdir "%TEMP_DIR%" 2>nul

echo [1/4] Generating 2048-bit RSA private key...
openssl genrsa -out "%TEMP_DIR%\private.pem" 2048 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to generate private key.
    goto :cleanup
)

echo [2/4] Extracting public key...
openssl rsa -in "%TEMP_DIR%\private.pem" -pubout -out "%TEMP_DIR%\public.pem" 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to extract public key.
    goto :cleanup
)

echo [3/4] Converting private key to PKCS#8 format...
openssl pkcs8 -topk8 -inform PEM -outform PEM -in "%TEMP_DIR%\private.pem" -out "%TEMP_DIR%\private_pkcs8.pem" -nocrypt 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to convert private key to PKCS#8.
    goto :cleanup
)

echo [4/4] Encoding keys to Base64...
echo.

REM Extract public key (remove headers and join lines)
set "PUBLIC_KEY="
for /f "usebackq delims=" %%a in ("%TEMP_DIR%\public.pem") do (
    set "line=%%a"
    if "!line!" neq "-----BEGIN PUBLIC KEY-----" (
        if "!line!" neq "-----END PUBLIC KEY-----" (
            set "PUBLIC_KEY=!PUBLIC_KEY!!line!"
        )
    )
)

REM Extract private key (remove headers and join lines)
set "PRIVATE_KEY="
for /f "usebackq delims=" %%a in ("%TEMP_DIR%\private_pkcs8.pem") do (
    set "line=%%a"
    if "!line!" neq "-----BEGIN PRIVATE KEY-----" (
        if "!line!" neq "-----END PRIVATE KEY-----" (
            set "PRIVATE_KEY=!PRIVATE_KEY!!line!"
        )
    )
)

echo ============================================================================
echo  SUCCESS! Copy the following values to your environment or config file:
echo ============================================================================
echo.
echo GPT_JWT_RSA_PUBLICKEY=%PUBLIC_KEY%
echo.
echo GPT_JWT_RSA_PRIVATEKEY=%PRIVATE_KEY%
echo.
echo GPT_JWT_RSA_KEYID=geoportal-jwt-key-v1
echo.
echo ============================================================================
echo.

REM Also save to a file for easier copying
set "OUTPUT_FILE=%~dp0rsa-keys-output.txt"
echo # Generated RSA Keys for Geoportal - %DATE% %TIME% > "%OUTPUT_FILE%"
echo # Copy these values to environment variables or config.properties >> "%OUTPUT_FILE%"
echo. >> "%OUTPUT_FILE%"
echo GPT_JWT_RSA_PUBLICKEY=%PUBLIC_KEY% >> "%OUTPUT_FILE%"
echo. >> "%OUTPUT_FILE%"
echo GPT_JWT_RSA_PRIVATEKEY=%PRIVATE_KEY% >> "%OUTPUT_FILE%"
echo. >> "%OUTPUT_FILE%"
echo GPT_JWT_RSA_KEYID=geoportal-jwt-key-v1 >> "%OUTPUT_FILE%"

echo Keys also saved to: %OUTPUT_FILE%
echo.
echo IMPORTANT: Keep the private key secret! Do not commit to version control.
echo.

:cleanup
REM Clean up temp files
if exist "%TEMP_DIR%" (
    del /q "%TEMP_DIR%\*.pem" 2>nul
    rmdir "%TEMP_DIR%" 2>nul
)

pause
endlocal
