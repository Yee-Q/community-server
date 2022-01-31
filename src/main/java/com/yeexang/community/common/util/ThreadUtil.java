package com.yeexang.community.common.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/**
 * @author yeeq
 * @date 2021/12/11
 */
@Slf4j
@Component
public class ThreadUtil {

    private final ThreadPoolExecutor threadPool = new ThreadPoolExecutor(5, 10, 60L,
            TimeUnit.SECONDS, new LinkedBlockingQueue<>(),
            Executors.defaultThreadFactory(), new ThreadPoolExecutor.CallerRunsPolicy());

    /**
     * 将任务交给线程池执行
     * @param task task
     */
    public void execute(Runnable task) {
        threadPool.execute(task);
    }
}