package com.esri.geoportal.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;

/**
 * Registers PropertySourcesPlaceholderConfigurer to load config/security-config.properties.
 * The bean is static so it is initialized early and placeholder resolution works for @Value fields.
 */
@Configuration
@PropertySource("classpath:config/config.properties")
public class PropertyPlaceholderConfig {

    @Bean
    public static PropertySourcesPlaceholderConfigurer propertySourcesPlaceholderConfigurer() {
        PropertySourcesPlaceholderConfigurer p = new PropertySourcesPlaceholderConfigurer();
       
        p.setIgnoreResourceNotFound(false);
        p.setIgnoreUnresolvablePlaceholders(false);
        return p;
    }
}