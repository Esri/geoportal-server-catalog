package com.esri.geoportal.lib.security;

import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.esri.geoportal.context.GeoportalContext;
import com.esri.geoportal.lib.elastic.ElasticContext;

public class EncryptDecrypt {
	private static final Logger LOGGER = LoggerFactory.getLogger(EncryptDecrypt.class);
	public static String encrypt(String algorithm, String input, SecretKey key, IvParameterSpec iv)
			throws NoSuchPaddingException, NoSuchAlgorithmException, InvalidAlgorithmParameterException,
			InvalidKeyException, BadPaddingException, IllegalBlockSizeException {

		Cipher cipher = Cipher.getInstance(algorithm);
		cipher.init(Cipher.ENCRYPT_MODE, key, iv);
		byte[] cipherText = cipher.doFinal(input.getBytes());
		return Base64.getEncoder().encodeToString(cipherText);
	}



	public static String decrypt(String encryptedText,String base64Key, String base64Iv) throws NoSuchAlgorithmException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeyException, InvalidAlgorithmParameterException
	{		
		String algorithm = "AES/CBC/PKCS5Padding";	 
        
        byte[] decodedKey = Base64.getDecoder().decode(base64Key);
        byte[] decodedIv = Base64.getDecoder().decode(base64Iv);
        
        SecretKey key = new SecretKeySpec(decodedKey, 0, decodedKey.length, "AES");
        IvParameterSpec ivParameterSpec = new IvParameterSpec(decodedIv);
        
        Cipher cipher = Cipher.getInstance(algorithm);
        cipher.init(Cipher.DECRYPT_MODE, key, ivParameterSpec);
        byte[] decryptedData = cipher.doFinal(Base64.getDecoder().decode(encryptedText));
        
        return new String(decryptedData);
		
	}
	
	public static String decryptLdapPass(String inputText)
	{
		String decryptedPass = "";
		try {
			ElasticContext ec = GeoportalContext.getInstance().getElasticContext();
			if(ec.isEncryptPassword())
			{
				decryptedPass = decrypt(inputText,ec.getBase64Key(),ec.getBase64Iv());
			}else
			{
				decryptedPass = inputText;
			}			
		}
		catch(Exception ex)
		{
			LOGGER.error("Ldap password could not be decrypted");
		}
		return decryptedPass;
	}

}
