jQuery.extend({

  /**
   * 初始化首页
   */
  initIndex: function () {
    $.initTop();
    $.initFooter();
    $.initSection();
    $.initFilter();
    var requestJson = {
      pageNum: 1,
      pageSize: 20,
      filter: {
        createTimeDesc: true
      }
    };
    $.postPage(requestJson);
  },

  /**
   * 初始化筛选条件
   */
  initFilter: function() {
    // 最新
    $("#topic-new").click(function() {
      var requestJson = {
        pageNum: 1,
        pageSize: 20,
        filter: {
          createTimeDesc: true
        },
        data: [
          {
            section: $("#section-nav").attr("section-sign"),
          },
        ],
      };
      $.postPage(requestJson);
    })
    // 精华
    $("#topic-essential").click(function() {
      var requestJson = {
        pageNum: 1,
        pageSize: 20,
        filter: {
          topicEssential: true
        },
        data: [
          {
            section: $("#section-nav").attr("section-sign")
          },
        ],
      };
      $.postPage(requestJson);
    })
  },

  /**
   * 初始化顶部栏
   */
  initTop: function () {
    var token = $.cookie("token");
    if (token) {
      $("#header").load(
        "/community/common/header-logined"
      );
    } else {
      $("#header").load(
        "/community/common/header-non-logined"
      );
    }
  },

  /**
   * 初始化底部内容
   */
  initFooter: function () {
    $("#footer").load("/community/common/footer");
  },

  /**
   * 初始化专栏数据
   */
  initSection: function () {
    $.post("/community/section/list", function (result) {
      if (result == null) {
        $.alert({
          title: "出错啦!",
          content: "请稍后再试！",
        });
      } else {
        if (result.code !== "2000") {
          $.alert({
            title: "出错啦!",
            content: result.description,
          });
        } else {
          var $nav = $("#section-nav");

          var $span = $("<span/>", {
            class: "text-black-50",
            html: "全部"
          });
          var $a = $("<a/>", {
            class: "nav-link",
            href: "javascript:void(0)",
          }).click(function () {
            $("#section-nav").attr("section-sign", null)
            var requestJson = {
              pageNum: 1,
              pageSize: 20
            };
            $.postPage(requestJson);
          });

          var $li = $("<li/>", {
            class: "nav-item",
          });

          $a.append($span);
          $li.append($a);
          $nav.append($li);

          $.each(result.data, function (index, section) {
            var $span = $("<span/>", {
              class: "text-black-50",
              html: section.sectionName
            });
            var $a = $("<a/>", {
              class: "nav-link",
              href: "javascript:void(0)",
            }).click(function () {
              $("#section-nav").attr("section-sign", section.sectionId)
              var requestJson = {
                pageNum: 1,
                pageSize: 20,
                data: [
                  {
                    section: section.sectionId,
                  },
                ],
              };
              $.postPage(requestJson);
            });

            var $li = $("<li/>", {
              class: "nav-item",
            });

            $a.append($span);
            $li.append($a);
            $nav.append($li);
          });
        }
      }
    });
  },

  /**
   * 初始化发布页
   */
  initPublish: function () {
    // 初始化专栏
    $.post("/community/section/list", function (result) {
      if (result == null) {
        $.alert({
          title: "出错啦!",
          content: "请稍后再试！",
        });
      } else {
        if (result.code !== "2000") {
          $.alert({
            title: "出错啦!",
            content: result.description,
          });
        } else {
          var $selectSection = $("#selectSection");

          $.each(result.data, function (index, section) {
            var $option = $("<option/>", {
              value: section.sectionId,
              html: section.sectionName,
            });
            $selectSection.append($option);
          });
        }
      }
    });
    $(function () {
      var editor = editormd("topicEditor", {
        width: "100%",
        height: "500px",
        path: "/community/editor.md/lib/",
        placeholder: "请在这里输入详细描述",
        syncScrolling: "single",
        saveHTMLToTextarea: true,
        emoji: true,
        tex: true, // 开启科学公式TeX语言支持，默认关闭
        flowChart: true, // 开启流程图支持，默认关闭
        sequenceDiagram: true, // 开启时序/序列图支持，默认关闭,
        imageUpload: true,
        imageFormats: ["jpg", "jpeg", "gif", "png", "bmp", "webp"],
      });
      $("#publishTopic").click(function () {
        var requestJson = {
          data: [
            {
              topicTitle: $("#topicTitle").val(),
              topicContent: editor.getMarkdown(),
              section: $("#selectSection").val(),
            },
          ],
        };
        $.ajax({
          contentType: "application/json",
          type: "POST",
          url: "/community/topic/publish",
          dataType: "json",
          data: JSON.stringify(requestJson),
          success: function (result) {
            if (result == null) {
              $.alert({
                title: "出错啦!",
                content: "请稍后再试！",
              });
            } else {
              if (result.code !== "2000") {
                $.alert({
                  title: "出错啦!",
                  content: result.description,
                });
              } else {
                var topic = result.data[0];
                $(location).attr(
                  "href",
                  "/community/topic/view/" + topic.topicId
                );
              }
            }
          },
        });
      });
    });
  },

  /**
   * 初始化已登录顶部栏
   */
  initLoginedHeader: function () {
    // 获取用户信息
    $.ajax({
      contentType: "application/json",
      type: "POST",
      url: "/community/user/loginInfo",
      success: function (result) {
        if (result == null) {
          $.alert({
            title: "出错啦!",
            content: "请稍后再试！",
          });
        } else {
          if (result.code !== "2000") {
            $.alert({
              title: "出错啦!",
              content: result.description,
            });
          } else {
            var loginUsername = result.data[0].username;
            $("#loginUsername").html(loginUsername);
          }
        }
      },
    });
    // 初始化退出按钮
    $("#logout").click((function () {
      $.ajax({
        contentType: "application/json",
        type: "POST",
        url: "/community/user/logout",
        success: function (result) {
          if (result == null) {
            $.alert({
              title: "出错啦!",
              content: "请稍后再试！",
            });
          } else {
            if (result.code !== "2000") {
              $.alert({
                title: "出错啦!",
                content: result.description,
              });
            } else {
              location.reload();
            }
          }
        },
      })
    }))
  },

  /**
   * 初始化未登录顶部栏
   */
  initNonLoginedHeader: function () {
    // 初始化注册按钮
    $("#register-button").click(function () {
      var requestJson = {
        data: [
          {
            account: $("#registerAccount").val(),
            username: $("#registerName").val(),
            password: $("#registerPassword").val(),
          },
        ],
      };
      $.ajax({
        contentType: "application/json",
        type: "POST",
        url: "/community/user/register",
        dataType: "json",
        data: JSON.stringify(requestJson),
        success: function (result) {
          if (result == null) {
            $.alert({
              title: "出错啦!",
              content: "请稍后再试！",
            });
          } else {
            if (result.code !== "2000") {
              $.alert({
                title: "出错啦!",
                content: result.description,
              });
            } else {
              location.reload();
            }
          }
        },
      });
    });
    // 初始化登录按钮
    $("#login-button").click(function () {
      var requestJson = {
        data: [
          {
            account: $("#loginAccount").val(),
            password: $("#loginPassword").val(),
          },
        ],
      };
      $.ajax({
        contentType: "application/json",
        type: "POST",
        url: "/community/user/login",
        dataType: "json",
        data: JSON.stringify(requestJson),
        success: function (result) {
          if (result == null) {
            $.alert({
              title: "出错啦!",
              content: "请稍后再试！",
            });
          } else {
            if (result.code !== "2000") {
              $.alert({
                title: "出错啦!",
                content: result.description,
              });
            } else {
              location.reload();
            }
          }
        },
      });
    });
  },

  /**
   * 渲染个人主页帖子列表
   */
  renderUserTopicList: function (dataList) {
    $("#homepage-list").empty()
    $.each(dataList, function (index, data) {
      var $topicDiv = $("<div/>", {
        class: "row border border-bottom-0 border-left-0 border-right-0 community-ele-border-color-grey"
      })
      var $topicContent = $("<div/>", {
        class: "col-lg-12 my-lg-3"
      })
      var $topicMedia = $("<div/>", {
        class: "media"
      })
      var $mediaImg = $("<img/>", {
        src: data.headPortrait,
        class: "mr-lg-3 rounded-circle community-ele-width-50px community-ele-height-50px"
      })
      var $mediaBody = $("<div/>", {
        class: "media-body"
      }).append($("<h6/>", {
        class: "font-weight-bold",
        html: data.createUserName
        }))
        .append($("<p/>", {
          class: "small text-black-50",
          html: data.relativeDate
        }))
        .append($("<p/>", {
          class: "font-weight-bold",
          html: data.topicTitle
        }))
        .append($("<p/>", {
          html: data.topicContent
        }))
  
      $topicMedia.append($mediaImg).append($mediaBody)
      var $topicInfo = $("<div/>", {
        class: "row border border-bottom-0 border-left-0 border-right-0 community-ele-border-color-grey"
      })
      var $topicLike = $("<div/>", {
        class: "col-lg-4 text-center mt-lg-3 border border-top-0 border-left-0 border-bottom-0 community-ele-border-color-grey"
      }).append($("<a/>", {
        href: "javascript:void(0)",
        class: "text-black-50 small"
      }).append($("<i/>", {
        class: "bi bi-hand-thumbs-up"
      })).append($("<span/>", {
        html: "&nbsp;&nbsp;赞" 
      })))
      var $topicConment = $("<div/>", {
        class: "col-lg-4 text-center mt-lg-3 border border-top-0 border-left-0 border-bottom-0 community-ele-border-color-grey"
      }).append($("<a/>", {
        href: "javascript:void(0)",
        class: "text-black-50 small"
      }).append($("<i/>", {
        class: "bi bi-chat-left-dots"
      })).append($("<span/>", {
        html: "&nbsp;&nbsp;评论" 
      })))
      var $topicFavorite = $("<div/>", {
        class: "col-lg-4 text-center mt-lg-3"
      }).append($("<a/>", {
        href: "javascript:void(0)",
        class: "text-black-50 small"
      }).append($("<i/>", {
        class: "bi bi-bookmark-star"
      })).append($("<span/>", {
        html: "&nbsp;&nbsp;收藏" 
      })))
      $topicInfo.append($topicLike).append($topicConment).append($topicFavorite)
      $topicContent.append($topicMedia).append($topicInfo)
      $topicDiv.append($topicContent)
      $("#homepage-list").append($topicDiv)
    })
  },

  /**
   * 获取个人主页帖子列表
   */
  postUserTopicList: function() {
    $.ajax({
      contentType: "application/json",
      type: "POST",
      url: "/community/user/topicList",
      success: function (result) {
        if (result == null) {
          $.alert({
            title: "出错啦!",
            content: "请稍后再试！",
          });
        } else {
          if (result.code !== "2000") {
            $.alert({
              title: "出错啦!",
              content: result.description,
            });
          } else {
            $.renderUserTopicList(result.data)
          }
        }
      },
    })
  },

  /**
   * 初始化个人主页
   */
  initHomepage: function () {
    $.postUserTopicList()
    $("#user-topic").click(function () {
      $.postUserTopicList()
    })
  },

  /**
   * 获取帖子分页
   */
  postPage: function (requestJson) {
    $.ajax({
      contentType: "application/json",
      type: "POST",
      url: "/community/topic/page",
      dataType: "json",
      data: JSON.stringify(requestJson),
      success: function (result) {
        if (result == null) {
          $.alert({
            title: "出错啦!",
            content: "请稍后再试！",
          });
        } else {
          if (result.code !== "2000") {
            $.alert({
              title: "出错啦!",
              content: result.description,
            });
          } else {
            $.render(result);
            $.setPage(result);
          }
        }
      },
    });
  },

  /**
   * 渲染帖子列表
   */
  render: function (pageInfo) {
    var $topicList = $("#topic-list");
    $topicList.empty();
    $.each(pageInfo.data[0].list, function (index, topic) {
      var $mediaDiv = $("<div/>", {
        class: "media mb-lg-3",
      });

      var $img = $("<img/>", {
        src: topic.headPortrait,
        class:
          "mr-lg-3 rounded-circle community-ele-width-50px community-ele-height-50px",
      });

      var $mediaBodyDiv = $("<div/>", {
        class: "media-body",
      });

      var $titleDiv = $("<div/>").append(
        $("<a/>", {
          href: "/community/topic/view/" + topic.topicId
        }).append(
          $("<span/>", {
            class:
              "text-black-50",
            html: topic.topicTitle,
          })
        )
      );

      var $contentDiv = $("<div/>", {
        class:
          "mt-lg-1 small text-black-50",
      }).append(
        $("<span/>", {
          html: topic.commentCount + "&nbsp;个回复&nbsp;&nbsp;",
        })
      ).append(
        $("<span/>", {
          html: topic.viewCount + "&nbsp;次浏览&nbsp;&nbsp;",
        })
      ).append(
        $("<span/>", {
          html: "发布时间：" + topic.createTime,
        })
      );

      $mediaBodyDiv.append($titleDiv).append($contentDiv);
      $mediaDiv.append($img).append($mediaBodyDiv);
      $topicList.append($mediaDiv);
    });
  },

  /**
   * 渲染分页
   */
  setPage: function (pageInfo) {
    // 当前页
    var currentPage = pageInfo.data[0].pageNum;
    // 得到总页数
    var pageCount = pageInfo.data[0].pages;
    // 所有导航页号
    var navigatepageNums = pageInfo.data[0].navigatepageNums;

    var $pagination = $("#pagination");

    $pagination.empty();

    if (pageCount > 0) {
      // 当前专区
      var sectionId = $("#section-nav").attr("section-sign")
      var $pageFirst = $("<li/>", {
        class: "page-item",
      }).append(
        $("<a/>", {
          class: "page-link",
          href: "javascript:void(0)",
          html: "首页",
        }).click(function () {
          var requestJson = {
            pageNum: 0,
            pageSize: 20,
            data: [
              {
                section: sectionId,
              },
            ],
          };
          $.postPage(requestJson);
        })
      );

      var $pagePrevious = $("<li/>", {
        class: "page-item",
      }).append(
        $("<a/>", {
          class: "page-link",
          href: "javascript:void(0)",
          html: "&lt;上一页",
        })
      );

      var $pageNext = $("<li/>", {
        class: "page-item",
      }).append(
        $("<a/>", {
          class: "page-link",
          href: "javascript:void(0)",
          html: "下一页&gt;",
        })
      );

      var $pageLast = $("<li/>", {
        class: "page-item",
      }).append(
        $("<a/>", {
          class: "page-link",
          href: "javascript:void(0)",
          html: "尾页",
        }).click(function () {
          var requestJson = {
            pageNum: 99999,
            pageSize: 20,
            data: [
              {
                section: sectionId,
              },
            ],
          };
          $.postPage(requestJson);
        })
      );

      $pagination
        .append($pageFirst)
        .append($pagePrevious)
        .append($pageNext)
        .append($pageLast);

      // 总页数小于等于5，直接加载
      if (pageCount <= 5) {
        $.each(navigatepageNums, function (index, num) {
          var $pageItem = $("<li/>", {
            class: "page-item",
          })
            .append(
              $("<a/>", {
                class: "page-link",
                href: "javascript:void(0)",
                html: num,
              })
            )
            .click(function () {
              var requestJson = {
                pageNum: num,
                pageSize: 20,
                data: [
                  {
                    section: sectionId,
                  },
                ],
              };
              $.postPage(requestJson);
            });
          $pageNext.before($pageItem);
        });
      } else {
        // 总页数大于5
        var sliceArray;
        // 当前页小于等于3，显示前5页
        if (currentPage <= 3) {
          sliceArray = navigatepageNums.slice(0, 5);
        } else if (currentPage >= pageCount - 2) {
          sliceArray = navigatepageNums.slice(pageCount - 5);
        } else {
          sliceArray = navigatepageNums.slice(currentPage - 3, currentPage + 2);
        }
        $.each(sliceArray, function (index, num) {
          var $pageItem;
          if (num === currentPage) {
            $pageItem = $("<li/>", {
              class: "page-item active",
              id: "page-position",
              "data-id": num,
            }).append(
              $("<a/>", {
                class: "page-link",
                href: "javascript:void(0)",
                html: num,
              })
            );
          } else {
            $pageItem = $("<li/>", {
              class: "page-item",
              id: "page-position",
              "data-id": num,
            }).append(
              $("<a/>", {
                class: "page-link",
                href: "javascript:void(0)",
                html: num,
              })
            );
          }
          $pageItem.click(function () {
            var requestJson = {
              pageNum: num,
              pageSize: 20,
              data: [
                {
                  section: sectionId,
                },
              ],
            };
            $.postPage(requestJson);
          });
          $pageNext.before($pageItem);
        });
      }

      $pagePrevious.click(function () {
        var requestJson = {
          pageNum: currentPage - 1,
          pageSize: 20,
          data: [
            {
              section: sectionId,
            },
          ],
        };
        $.postPage(requestJson);
      });

      $pageNext.click(function () {
        var requestJson = {
          pageNum: currentPage + 1,
          pageSize: 20,
          data: [
            {
              section: sectionId,
            },
          ],
        };
        $.postPage(requestJson);
      });
    }
  },

  /**
   * 初始化帖子内容
   */
  initTopic: function (topicId) {
    var requestJson = {
      data: [
        {
          topicId: topicId,
        },
      ],
    };
    $.ajax({
      contentType: "application/json",
      type: "POST",
      url: "/community/topic/visit",
      dataType: "json",
      data: JSON.stringify(requestJson),
      success: function (result) {
        if (result == null) {
          $.alert({
            title: "出错啦!",
            content: "请稍后再试！",
          });
        } else {
          if (result.code !== "2000") {
            $.alert({
              title: "出错啦!",
              content: result.description,
            });
          } else {
            var data = result.data[0];
            $("#topic-title").html(data.topicTitle);
            $("#topic-info")
              .append(
                $("<a/>", {
                  href: "javascript:void(0)",
                }).append("<span/>", {
                  class: "text-black-50",
                  html: "编辑",
                })
              )
              .append(
                $("<span/>", {
                  html: "作者：" + data.createUserName + "&nbsp;&nbsp;&nbsp;",
                })
              )
              .append(
                $("<span/>", {
                  html: data.commentCount + "&nbsp;个回复&nbsp;&nbsp;&nbsp;",
                })
              )
              .append(
                $("<span/>", {
                  html: data.viewCount + "&nbsp;次浏览&nbsp;&nbsp;&nbsp;",
                })
              )
              .append(
                $("<span/>", {
                  html: "发布时间：" + data.createTime,
                })
              );
            $("#topic-content").html(
              '<textarea style="display:none;" id="topic-textarea"></textarea>'
            );
            $("#topic-textarea").val(data.topicContent);
            editormd.markdownToHTML("topic-content", {
              htmlDecode: "style,script,iframe",
              emoji: true,
              taskList: true,
              tex: true, // 默认不解析
              flowChart: true, // 默认不解析
              sequenceDiagram: true, // 默认不解析
            });

            $("#like-count").html(data.likeCount);
            $("#comment-count").html(data.commentCount + "&nbsp;个回复");

            var commentVOList = data.commentVOList;
            var $commentList = $("#comment-list");

            $.each(commentVOList, function (index, commentDTO) {
              var $commentDiv = $("<div/>", {
                class: "row mx-lg-2 my-lg-3",
              });
              var $commentMedia = $("<div/>", {
                class:
                  "media w-100",
              });
              var $img = $("<img/>", {
                src: commentDTO.headPortrait,
                class:
                  "mr-lg-3 rounded-circle community-ele-width-50px community-ele-height-50px",
              });
              var $mediaBody = $("<div/>", {
                class: "media-body",
              });
              var $commentCreater = $("<div/>", {
                class: "mt-lg-0",
              }).append(
                $("<a/>", {
                  href: "javascript:void(0)",
                }).append(
                  $("<span/>", {
                    class: "font-weight-bold text-dark",
                    html: commentDTO.createUsername,
                  })
                )
              );
              var $commentContent = $("<div/>", {
                class: "mt-lg-1",
              }).append(
                $("<span/>", {
                  html: commentDTO.commentContent,
                })
              );
              var $commentInfo = $("<div/>", {
                class:
                  "mt-lg-1 small text-black-50 my-lg-3",
              });
              var $commentIcon = $("<i/>", {
                class: "bi bi-chat-left-dots-fill",
              });
              var $commentCount = $("<span/>", {
                html:
                  "&nbsp;&nbsp;" +
                  commentDTO.commentCount +
                  "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;",
              });
              var $likeIcon = $("<i/>", {
                class: "bi bi-hand-thumbs-up-fill",
              });
              var $likeCount = $("<span/>", {
                html:
                  "&nbsp;&nbsp;" +
                  commentDTO.likeCount +
                  "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;",
              });
              var $createTime = $("<span/>", {
                class: "pull-right",
                html: commentDTO.createTime,
              });

              var $secondCommentDiv = $("<div/>", {
                class:
                  "mt-lg-3 px-lg-3 py-lg-3 border community-ele-border-color-grey rounded",
              });

              $secondCommentDiv.hide();

              $commentInfo
                .append($commentIcon)
                .append($commentCount)
                .append($likeIcon)
                .append($likeCount)
                .append($createTime);
              $mediaBody
                .append($commentCreater)
                .append($commentContent)
                .append($commentInfo)
                .append($secondCommentDiv);
              $commentMedia.append($img).append($mediaBody);
              $commentDiv.append($commentMedia);
              $commentList.append($commentDiv);

              $commentIcon.click(function () {
                $secondCommentDiv.toggle();
                var requestJson = {
                  data: [
                    {
                      parentId: commentDTO.commentId
                    },
                  ],
                };

                $.ajax({
                  contentType: "application/json",
                  type: "POST",
                  url: "/community/comment/second/list",
                  dataType: "json",
                  data: JSON.stringify(requestJson),
                  success: function (result) {
                    if (result == null) {
                      $.alert({
                        title: "出错啦!",
                        content: "请稍后再试！",
                      });
                    } else {
                      if (result.code !== "2000") {
                        $secondCommentDiv.empty();
                        $.alert({
                          content: result.description,
                        });
                      } else {
                        console.log(result);
                        var secondCommentDTOList = result.data;
                        $commentCount.html(
                          "&nbsp;&nbsp;" +
                            commentDTO.commentCount +
                            "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
                        );
                        $secondCommentDiv.empty();
                        $.each(
                          secondCommentDTOList,
                          function (index, secondCommentDTO) {
                            var $secondCommentMedia = $("<div/>", {
                              class:
                                "media mb-lg-3 w-100",
                            });
                            var $secondCommentMediaImg = $("<img/>", {
                              src: secondCommentDTO.headPortrait,
                              class:
                                "mr-lg-3 rounded-circle community-ele-width-40px community-ele-height-40px",
                            });
                            var $secondCommentMediaBody = $("<div/>", {
                              class: "media-body",
                            });
                            var $secondCommentInfo = $("<div/>", {
                              class: "mt-lg-0",
                            })
                              .append(
                                $("<a/>", {
                                  href: "javascript:void(0)",
                                }).append(
                                  $("<span/>", {
                                    class:
                                      "font-weight-bold text-dark",
                                    html: secondCommentDTO.createUsername,
                                  })
                                )
                              )
                              .append(
                                $("<span/>", {
                                  class:
                                    "pull-right small text-black-50",
                                  html: secondCommentDTO.createTime,
                                })
                              );
                            var $secondCommentContent = $("<div/>", {
                              class: "mt-lg-1",
                            }).append(
                              $("<span/>", {
                                html: secondCommentDTO.commentContent,
                              })
                            );
                            $secondCommentMediaBody
                              .append($secondCommentInfo)
                              .append($secondCommentContent);
                            $secondCommentMedia
                              .append($secondCommentMediaImg)
                              .append($secondCommentMediaBody);
                            $secondCommentDiv.append($secondCommentMedia);
                          }
                        );
                      }
                    }
                    var $secondCommentForm = $("<form/>");
                    var $secondCommentFormGroup = $("<div/>", {
                      class: "form-group",
                    });
                    var $secondCommentInput = $(
                      $("<input/>", {
                        id: "secondReplyInput",
                        class: "form-control",
                      })
                    );
                    var $secondCommentFormBtn = $("<button/>", {
                      type: "button",
                      class: "btn btn-primary btn-sm",
                      html: "提交",
                    }).click(function () {
                      var requestJson = {
                        data: [
                          {
                            parentId: commentDTO.commentId,
                            commentContent: $("#secondReplyInput").val(),
                            commentType: "2",
                          },
                        ],
                      };
                      $.ajax({
                        contentType: "application/json",
                        type: "POST",
                        url: "/community/comment/publish",
                        dataType: "json",
                        data: JSON.stringify(requestJson),
                        success: function (result) {
                          if (result == null) {
                            $.alert({
                              title: "出错啦!",
                              content: "请稍后再试！",
                            });
                          } else {
                            if (result.code !== "2000") {
                              $.alert({
                                content: result.description,
                              });
                            } else {
                              location.reload();
                            }
                          }
                        },
                      });
                    });
                    $secondCommentFormGroup.append($secondCommentInput);
                    $secondCommentForm
                      .append($secondCommentFormGroup)
                      .append($secondCommentFormBtn);
                    $secondCommentDiv.append($secondCommentForm);
                  },
                });
              });
            });
          }
        }
      },
    });
    $("#publishFirstComment").click(function () {
      var requestJson = {
        data: [
          {
            parentId: topicId,
            commentContent: $("#firstReplyInput").val(),
            commentType: "1",
          },
        ],
      };
      $.ajax({
        contentType: "application/json",
        type: "POST",
        url: "/community/comment/publish",
        dataType: "json",
        data: JSON.stringify(requestJson),
        success: function (result) {
          if (result == null) {
            $.alert({
              title: "出错啦!",
              content: "请稍后再试！",
            });
          } else {
            if (result.code !== "2000") {
              $.alert({
                title: "出错啦!",
                content: result.description,
              });
            } else {
              location.reload();
            }
          }
        },
      });
    });
  },
});