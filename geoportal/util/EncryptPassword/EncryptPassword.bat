@echo off
REM Please make sure that JAVA_HOME is set for Jdk11
REM PATH should be set for JDK11/bin
if ""%1""=="""" goto error
echo Encrypting password
java EncryptPasword %1
goto end


:error
echo please add parameter for password to be encrypted.

:end