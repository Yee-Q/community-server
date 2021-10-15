package com.yeexang.community.web.controller;

import com.github.pagehelper.PageInfo;
import com.yeexang.community.common.constant.CommonField;
import com.yeexang.community.common.ServerStatusCode;
import com.yeexang.community.common.http.request.RequestEntity;
import com.yeexang.community.common.http.response.ResponseEntity;
import com.yeexang.community.pojo.dto.*;
import com.yeexang.community.pojo.po.Comment;
import com.yeexang.community.pojo.po.Topic;
import com.yeexang.community.pojo.po.User;
import com.yeexang.community.web.service.CommentSev;
import com.yeexang.community.web.service.SectionSev;
import com.yeexang.community.web.service.TopicSev;
import com.yeexang.community.web.service.UserSev;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * @author yeeq
 * @date 2021/7/25
 */
@Slf4j
@RestController
@RequestMapping("topic")
@Api(tags = "帖子管理 Controller")
public class TopicCon {

    @Autowired
    private TopicSev topicSev;

    @Autowired
    private SectionSev sectionSev;

    @Autowired
    private CommentSev commentSev;

    @Autowired
    private UserSev userSev;

    @PostMapping("page")
    @ApiOperation(value = "获取帖子分页")
    public ResponseEntity<?> page(@RequestBody RequestEntity<TopicDTO> requestEntity) {

        Integer pageNum = requestEntity.getPageNum();
        Integer pageSize = requestEntity.getPageSize();

        TopicDTO topicDTO;
        List<TopicDTO> data = requestEntity.getData();
        if (data == null || data.isEmpty()) {
            topicDTO = new TopicDTO();
        } else {
            topicDTO = data.get(0);
        }

        PageInfo pageInfo = topicSev.getPage(pageNum, pageSize, topicDTO);

        if (pageInfo != null && pageInfo.getTotal() > 0) {
            List<Topic> topicList = pageInfo.getList();
            List<TopicDTO> topicDTOList = topicList.stream()
                    .map(topic -> {
                        TopicDTO dto = null;
                        Optional<BaseDTO> optional = topic.toDTO();
                        if (optional.isPresent()) {
                            dto = (TopicDTO) optional.get();
                        }
                        return dto;
                    }).collect(Collectors.toList());
            pageInfo.setList(topicDTOList);
        }

        return new ResponseEntity<>(pageInfo);
    }

    @PostMapping("list")
    @ApiOperation(value = "获取帖子列表")
    public ResponseEntity<TopicDTO> list(@RequestBody RequestEntity<TopicDTO> requestEntity) {

        TopicDTO topicDTO;
        List<TopicDTO> data = requestEntity.getData();
        if (data == null || data.isEmpty()) {
            topicDTO = new TopicDTO();
        } else {
            topicDTO = data.get(0);
        }

        List<Topic> topicList = topicSev.getList(topicDTO);

        if (topicList.isEmpty()) {
            return new ResponseEntity<>(ServerStatusCode.DATA_NOT_FOUND);
        }

        List<TopicDTO> topicDTOList = topicList.stream()
            .map(topic -> {
                TopicDTO dto = null;
                Optional<BaseDTO> optional = topic.toDTO();
                if (optional.isPresent()) {
                    dto = (TopicDTO) optional.get();
                }
                return dto;
            }).collect(Collectors.toList());

        return new ResponseEntity<>(topicDTOList);
    }

    @PostMapping("visit")
    @ApiOperation(value = "访问帖子")
    public ResponseEntity<TopicDTO> visit(@RequestBody RequestEntity<TopicDTO> requestEntity) {

        TopicDTO topicDTO;
        List<TopicDTO> data = requestEntity.getData();
        if (data == null || data.isEmpty()) {
            return new ResponseEntity<>(ServerStatusCode.REQUEST_DATA_EMPTY);
        } else {
            topicDTO = data.get(0);
        }

        List<Topic> topicList = topicSev.getTopic(topicDTO);

        List<TopicDTO> topicDTOList = topicList.stream()
                .map(topic -> {
                    TopicDTO dto = null;
                    Optional<BaseDTO> optional = topic.toDTO();
                    if (optional.isPresent()) {
                        dto = (TopicDTO) optional.get();
                    }
                    return dto;
                }).collect(Collectors.toList());

        if (topicDTOList.isEmpty()) {
            return new ResponseEntity<>(ServerStatusCode.RESPONSE_DATA_EMPTY);
        }

        topicDTOList.forEach(dto -> {
            // 设置用户名
            UserDTO userDTO = new UserDTO();
            userDTO.setAccount(dto.getCreateUser());
            User user = userSev.getUser(userDTO).get(0);
            dto.setCreateUserName(user.getUsername());
            // 设置评论
            CommentDTO commentDTO = new CommentDTO();
            commentDTO.setParentId(dto.getTopicId());
            commentDTO.setCommentType(CommonField.FIRST_LEVEL_COMMENT);
            List<Comment> commentList = commentSev.getCommentList(commentDTO);
            List<CommentDTO> commentDTOList = commentList.stream()
                    .map(comment -> {
                        CommentDTO cdto = null;
                        Optional<BaseDTO> optional = comment.toDTO();
                        if (optional.isPresent()) {
                            cdto = (CommentDTO) optional.get();
                            UserDTO param = new UserDTO();
                            param.setAccount(cdto.getCreateUser());
                            List<User> userList = userSev.getUser(param);
                            if (!userList.isEmpty()) {
                                User user1 = userList.get(0);
                                cdto.setCreateUsername(user1.getUsername());
                            }
                        }
                        return cdto;
                    }).collect(Collectors.toList());
            dto.setCommentDTOList(commentDTOList);
        });



        return new ResponseEntity<>(topicDTOList);
    }

    @PostMapping("publish")
    @ApiOperation(value = "发布帖子")
    public ResponseEntity<TopicDTO> publish(@RequestBody RequestEntity<TopicDTO> requestEntity, HttpServletRequest request) {

        String account = request.getAttribute("account").toString();

        TopicDTO topicDTO;
        List<TopicDTO> data = requestEntity.getData();
        if (data == null || data.isEmpty()) {
            return new ResponseEntity<>(ServerStatusCode.REQUEST_DATA_EMPTY);
        } else {
            topicDTO = data.get(0);
        }

        // 参数校验
        if (StringUtils.isEmpty(topicDTO.getTopicTitle())) {
            return new ResponseEntity<>(ServerStatusCode.TOPIC_TITLE_EMPTY);
        }
        if (topicDTO.getTopicTitle().length() > 20) {
            return new ResponseEntity<>(ServerStatusCode.TOPIC_TITLE_TOO_LONG);
        }
        if (StringUtils.isEmpty(topicDTO.getTopicContent())) {
            return new ResponseEntity<>(ServerStatusCode.TOPIC_CONTENT_EMPTY);
        }
        if (topicDTO.getTopicContent().length() > 1000) {
            return new ResponseEntity<>(ServerStatusCode.TOPIC_CONTENT_TOO_LONG);
        }
        if (StringUtils.isEmpty(topicDTO.getSection())) {
            return new ResponseEntity<>(ServerStatusCode.SECTION_EMPTY);
        }
        SectionDTO sectionDTO = new SectionDTO();
        sectionDTO.setSectionId(topicDTO.getSection());
        if (sectionSev.getSection(sectionDTO).isEmpty()) {
            return new ResponseEntity<>(ServerStatusCode.SECTION_NOT_EXIST);
        }

        // 发布
        List<Topic> topicList = topicSev.publish(topicDTO, account);
        if (topicList.isEmpty()) {
            return new ResponseEntity<>(ServerStatusCode.DATA_NOT_FOUND);
        }

        List<TopicDTO> topicDTOList = topicList.stream()
                .map(topic -> {
                    TopicDTO dto = null;
                    Optional<BaseDTO> optional = topic.toDTO();
                    if (optional.isPresent()) {
                        dto = (TopicDTO) optional.get();
                        UserDTO param = new UserDTO();
                        param.setAccount(dto.getCreateUser());
                        List<User> userList = userSev.getUser(param);
                        if (!userList.isEmpty()) {
                            String username = userList.get(0).getUsername();
                            dto.setCreateUserName(username);
                        }
                    }
                    return dto;
                }).collect(Collectors.toList());

        return new ResponseEntity<>(topicDTOList);
    }

    @PostMapping("like")
    @ApiOperation(value = "点赞帖子")
    public ResponseEntity<TopicDTO> like(@RequestBody RequestEntity<TopicDTO> requestEntity, HttpServletRequest request) {

        String account = request.getAttribute("account").toString();

        TopicDTO topicDTO;
        List<TopicDTO> data = requestEntity.getData();
        if (data == null || data.isEmpty()) {
            return new ResponseEntity<>(ServerStatusCode.REQUEST_DATA_EMPTY);
        } else {
            topicDTO = data.get(0);
        }

        // 点赞
        List<Topic> topicList = topicSev.like(topicDTO, account);
        if (topicList.isEmpty()) {
            return new ResponseEntity<>(ServerStatusCode.DATA_NOT_FOUND);
        }

        List<TopicDTO> topicDTOList = topicList.stream()
                .map(topic -> {
                    TopicDTO dto = null;
                    Optional<BaseDTO> optional = topic.toDTO();
                    if (optional.isPresent()) {
                        dto = (TopicDTO) optional.get();
                        UserDTO param = new UserDTO();
                        param.setAccount(dto.getCreateUser());
                        List<User> userList = userSev.getUser(param);
                        if (!userList.isEmpty()) {
                            String username = userList.get(0).getUsername();
                            dto.setCreateUserName(username);
                        }
                    }
                    return dto;
                }).collect(Collectors.toList());

        return new ResponseEntity<>(topicDTOList);
    }
}
