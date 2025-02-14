/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.setup;

/**
 * Some configuration parameters
 *
 * @author maxence
 */
public class ColabConfiguration {

    /**
     * Build number property name
     */
    public static final String BUILD_NUMBER_PROPERTY = "colab.build.number";

    /**
     * Default build number
     */
    public static final String DEFAULT_BUILD_NUMBER_VALUE = "";

    /**
     * Build number property name
     */
    public static final String BUILD_IMAGES_PROPERTY = "colab.build.images";

    /**
     * Default build number
     */
    public static final String DEFAULT_BUILD_IMAGES_VALUE = "";

    /**
     * System property name which contains default admin username
     */
    public static final String DEFAULT_ADMIN_USERNAME_PROPERTY = "colab.default.admin.username";
    /**
     * Value to use if the system property is not set
     */
    public static final String DEFAULT_ADMIN_USERNAME_VALUE = "admin";

    /**
     * System property name which contains default admin email address
     */
    public static final String DEFAULT_ADMIN_EMAIL_PROPERTY = "colab.default.admin.email";
    /**
     * Value to use if the system property is not set
     */
    public static final String DEFAULT_ADMIN_EMAIL_VALUE = "admin@colab.localhost";

    /**
     * System property name which contains default admin password
     */
    public static final String DEFAULT_ADMIN_PASSWORD_PROPERTY = "colab.default.admin.password";
    /**
     * Value to use if the system property is not set
     */
    public static final String DEFAULT_ADMIN_PASSWORD_VALUE = "admin";

    /**
     * smtp domain property name
     */
    public static final String SMTP_DOMAIN = "colab.smtp.domain";

    /**
     * smtp domain default value
     */
    public static final String SMTP_DOMAIN_DEFAULT_VALUE = "colab.localhost";

    /**
     * smtp host property name
     */
    public static final String SMTP_HOST = "colab.smtp.host";

    /**
     * smtp host default value
     */
    public static final String SMTP_HOST_DEFAULT_VALUE = "localhost";

    /**
     * smtp port property name
     */
    public static final String SMTP_PORT = "colab.smtp.port";

    /**
     * smtp port default value
     */
    public static final String SMTP_PORT_DEFAULT_VALUE = "25";

    /**
     * smtp auth property name
     */
    public static final String SMTP_AUTH = "colab.smtp.auth";

    /**
     * smtp auth default value
     */
    public static final String SMTP_AUTH_DEFAULT_VALUE = "false";

    /**
     * smtp username property name
     */
    public static final String SMTP_USERNAME = "colab.smtp.username";

    /**
     * smtp username default value
     */
    public static final String SMTP_USERNAME_DEFAULT_VALUE = "postmaster";

    /**
     * smtp password property name
     */
    public static final String SMTP_PASSWORD = "colab.smtp.password";

    /**
     * smtp password default value
     */
    public static final String SMTP_PASSWORD_DEFAULT_VALUE = "";

    /**
     * smtp starttls property name
     */
    public static final String SMTP_STARTTLS = "colab.smtp.starttls";

    /**
     * smtp starttls default value
     */
    public static final String SMTP_STARTTLS_DEFAULT_VALUE = "false";

    /**
     * Display "create an account" button or not
     */
    public static final String LOCAL_ACCOUNT_BUTTON = "colab.localaccount.showcreatebutton";

    /**
     * Display "create an account" button or not default value
     */
    public static final String LOCAL_ACCOUNT_BUTTON_VALUE = "true";

    /**
     * Maximum file upload size
     */
    public static final String JCR_REPOSITORY_MAX_FILE_SIZE_MB = "colab.jcr.maxfile.size.mo";

    /**
     * Maximum file upload size default value
     */
    public static final String JCR_REPOSITORY_MAX_FILE_SIZE_MB_DEFAULT = "50";

    /**
     * Maximum file upload size
     */
    public static final String JCR_REPOSITORY_PROJECT_QUOTA_MB = "colab.jcr.project.quota.mo";

    /**
     * Maximum file upload size default value
     */
    public static final String JCR_REPOSITORY_PROJECT_QUOTA_MB_DEFAULT = "2048";

    /**
     * Mongo DB access for JCR file storage. Empty string means non-persistent, i.e. stored in
     * memory during run
     */
    public static final String JCR_MONGO_DB_URI = "colab.jcr.mongodb.uri";

    /**
     * Default Mongo DB access for JCR file storage.
     */
    public static final String JCR_MONGO_DB_URI_DEFAULT = "";

    /**
     * never-called private constructor
     */
    private ColabConfiguration() {
        throw new UnsupportedOperationException(
            "This is a utility class and cannot be instantiated");
    }

    /**
     * Get build number
     *
     * @return build number
     */
    public static String getBuildNumber() {
        return System.getProperty(BUILD_NUMBER_PROPERTY, DEFAULT_BUILD_NUMBER_VALUE);
    }

    /**
     * Get name of the running docker image
     *
     * @return the running docker images or empty if running app is not a docker container
     */
    public static String getBuildImages() {
        return System.getProperty(BUILD_IMAGES_PROPERTY, DEFAULT_BUILD_IMAGES_VALUE);
    }

    /**
     * Get default admin username.
     *
     * @return default admin username
     */
    public static String getDefaultAdminUsername() {
        return System.getProperty(DEFAULT_ADMIN_USERNAME_PROPERTY, DEFAULT_ADMIN_USERNAME_VALUE);
    }

    /**
     * get the default admin email address
     *
     * @return default admin email address
     */
    public static String getDefaultAdminEmail() {
        return System.getProperty(DEFAULT_ADMIN_EMAIL_PROPERTY, DEFAULT_ADMIN_EMAIL_VALUE);
    }

    /**
     * Get the default admin password
     *
     * @return default admin password
     */
    public static String getDefaultAdminPassword() {
        return System.getProperty(DEFAULT_ADMIN_PASSWORD_PROPERTY, DEFAULT_ADMIN_PASSWORD_VALUE);
    }

    /**
     * domain name
     *
     * @return the domain name
     */
    public static String getSmtpDomain() {
        return System.getProperty(SMTP_DOMAIN, SMTP_DOMAIN_DEFAULT_VALUE);
    }

    /**
     * Does the SMTP server requires authentication ?
     *
     * @return "true" or "false"
     */
    public static String getSmtpAuth() {
        return System.getProperty(SMTP_AUTH, SMTP_AUTH_DEFAULT_VALUE);
    }

    /**
     * @return SMTP username
     */
    public static String getSmtpUsername() {
        return System.getProperty(SMTP_USERNAME, SMTP_USERNAME_DEFAULT_VALUE);
    }

    /**
     * @return SMTP password
     */
    public static String getSmtpPassword() {
        return System.getProperty(SMTP_PASSWORD, SMTP_PASSWORD_DEFAULT_VALUE);
    }

    /**
     * @return SMTP host
     */
    public static String getSmtpHost() {
        return System.getProperty(SMTP_HOST, SMTP_HOST_DEFAULT_VALUE);
    }

    /**
     * @return SMPT port
     */
    public static String getSmtpPort() {
        return System.getProperty(SMTP_PORT, SMTP_PORT_DEFAULT_VALUE);
    }

    /**
     * Should start TLS or not?
     *
     * @return "true" or "false"
     */
    public static boolean getSmtpStartTls() {
        return System.getProperty(SMTP_STARTTLS,
            SMTP_STARTTLS_DEFAULT_VALUE).equals("true");
    }

    /**
     * Show create an account or not?
     *
     * @return show create an account button or not?
     */
    public static boolean getDisplayLocalAccountButton() {
        return System.getProperty(LOCAL_ACCOUNT_BUTTON,
            LOCAL_ACCOUNT_BUTTON_VALUE).equals("true");
    }

    /**
     * @return The per file maximum size expressed in bytes
     */
    public static Long getJcrRepositoryFileSizeLimit() {
        var value = System.getProperty(JCR_REPOSITORY_MAX_FILE_SIZE_MB,
            JCR_REPOSITORY_MAX_FILE_SIZE_MB_DEFAULT);
        var parsed = tryParsePositive(value, JCR_REPOSITORY_MAX_FILE_SIZE_MB_DEFAULT);
        return parsed << 20;// convert to bytes
    }

    /**
     * @return The file storage quota per project expressed in bytes
     */
    public static Long getJcrRepositoryProjectQuota() {
        var value = System.getProperty(JCR_REPOSITORY_PROJECT_QUOTA_MB,
            JCR_REPOSITORY_MAX_FILE_SIZE_MB_DEFAULT);
        var parsed = tryParsePositive(value, JCR_REPOSITORY_MAX_FILE_SIZE_MB_DEFAULT);
        return parsed << 20;// convert to bytes
    }

    /**
     * @return The URI to access the MongoDB container. Used for file persistence with JCR
     */
    public static String getJcrMongoDbUri() {
        return System.getProperty(JCR_MONGO_DB_URI, JCR_MONGO_DB_URI_DEFAULT);
    }

    /**
     * Parses a long from a positive string value. Falls back on default value
     * 
     * @param value
     * @param dflt  fallback value, used in case parsing fails or value is negative
     * 
     * @return The parsed value or the default value
     */
    private static Long tryParsePositive(String value, String dflt) {
        Long result;
        try {
            result = Long.parseLong(value);
            if (result <= 0) {
                result = Long.parseLong(dflt);
            }
        } catch (NumberFormatException nfe) {
            result = Long.parseLong(dflt);
        }
        return result;
    }
}
