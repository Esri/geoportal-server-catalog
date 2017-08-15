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
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.Locale;
import java.util.TimeZone;

import javax.xml.bind.DatatypeConverter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Date utilities.
 */
public class DateUtil {
  
  /** Logger. */
  private static final Logger LOGGER = LoggerFactory.getLogger(DateUtil.class);

  /**
   * Advances a calendar to the end of date interval.
   * <br>
   * Example: 
   * <br>A calendar has been previously set to the beginning millisecond of 2010-04
   * <br>Calling this method will advance the calendar to the final millisecond of 2010-04
   * @param calendar the calendar to advance
   * @param date the date string associated with the current calendar time
   */
  public static void advanceToUpperBoundary(Calendar calendar, String date) {
    if (date.indexOf("T") == -1) {
      int nAddType = -1;
      String[] parts = date.split("-");
      int nParts = parts.length;
      for (String s: parts) {
        if ((s.indexOf(":") != -1) && (s.indexOf("+") == -1)) {
          nParts--;
        }
      }
      if (nParts == 1) {
        nAddType = Calendar.YEAR;
      } else if (nParts == 2) {
        nAddType = Calendar.MONTH;
      } else if (nParts == 3) { 
        nAddType = Calendar.DAY_OF_MONTH;
      }
      if (nAddType > 0) {
        calendar.add(nAddType,1);
        calendar.add(Calendar.MILLISECOND,-1);
      }
    }
  }

  /**
   * Check an FGDC date value.
   * @param text the text
   * @param isEnd true if this is an end date
   * @return the date string
   */
  public static String checkFgdcDate(String text, boolean isEnd) {
    if (text != null) {
      text = text.trim();
      if (text.length() > 0) {
        try {
          boolean bSet = false;
          if (text.indexOf("-") == -1) {
            if (text.length() == 8) {
              text = text.substring(0,4)+"-"+text.substring(4,6)+"-"+text.substring(6,8);
              text += "Z";
              bSet = true;
            }
          }
          if (bSet) {
            Calendar c1 = DatatypeConverter.parseDateTime(text);
            GregorianCalendar c = new GregorianCalendar(TimeZone.getTimeZone("UTC"));
            c.setTimeInMillis(c1.getTimeInMillis());
            if (isEnd) {
              advanceToUpperBoundary(c,text);
            }
            text = DatatypeConverter.printDateTime(c);
            return text;
          }
        } catch (IllegalArgumentException e) {
          LOGGER.debug("Bad FGDC date: "+text);
        }
      }
    }
    return null;
  }

  /**
   * Check an ISO date-time value.
   * @param text the text
   * @param isEnd true if this is an end date
   * @return the date string
   */
  public static String checkIsoDateTime(String text, boolean isEnd) {
    if (text != null) {
      text = text.trim();
      if (text.length() > 0) {
        try {

          // repair this pattern: 2013-04-15 17:11:00Z
          if (text.length() > 11) {
            if (text.substring(10,11).equals(" ")) {
              if ((text.indexOf("-") != -1) && (text.indexOf(":") != -1)) {
                if (text.endsWith("Z")) {
                  text = text.substring(0,10)+"T"+text.substring(11);
                }
              }
            }
          }

          // TODO:
          // if a timezone is not specified within the date-time string, 
          // the local time zone is assumed, this isn't such a good idea,
          // e.g 2012-06-13  vs 2012-06-13Z     
          boolean bDateOnly = false;
          String uc = text.toUpperCase();
          if ((uc.indexOf(" ") == -1) && (uc.indexOf(":") == -1) &&
              (uc.indexOf("T") == -1) && (uc.indexOf("Z") == -1)) {
            String[] p = text.split("-");
            if (p.length == 1) {
              if (p[0].length() == 4) {
                bDateOnly = true;
                text = text+"Z";
              }
            } else if (p.length == 2) {
              if ((p[0].length() == 4) && (p[1].length() == 2)) {
                bDateOnly = true;
                text = text+"Z";
              }
            } else if (p.length == 3) {
              if ((p[0].length() == 4) && (p[1].length() == 2) && (p[2].length() == 2)) {
                bDateOnly = true;
                text = text+"Z";
              }
            }
          }
          Calendar c1 = DatatypeConverter.parseDateTime(text);
          GregorianCalendar c = new GregorianCalendar(TimeZone.getTimeZone("UTC"));
          c.setTimeInMillis(c1.getTimeInMillis());
          if (isEnd) {
            advanceToUpperBoundary(c,text);
          }
          if (bDateOnly) {
            text = DatatypeConverter.printDateTime(c);
          } else {
            text = DatatypeConverter.printDateTime(c);
          }     
          return text;
        } catch (IllegalArgumentException e) {
          LOGGER.debug("Bad ISO date: "+text);
        }
      }
    }
    return null;
  }
  
  /**
   * Converts an ISO 8601 string to a date.
   * @param iso the date
   * @return the data
   */
  public static Date fromIso8601(String iso) {
    if (iso == null) return null;
    Calendar c1 = DatatypeConverter.parseDateTime(iso);
    GregorianCalendar c = new GregorianCalendar(TimeZone.getTimeZone("UTC"));
    c.setTimeInMillis(c1.getTimeInMillis());
    return new Date(c.getTimeInMillis());
  }
  
  /**
   * Generates a date string from the current time.
   * @return the date string
   */
  public static String nowAsString() {
    Date dt = new Date(System.currentTimeMillis());
    GregorianCalendar c = new GregorianCalendar(TimeZone.getTimeZone("UTC"));
    c.setTimeInMillis(dt.getTime());
    String now = DatatypeConverter.printDateTime(c);
    return now;
  }
  
  /**
   * Formats a date into an ISO 8601 string.
   * @param date the date
   * @return the formatted string
   */
  public static String toIso8601(Date date) {
    if (date == null) return null;
    DateFormat fmt = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.sss'Z'",Locale.US);
    fmt.setTimeZone(TimeZone.getTimeZone("UTC"));
    return fmt.format(date);
  }

}
