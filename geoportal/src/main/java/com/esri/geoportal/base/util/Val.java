/* See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Esri Inc. licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.esri.geoportal.base.util;

import org.apache.commons.text.StringEscapeUtils;
import org.apache.commons.text.translate.NumericEntityUnescaper;
import org.apache.commons.text.translate.OctalUnescaper;
import org.apache.commons.text.translate.UnicodeUnescaper;

import java.io.IOException;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Value utilities.
 */
public class Val {
  static OctalUnescaper OCTAL = new OctalUnescaper();
  static NumericEntityUnescaper NUMERIC = new NumericEntityUnescaper(NumericEntityUnescaper.OPTION.semiColonOptional);
  static UnicodeUnescaper UNICODE = new UnicodeUnescaper();
  static Pattern octalPattern = Pattern.compile("\\\\[0-8]{2,3}");

  /**
   * Converts a string to a boolean.
   * @param v the string
   * @param defaultVal the default value
   * @return the converted value
   */
  public static boolean chkBool(String v, boolean defaultVal) {
    boolean b = defaultVal;
    v = chkStr(v,"").toLowerCase(Locale.ENGLISH);
    if (v.length() > 0) {
      if (v.equals("true")) {
        b = true;
      } else if (v.equals("false")) {
        b = false;
      } else if (v.equals("y")) {
        b = true;
      } else if (v.equals("n")) {
        b = false;
      } else if (v.equals("yes")) {
        b = true;
      } else if (v.equals("no")) {
        b = false;
      } else if (v.equals("on")) {
        b = true;
      } else if (v.equals("off")) {
        b = false;
      } else if (v.equals("0")) {
        b = false;
      } else if (v.equals("1")) {
        b = true;
      } else if (v.equals("-1")) {
        b = false;
      }
    }
    return b;
  }

  /**
   * Converts a string to a double.
   * @param v the string
   * @param defaultVal the default value
   * @return the converted value
   */
  public static Double chkDbl(String v, Double defaultVal) {
    v = trim(v);
    Double n = defaultVal;
    try {
      if (v != null && v.length() > 0) {
        n = Double.parseDouble(v);
      }
    } catch (Exception e) {
      n = defaultVal;
    }
    return n;
  }

  /**
   * Converts a string to an int.
   * @param v the string
   * @param defaultVal the default value to return if the string is invalid
   * @return the converted value
   */
  public static Integer chkInt(String v, Integer defaultVal) {
    v = trim(v);
    Integer n = defaultVal;
    try {
      if (v != null && v.length() > 0) {
        n = Integer.parseInt(v);
      }
    } catch (Exception e) {
      n = defaultVal;
    }
    return n;
  }

  /**
   * Converts a string to an long.
   * @param v the string
   * @param defaultVal the default value
   * @return the converted value
   */
  public static Long chkLong(String v, Long defaultVal) {
    v = trim(v);
    Long n = defaultVal;
    try {
      if (v != null && v.length() > 0) {
        n = Long.parseLong(v);
      }
    } catch (Exception e) {
      n = defaultVal;
    }
    return n;
  }

  /**
   * Check a string value.
   * @param v the string
   * @param defaultVal the default value (if the supplied string is empty)
   * @return the trimmed or default value
   */
  public static String chkStr(String v, String defaultVal) {
    v = trim(v);
    if (v != null && v.length() > 0) {
      return v;
    }
    return defaultVal;
  }
  
  /**
   * Base 64 encode bytes.
   * @param bytes the bytes
   * @param charset the charset
   * @return the string
   */
  public static String base64Encode(byte[] bytes, String charset) {
    if (bytes != null) {
      try {
        if (charset != null && charset.length() > 0) {
          return new String(Base64.getEncoder().encode(bytes),charset);
        } else {
          return new String(Base64.getEncoder().encode(bytes));
        }
      } catch (UnsupportedEncodingException e) {
        throw new RuntimeException(e);
      }
    }
    return null;
  }

  /**
   * Tokenizes a delimited string into an array.
   * @param tokens the delimited string 
   * @param delimiter the delimiter
   * @param allowEmpty allow empty tokens
   * @return the array of tokens
   */
  public static String[] tokenize(String tokens, String delimiter, boolean allowEmpty) {
    ArrayList<String> al = new ArrayList<String>();
    tokens = trim(tokens);
    if (tokens == null) tokens = "";
    if (delimiter == null) {
      delimiter = "";
    } else if (!delimiter.equals(" ")) {
      delimiter = delimiter.trim();
    }
    StringTokenizer st = new StringTokenizer(tokens, delimiter);
    while (st.hasMoreElements()) {
      String s = trim((String)st.nextElement());
      if (allowEmpty || s.length() > 0) al.add(s);
    }
    return al.toArray(new String[0]);
  }
  
  /**
   * Formats a date into an ISO 8601 string.
   * @param date the date
   * @return the formatted string
   */
  public static String toIso8601(Date date) {
    return DateUtil.toIso8601(date);
  }

  /**
   * Trim a string.
   * @param v the string
   * @return the trimmed string (null if the input was null)
   */
  public static String trim(String v) {
    if (v != null) v = v.trim();
    return v;
  }
  
  /**
   * URL encodes a value.
   * @param v the value
   * @return the encoded value
   */
  public static String urlEncode(String v) {
    if (v != null) {
      try {
        return URLEncoder.encode(v,"UTF-8");
      } catch (UnsupportedEncodingException e) {}
    }
    return v;
  }
  /**
   * decodes a html value.
   * @param v the value
   * @return the decoded value
   */
  public static String unescapeHtml4(String v) {
    if (v != null) {

      return StringEscapeUtils.unescapeHtml4(v);

    }
    return v;
  }
  /**
   * decodes an eNunmericEntity value.
   * @param v the value
   * @return the decoded value
   */
  public static String unescapeNunmericEntity(String v) {
    if (v != null) {

      try {
        StringWriter writer = new StringWriter(v.length() * 2);
        NUMERIC.translate(v, writer);
        return writer.toString();
      } catch (IOException var3) {
        throw new RuntimeException(var3);
      }

    }
    return v;
  }
  /**
   * decodes an octal value.
   * @param v the value
   * @return the decoded value
   */
  public static String unescapeOctal(String v) {
    if (v != null) {

      try {
        StringWriter writer = new StringWriter(v.length() * 2);
        OCTAL.translate(v, writer);
        String out = writer.toString();
        return writer.toString();
      } catch (IOException var3) {
        throw new RuntimeException(var3);
      }

    }
    return v;
  }
  /**
   * decodes an octal value.
   * @param v the value
   * @return the decoded value
   */
  public static String unescapeUnicode(String v) {
    if (v != null) {

      try {
        StringWriter writer = new StringWriter(v.length() * 2);
        UNICODE.translate(v, writer);
        return writer.toString();
      } catch (IOException var3) {
        throw new RuntimeException(var3);
      }

    }
    return v;
  }

  /**
   * dencodes an octal value.
   * @param v the value
   * @return the deencoded value
   */
    /*
  Octal to Unicode is a special case for when an file gets read as ISO_8859_1
   */
  public static String unescapeOctalToUnicode(String v) {
    if (v != null) {
      try {
        StringWriter writer = new StringWriter(v.length() * 2);
        OCTAL.translate(v, writer);
        byte[] c = writer.toString().getBytes(StandardCharsets.ISO_8859_1);
        v = new String (c, StandardCharsets.UTF_8);

        return v;
      } catch (IOException var3) {
        throw new RuntimeException(var3);
      }

    }
    return v;
  }
  /**
   * dencodes html and  octal values.
   * @param v the value
   * @return the decoded value
   */
  /*
  This assumes that only one character set will be in a string.
  Either HTMl, or the Octal.
   */
  public static String unescape(String v) {
    if (v != null) {
      String rv = unescapeHtml4(v);
      if (!rv.equals(v)){
        return rv;
      }

      Matcher m = octalPattern.matcher(v); //octalPattern = Pattern.compile("\\\\[0-8]{2,3}");
      boolean b =m.find();
      if (b) {
        v = unescapeOctal(v);
        if (!rv.equals(v)) {
          return rv;
        }
      }
      //v = unescapeUnicode(v);
      //v = unescapeNunmericEntity(v);

    }
    return v;
  }
}
