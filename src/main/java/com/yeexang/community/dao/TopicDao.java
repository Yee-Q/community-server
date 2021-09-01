package com.yeexang.community.dao;

import com.yeexang.community.pojo.po.Topic;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author yeeq
 * @date 2021/7/20
 */
@Repository
public interface TopicDao {

    void insert(Topic topic);

    void delete(Topic topic);

    void update(Topic topic);

    void updateLikeCountIncrease(@Param("topicId") String topicId);

    void updateVisitCountIncrease(@Param("topicId") String topicId);

    List<Topic> select(Topic topic);
}
