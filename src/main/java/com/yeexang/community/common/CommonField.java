package com.yeexang.community.common;

/**
 * @author yeeq
 * @date 2021/7/23
 */
public class CommonField {

    /**
     * token
     */
    public static final String TOKEN = "token";

    /**
     * 用户账户
     */
    public static final String ACCOUNT = "account";

    public static final String FIRST_LEVEL_COMMENT = "1";

    public static final String SECOND_LEVEL_COMMENT = "2";

    public static final String NOTIFICATION_TYPE_TOPIC = "1";

    public static final String NOTIFICATION_TYPE_COMMENT = "2";

    public static final String NOTIFICATION_TYPE_LIKE = "3";

    /**
     * 账号必须由字母、数字、下划线组成，不能超过12位
     */
    public static final String ACCOUNT_FORMAT_REGULAR = "[a-zA-Z0-9_]{1,12}";

    /**
     * 昵称格式必须由字母、数字、下划线组成
     */
    public static final String USERNAME_FORMAT_REGULAR = "[\\u4E00-\\u9FA5A-Za-z0-9_]+$";

    /**
     * 密码格式必须由字母、数字、下划线组成，不能超过16位
     */
    public static final String PASSWORD_FORMAT_REGULAR = "[a-zA-Z0-9]{1,16}";
}
