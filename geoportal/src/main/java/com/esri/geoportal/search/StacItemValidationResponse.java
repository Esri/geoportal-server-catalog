package com.esri.geoportal.search;

public class StacItemValidationResponse {
	public static String ID_EXISTS = "ID_EXISTS";
	public static String BAD_REQUEST = "BAD_REQUEST";
	public static String ITEM_VALID = "ITEM_VALID";
	public static String ITEM_NOT_FOUND = "ITEM_NOT_FOUND";

	private String code;
	private String message;

	public String getCode() {
		return code;
	}
	

	public void setCode(String code) {
		this.code = code;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

}
