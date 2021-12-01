package com.yeexang.community.config;

import com.yeexang.community.web.interceptor.TokenVerifyInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * MVC 配置类
 *
 * @author yeeq
 * @date 2021/7/23
 */
@Configuration
public class MvcConfig implements WebMvcConfigurer {

    @Bean
    public HandlerInterceptor getTokenVerifyInterceptor() {
        return new TokenVerifyInterceptor();
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("index");
        registry.addViewController("/index").setViewName("index");
        registry.addViewController("/publish").setViewName("publish");
        registry.addViewController("/topic/view/**").setViewName("topic");
        registry.addViewController("/homepage").setViewName("homepage");
        registry.addViewController("/common/header-logined").setViewName("/common/header-logined");
        registry.addViewController("/common/header-non-logined").setViewName("/common/header-non-logined");
        registry.addViewController("/common/footer").setViewName("/common/footer");
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // token 校验拦截器
        registry.addInterceptor(getTokenVerifyInterceptor()).addPathPatterns("/**")
                .excludePathPatterns("/css/**", "/bootstrap-4.6.0/**", "/editor.md/**",
                        "/fonts/**", "/images/**", "/js/**", "/", "/index",
                        "/user/login", "/user/register", "/topic/page",
                        "/comment/list", "/section/list", "/topic/visit",
                        "/common/header-logined", "/common/header-non-logined",
                        "/common/footer", "/topic/view/**");
    }
}