This utility can be used to generate encrypted password using AES/CBC/PKCS5Padding algorithm
Encrypted password can be used in below places:
	Elastic/Opensearch password in app-context.xml
	Ldap server user password in authentication-ldap.xml 

1. Unzip EncryptPassword.zip in C or D drive.
2. open command prompt
3. Make sure that java path is set
	java --version
3. cd c:\EncryptPassword
4. EncryptPassword.bat password_to_encrypt
It can be used to encrypt upto 5 strings provided as argument
	EncryptPassword.bat input1 input2
	
5. Note down Base64 Key, Base64 IV and Encrypted password
6. Open app-context.xml and use the values noted above

		<beans:property name="password" value="" />
		<beans:property name="encryptPassword" value="true" />
		<!-- If encryptPassword =true, Uncomment below and configure the keys -->
		<!-- 
		<beans:property name="base64Key" value="${gpt_base64Key}" />
		<beans:property name="base64Iv" value="${gpt_base64Iv}" />
		
7. This is applicable if authentication-ldap is used. Open authentication-ldap.xml 
	Find 	<beans:property name="password">
	Fill encrypted password in	<beans:value></beans:value>

	 
