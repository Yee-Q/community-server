package com.styeeqan.community.aspect;

import com.alibaba.fastjson.JSON;
import com.styeeqan.community.common.constant.CommonField;
import com.styeeqan.community.common.http.response.ResponseEntity;
import com.styeeqan.community.pojo.dto.BaseDTO;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.lang.reflect.Method;

/**
 * Controller日志切面
 *
 * @author yeeq
 * @date 2021/8/4
 */
@Slf4j
@Aspect
@Component
@Order(1)
public class ControllerLogAsp {

    @Pointcut("execution(* com.styeeqan.community.web.controller.*.*(..))")
    public void controllerMethod() {

    }

    /**
     * 执行 Controller 方法前打印日志
     * @param joinPoint joinPoint
     */
    @Before(value = "controllerMethod()", argNames = "joinPoint")
    public void LogRequestInfo(JoinPoint joinPoint) {
        // 持有上下文的 request 容器
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            // 获取 request 请求
            HttpServletRequest request = attributes.getRequest();
            // 获取用户账户号
            Object attribute = request.getAttribute(CommonField.ACCOUNT);
            if (attribute == null) {
                // 如果账户为空，则不记录日志
                return;
            }
            String account = attribute.toString();
            // 获取请求 uri
            String requestURI = request.getRequestURI();
            // 获取方法签名
            MethodSignature methodSignature = (MethodSignature) joinPoint.getSignature();
            // 获取方法
            Method method = methodSignature.getMethod();
            // 获取方法上面的注解
            GetMapping getMapping = method.getAnnotation(GetMapping.class);
            PostMapping postMapping = method.getAnnotation(PostMapping.class);
            // 根据注解类型打印日志
            if (getMapping != null) {
                log.info("用户:{} 发送GET请求:{}", account, requestURI);
            }
            if (postMapping != null) {
                // 方法参数
                BaseDTO requestParam = null;
                for (Object arg : joinPoint.getArgs()) {
                    if (arg instanceof BaseDTO) {
                        requestParam = (BaseDTO) arg;
                    }
                }
                log.info("用户:{} 发送POST请求:{}, 请求参数: {}",
                        account, requestURI, requestParam == null ? "null" : JSON.toJSONString(requestParam));
            }
        }
    }

    /**
     * Controller 方法执行完毕打印日志
     * @param joinPoint joinPoint
     * @param responseEntity 响应
     */
    @AfterReturning(returning = "responseEntity", pointcut = "controllerMethod()")
    public void logResultInfo(JoinPoint joinPoint, ResponseEntity responseEntity) {
        // 持有上下文的 request 容器
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            // 获取 request 请求
            HttpServletRequest request = attributes.getRequest();
            // 获取用户账户号
            Object attribute = request.getAttribute(CommonField.ACCOUNT);
            if (attribute == null) {
                // 如果账户为空，则不记录日志
                return;
            }
            String account = attribute.toString();
            // 获取请求 uri
            String requestURI = request.getRequestURI();
            // 获取方法签名
            MethodSignature methodSignature = (MethodSignature) joinPoint.getSignature();
            // 获取方法
            Method method = methodSignature.getMethod();
            // 获取方法上面的注解
            PostMapping postMapping = method.getAnnotation(PostMapping.class);
            // 根据注解类型打印日志
            if (postMapping != null) {
                log.info("用户:{} POST请求结束:{}, 返回结果: {}",
                        account, requestURI, responseEntity);
            }
        }
    }
}