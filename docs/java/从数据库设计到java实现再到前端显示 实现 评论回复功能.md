---
title: 从数据库设计到java实现再到前端显示 实现 评论回复功能
date: 2020-05-25
categories:
 - java
tags:
 - java
 - mysql
---

## 背景

在开发博客系统的时候，遇到了一个技术难点，就是如何实现用户对博客的评论和回复功能？

尝试了很多套方案，最后还是采用了Java的链表结构来查询处理评论回复。

## 博客如何实现评论回复功能

### 数据库设计

这里主要展示有关评论和回复的核心数据库设计：

#### Blog（博客表）

![在这里插入图片描述](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202201222340562.png)
#### User（用户表）
![在这里插入图片描述](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202201222340160.png)
#### Observe评论表
![在这里插入图片描述](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202201222340641.png)
### 数据库设计概要
1. 博客表主要用于id和评论表的`blog_id`关联，用于表示这条评论是和哪篇博客相关联的。
2. 用户表主要用于id和评论表的observer_id关联，用于表示这条评论和哪个用户相关联。
3. 博客表和用户表不是关键性内容，只用了解其id和评论表有关联即可。
4. 关键点在于评论表设计的`last_id`字段
- 如果`last_id`为`null`，说明此条评论为一级评论（直接评论这篇博客）
- 如果`last_id`不为`null`，其值代表回复哪条评论（上一级评论的id）
依据这样的`last_id`设计，可完美实现一条链状的评论（多级评论回复）。通过last_id我们就能找到这条回复是回复的哪条评论。

## java实现评论的查询

### 存储

对于存储结构，使用链表。通过链表，我们可以一步步找到最后一条评论。因为一条评论可能存在多人回复（同级评论或者回复有多条），所以我们采用List存储下一个对象（下一级评论回复）。

### 查询

1. 先查询`last_id`为`null`的情况，即所有的一级评论集合。
2. 然后查询`last_id`不为`null`的情况，即所有非一级评论集合（为评论的回复）。
3. 通过`last_id`找到对应的评论、回复，添加到链表中。

### 具体实现

数据库查询主要用的是mybatis的通用mapper，如果不会，可参看我的另一篇博客：[SSM项目中如何使用通用mapper(tk.mapper)?如何使用注解简化mybatis的开发(舍弃大量的xml文件)？注解处理一对一、一对多、多对多的关系？](https://blog.csdn.net/qq_42937522/article/details/103258526)

主要演示查询的实现，增删改都比较简单，暂略。

#### 评论的实体类

```java
@Entity
@Data
@Table(name="observe")
public class Observe implements Serializable {

    /** 评论id */
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @NotNull(groups = UpdateGroup.class,message = "修改评论信息，id不可以空")
    private Long id;

    /** 所属博客id */
    @Column(name="blog_id")
    @NotNull(message = "所属博客id不能为空")
    private Long blogId;

    /** 评论者id */
    @Column(name="observer_id")
    @NotNull(groups = UpdateGroup.class,message = "评论者id不能为空")
    private Long observerId;

    /** 评论内容 */
    @Column(name="observe_content")
    @NotBlank(message = "评论内容不能为空")
    private String observeContent;

    /** 评论上一级的id */
    @Column(name="last_id")
    private Long lastId;

    /** 是否删除 */
    @Column(name="is_delete")
    private Boolean delete;

    /** 创建时间（评论时间） */
    @Column(name="create_date")
    @JSONField(format="yyyy-MM-dd HH:mm:ss")
    private Timestamp createDate;

    /** 修改删除 */
    @Column(name="update_date")
    @JSONField(format="yyyy-MM-dd HH:mm:ss")
    private Timestamp updateDate;

    public interface UpdateGroup {
    }
}
```

#### 评论的链表结构

继承评论的实体类

```java
/**
 * 功能描述：封装博客评论的BO <br>
 * 采用链表结构实现
 **/
@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
public class ObserveNodeBO extends Observe {

    /**
     * 评论的用户信息
     */
    private User user;

    /**
     * 下一条回复
     */
    private List<ObserveNodeBO> nextNodes = new ArrayList<>();

    public ObserveNodeBO ( ObserveNodeBO observeNodeBo ) {
        super();
        setId(observeNodeBo.getId());
        setBlogId(observeNodeBo.getBlogId());
        setObserverId(observeNodeBo.getObserverId());
        setObserveContent(observeNodeBo.getObserveContent());
        setLastId(observeNodeBo.getLastId());
        setDelete(observeNodeBo.getDelete());
        setCreateDate(observeNodeBo.getCreateDate());
        setUpdateDate(observeNodeBo.getUpdateDate());
        this.user = observeNodeBo.getUser();
    }

}
```

#### 评论的mapper（数据库操作）

评论与用户之间是一对一的关系，所以这里使用mybatis的注解实现一对一关联。

```java
/**
 * 功能描述： 自定义的mapper
 * ‘@RegisterMapper’ 使自定义的mapper可以被扫描到
 **/
@RegisterMapper
public interface CommentMapper<T> extends Mapper<T>, IdListMapper<T, Long>, InsertListMapper<T> {

}
```

```java
@Component
public interface ObserveMapper extends CommentMapper<Observe> {

    /**
     * 功能描述：根据博客id和lastId为空，查询所有的一级评论信息集合
     * @param blogId 博客id
     * @return 一级评论信息集合
     * @author RenShiWei
     * Date: 2020/4/16 10:37
     */
    @Select("SELECT * FROM observe o LEFT JOIN user u " +
            "ON o.observer_id=u.id " +
            "WHERE o.blog_id=#{blogId} AND o.last_id is null")
    @Results({
            @Result(id = true, column = "id", property = "id"),
            @Result(column = "blog_id", property = "blogId"),
            @Result(column = "observer_id", property = "observerId"),
            @Result(column = "observe_content", property = "observeContent"),
            @Result(column = "observer_id", property = "user",
                    one = @One(select = "com.blog.module.business.mapper.UserMapper.queryUserForObserve",
                            fetchType = FetchType.EAGER)),
            @Result(column = "last_id", property = "lastId"),
            @Result(column = "is_delete", property = "delete"),
            @Result(column = "create_date", property = "createDate"),
            @Result(column = "update_date", property = "updateDate")
    })
    List<ObserveNodeBO> queryFirstObserveList (@Param("blogId") Long blogId );


    /**
     * 功能描述：根据博客id和lastId不为空，查询所有的二级评论信息集合
     * @param blogId 博客id
     * @return 二级评论信息集合
     * @author RenShiWei
     * Date: 2020/4/16 10:37
     */
    @Select("SELECT * FROM observe o LEFT JOIN user u " +
            "ON o.observer_id=u.id " +
            "WHERE o.blog_id=#{blogId} AND o.last_id is not null")
    @Results({
            @Result(id = true, column = "id", property = "id"),
            @Result(column = "blog_id", property = "blogId"),
            @Result(column = "observer_id", property = "observerId"),
            @Result(column = "observe_content", property = "observeContent"),
            @Result(column = "observer_id", property = "user",
                    one = @One(select = "com.blog.module.business.mapper.UserMapper.queryUserForObserve",
                            fetchType = FetchType.EAGER)),
            @Result(column = "last_id", property = "lastId"),
            @Result(column = "is_delete", property = "delete"),
            @Result(column = "create_date", property = "createDate"),
            @Result(column = "update_date", property = "updateDate")
    })
    List<ObserveNodeBO> querySecondObserveList (@Param("blogId") Long blogId );


}
```

```java
@Component
public interface UserMapper extends CommentMapper<User> {

    /**
     * 功能描述：根据主键id查询用户信息
     * （在observe中一对一关系使用）
     *
     * @param id 用户id
     * @return 用户信息
     * @author RenShiWei
     * Date: 2020/4/16 10:43
     */
    @Select("SELECT * FROM user WHERE id=#{id}")
    @Results({
            @Result(id = true, column = "id", property = "id"),
            @Result(column = "create_date", property = "createDate"),
            @Result(column = "last_id", property = "lastId"),
            @Result(column = "is_delete", property = "delete"),
            @Result(column = "update_date", property = "updateDate")
    })
    User queryUserForObserve (@Param("id") Long id );

}

```

#### 评论的业务逻辑实现

```java
public interface ObserveService {

	/**
     * 功能描述：根据博客id，查询此博客的所有评论信息
     * @param blogId 博客id
     * @return 博客的评论信息
     */
    List<ObserveNodeBO> queryObserveByBlogId( Long blogId);
    
    /**
     * 功能描述：根据评论id查询用户信息
     * @param observeId 评论id
     * @return 评论信息，携带用户信息
     */
    ObserveUserBo queryObserveUserById(Long observeId);
    
}
```

```java
@Service
public class ObserveServiceImpl implements ObserveService {
	@Autowired
    private ObserveMapper observeMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private BlogMapper blogMapper;

	/**
     * 功能描述：根据博客id，查询此博客的所有评论信息
     *
     * @param blogId 博客id
     * @return 博客的评论信息
     */
    @Override
    public List<ObserveNodeBO> queryObserveByBlogId ( Long blogId ) {
        //所有未处理的一级评论集合
        List<ObserveNodeBO> firstObserveList = observeMapper.queryFirstObserveList(blogId);
        //所有未处理的二级评论集合
        List<ObserveNodeBO> secondObserveList = observeMapper.querySecondObserveList(blogId);

        //将二级评论用链表的方式添加到一级评论
        List<ObserveNodeBO> list = addAllNode(firstObserveList, secondObserveList);

        //控制台打印评论回复
        show(list);

        //返回处理后的评论信息
        return list;
    }

    /**
     * 功能描述：根据评论id查询用户信息
     *
     * @param observeId 评论id
     * @return 评论信息，携带用户信息
     */
    @Override
    public ObserveUserBo queryObserveUserById ( Long observeId ) {
        Observe observe = observeMapper.selectByPrimaryKey(observeId);
        User user = userMapper.selectByPrimaryKey(observe.getObserverId());
        ObserveUserBo observeUserBo = new ObserveUserBo();
        observeUserBo.setObserve(observe);
        observeUserBo.setUser(user);
        return observeUserBo;
    }


    /**
     * 功能描述：将单个node添加到链表中
     *
     * @param firstList   第一层评论集合（链表）
     * @param observeNode 非第一层评论的回复信息
     * @return 是否添加
     */
    private boolean addNode ( List<ObserveNodeBO> firstList, ObserveNodeBO observeNode ) {
        //循环添加
        for (ObserveNodeBO node : firstList) {
            //判断留言的上一段是否是这条留言（判断这条回复，是否是当前评论的回复）
            if (node.getId().equals(observeNode.getLastId())) {
                //是，添加，返回true
                node.getNextNodes().add(observeNode);
                return true;
            } else {
                //否则递归继续判断
                if (node.getNextNodes().size() != 0) {
                    if (addNode(node.getNextNodes(), observeNode)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * 功能描述：将查出来的lastId不为null的回复都添加到第一层Node集合中
     *
     * @param firstList 第一层评论集合（链表）
     * @param thenList  非第一层评论集合（链表）
     * @return 所有评论集合（非第一层评论集合对应添加到第一层评论集合，返回）
     */
    private List<ObserveNodeBO> addAllNode ( List<ObserveNodeBO> firstList, List<ObserveNodeBO> thenList ) {
        while (thenList.size() != 0) {
            int size = thenList.size();
            for (int i = 0; i < size; i++) {
                if (addNode(firstList, new ObserveNodeBO(thenList.get(i)))) {
                    thenList.remove(i);
                    i--;
                    size--;
                }
            }
        }
        return firstList;
    }

    /**
     * 功能描述：打印评论的链表回复信息
     *
     * @param list 评论信息（链表集合）
     */
    private void show ( List<ObserveNodeBO> list ) {
        for (ObserveNodeBO node : list) {
            System.out.println(node.getObserverId() + " 用户回复了" + node.getLastId() + "：" + node.getObserveContent());
            //递归打印回复信息
            if (node.getNextNodes().size() != 0) {
                show(node.getNextNodes());
            }
        }
    }
}
```
#### 评论的接口

```java
@RestController
@RequestMapping("/api/observe")
public class ObserveController {

    @Autowired
    private ObserveService observeService;

	/**
     * 功能描述：根据博客id，查询此博客的所有评论信息（链表类型的数据）
     * @param blogId 博客id
     * @return 博客的评论信息
     */
    @GetMapping("/{blogId}")
    public ResponseEntity<List<ObserveNodeBO>> queryObserveByBlogId (
            @ApiParam(name = "blogId", value = "博客id", required = true) @PathVariable Long blogId
    ) {
        return ResponseEntity.ok(observeService.queryObserveByBlogId(blogId));
    }

	/**
     * 功能描述：根据评论id查询用户信息（评论信息，携带用户信息）
     * @param observeId 评论id
     * @return 评论信息，携带用户信息
     */
    @GetMapping("/user/{observeId}")
    public ResponseEntity<ObserveUserBo> queryObserveUserById (
            @ApiParam(name = "observeId", value = "评论id", required = true)@PathVariable Long observeId
    ) {
        return ResponseEntity.ok(observeService.queryObserveUserById(observeId));
    }
}
```

#### 查询评论的实例

数据库数据

博客id为29的所有评论信息
![在这里插入图片描述](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202201222341656.png)

查询后回显的数据

```java
[
  {
    "id": 27,
    "blogId": 29,
    "observerId": 63,
    "observeContent": "你好",
    "lastId": null,
    "delete": false,
    "createDate": "2020-05-13 12:01:24",
    "updateDate": "2020-05-13 12:01:24",
    "user": {
      "id": 63,
      "nickname": "焦前进",
      "email": "123456789@qq.com",
      "picture": "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
      "identity": 0,
      "delete": false,
      "createDate": "2020-05-13 12:01:24",
      "updateDate": "2020-05-13 12:01:24",
      "account": null,
      "password": null
    },
    "nextNodes": []
  },
  {
    "id": 28,
    "blogId": 29,
    "observerId": 64,
    "observeContent": "你也好啊",
    "lastId": null,
    "delete": false,
    "createDate": "2020-05-13 12:19:16",
    "updateDate": "2020-05-13 12:19:16",
    "user": {
      "id": 64,
      "nickname": "末",
      "email": "1542890862@qq.com",
      "picture": "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
      "identity": 0,
      "delete": false,
      "createDate": "2020-05-13 12:19:16",
      "updateDate": "2020-05-13 12:19:16",
      "account": null,
      "password": null
    },
    "nextNodes": [
      {
        "id": 29,
        "blogId": 29,
        "observerId": 65,
        "observeContent": "大家好",
        "lastId": 28,
        "delete": false,
        "createDate": "2020-05-13 12:20:25",
        "updateDate": "2020-05-13 12:20:25",
        "user": {
          "id": 65,
          "nickname": "小黑",
          "email": "1542890862@qq.com",
          "picture": "https://fuss10.elemecdn.com/8/27/f01c15bb73e1ef3793e64e6b7bbccjpeg.jpeg",
          "identity": 0,
          "delete": false,
          "createDate": "2020-05-13 12:20:25",
          "updateDate": "2020-05-13 12:20:25",
          "account": null,
          "password": null
        },
        "nextNodes": [
          {
            "id": 30,
            "blogId": 29,
            "observerId": 66,
            "observeContent": "我喜欢小黑",
            "lastId": 29,
            "delete": false,
            "createDate": "2020-05-13 12:21:39",
            "updateDate": "2020-05-13 12:21:39",
            "user": {
              "id": 66,
              "nickname": "小白",
              "email": "1542890862@qq.com",
              "picture": "https://fuss10.elemecdn.com/1/8e/aeffeb4de74e2fde4bd74fc7b4486jpeg.jpeg",
              "identity": 0,
              "delete": false,
              "createDate": "2020-05-13 12:21:39",
              "updateDate": "2020-05-13 12:21:39",
              "account": null,
              "password": null
            },
            "nextNodes": [
              {
                "id": 31,
                "blogId": 29,
                "observerId": 67,
                "observeContent": "ddd",
                "lastId": 30,
                "delete": false,
                "createDate": "2020-05-13 12:23:54",
                "updateDate": "2020-05-13 12:23:54",
                "user": {
                  "id": 67,
                  "nickname": "小黄",
                  "email": "1542890862@qq.com",
                  "picture": "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
                  "identity": 0,
                  "delete": false,
                  "createDate": "2020-05-13 12:23:54",
                  "updateDate": "2020-05-13 12:23:54",
                  "account": null,
                  "password": null
                },
                "nextNodes": []
              }
            ]
          }
        ]
      }
    ]
  }
]
```

#### Element UI树形控件实现评论信息的回显

这里使用的普通H5项目引入Element UI，如果是vue-cli项目更为方便，原理都是相通的。
引入依赖的目录结构（当然也可以使用CDN的方式引入）

关于Element UI引入，资源已经上传，可在文章顶部下载。
![在这里插入图片描述](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202201222341142.png)

HTML（只保留关键部分）
```javascript
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>博客详情</title>
    <link rel="stylesheet" href="../plugins/element/element-ui-index.css"/>
    <link rel="stylesheet" href="../css/blog-detail.css"/>
    <script src="../plugins/jquery/jquery-3.5.0.min.js"></script>
    <script src="../plugins/jquery/jquery.cookie-1.4.1.min.js"></script>
    <script src="../plugins/vue/vue-2.6.11.js"></script>
    <script src="../plugins/element/element-ui-index.js"></script>
    <script src="../js/blog-detail.js"></script>
</head>
<div class="content">
    <!--正文-->
    <section>
        <div id="blog-detail">
        	<!--    展示已有评论    -->
                <div class="look-observe">
                    <el-tree
                            ref="tree"
                            :data="observes"
                            :props="defaultProps"
                    >
                        <div class="custom-tree-node" slot-scope="{ node, data }">
                            <div class="observe-top">
                                <img :src="data.user.picture" alt="头像" class="observe-header-img">
                                <span class="observe-nickname">{{data.user.nickname}}</span>
                                <span class="observe-user" v-text="data.lastId==null?'回复了博主':'回复了你'"></span>
                                <el-tag class="observe-tag" @click="getLastId(data)" round size="mini">回复</el-tag>
                                <span class="observe-date">{{data.createDate}}</span>
                            </div>
                            <p class="observe-content">{{data.observeContent}}</p>
                        </div>
                    </el-tree>
                </div>
            </div>
        </div>
    </section>
</div>
```
CSS
```css
/*评论显示*/
.look-observe {
    padding: 2rem 2rem;
    background-color: #ffffff;
}

#observe-title {
    text-align: center;
    font-weight: bold;
}

#my-observe-user {
    font-size: 1.6rem;
    font-weight: bold;
    margin: 1rem 0;
}

#clear-observe-tag {
    width: 10rem;
    height: 3rem;
    padding: 0.5rem;
    cursor: pointer;
    text-align: center;
    margin-left: 85%;
}

#my-observe-user-content {
    font-size: 1.4rem;
}

.custom-tree-node {
    width: 100%;
}

.el-tree-node__content {
    height: 8rem;
    padding: 1rem 2rem;
    border-radius: 1rem;
    border: 0.1rem solid #eee;
}

.observe-content {
    font-size: 1.4rem;
    margin: 1rem 0;
}

.observe-top {
    line-height: 3rem;
    height: 3rem;
}

.observe-top span {
    display: inline-block;
    vertical-align: middle;
}

.observe-header-img {
    display: inline-block;
    vertical-align: middle;
    height: 3rem;
    width: 3rem;
    border-radius: 3rem;
}

.observe-nickname {
    font-weight: bold;
    font-size: 1.5rem;
    margin: 0 1rem;
}

.observe-user {
    margin: 0 1rem;
    font-size: 1.2rem;
}

.observe-date {
    float: right;
    margin-right: 2rem;
}

.observe-tag {
    float: right;
}
```
JS

```javascript
$(document).ready(function () {
    //侧边栏的vue
    let blogDetail = new Vue({
        el: '#blog-detail',
        data: {
            blogId: '', //博客id
            lastId: '',  //评论的lastId
            observes: [], //已经评论的集合
            defaultProps: {
                children: 'nextNodes',
                label: 'observeContent',
                id: 'id',
            },
        },
        methods: {
            //查询此篇博客的所有评论信息
            getBlogObserve() {
                $.get(baseUrl + "/api/observe/" + this.blogId,
                    function (data, status, xhr) {
                        blogDetail.observes = data;
                    }, "json").fail(function (error) {
                    blogDetail.$message({
                        showClose: true,
                        message: "查询博客评论失败" + error.responseJSON.message,
                        type: 'error'
                    });
                });
            },
            //进入博客详情页，博客的浏览量+1
            increaseViewCount() {
                if ($.cookie("viewId") !== this.blogId) {
                    $.ajax({
                        url: baseUrl + "/api/blog/increase-view-number/" + this.blogId,
                        dataType: "text",
                        type: "put",
                        success: function (data, status, xhr) {
                            //设置过期时间为1h
                            let date = new Date();
                            date.setTime(date.getTime() + 60 * 60 * 60 * 1000);
                            $.cookie("viewId", blogDetail.blogId, {"path": "/",}, {expires: date});
                        },
                        error: function (error) {
                            blogDetail.$message({
                                showClose: true,
                                message: error.responseJSON.message,
                                type: 'error'
                            });
                        }
                    });
                }
            },
            //点击点赞，增加博客的点赞量
            increaseLikeCount() {
                if ($.cookie("likeId") !== this.blogId) {
                    $.ajax({
                        url: baseUrl + "/api/blog/increase-like-number/" + this.blogId,
                        dataType: "text",
                        type: "put",
                        success: function (data, status, xhr) {
                            //设置过期时间为1h
                            let date = new Date();
                            date.setTime(date.getTime() + 60 * 60 * 60 * 1000);
                            $.cookie("likeId", blogDetail.blogId, {"path": "/",}, {expires: date});
                        },
                        error: function (error) {   //请求失败后的回调方法
                            blogDetail.$message({
                                showClose: true,
                                message: error.responseJSON.message,
                                type: 'error'
                            });
                        }
                    });
                }else{
                    blogDetail.$message({
                        showClose: true,
                        message: "您已经点过赞啦！",
                        type: 'success'
                    });
                }
            },
        },
        mounted() {
            this.getBlogObserve();
        },
        created() {
        	//获取博客的id，利用的是导航栏拼接，这里可忽略
            this.blogId = window.location.search.substr(1);
        }
    });
});

```

博客的访问量和点赞量是利用cookie存储对应的博客id来实现的，如果有次cookie则不能增加浏览量和点赞量，当然也还存在很多的bug，这个访问量和点赞量只能在一定程度上解决问题，并不完善（浏览和点赞的后端实现暂略，不是重点）。

利用Element UI实现评论回显的关键代码如下：

```javascript
<el-tree
   ref="tree"
   :data="observes"
   :props="defaultProps"
>
   <div class="custom-tree-node" slot-scope="{ node, data }">
        <div class="observe-top">
             <img :src="data.user.picture" alt="头像" class="observe-header-img">
             <span class="observe-nickname">{{data.user.nickname}}</span>
             <span class="observe-user" v-text="data.lastId==null?'回复了博主':'回复了你'"></span>
             <el-tag class="observe-tag" @click="getLastId(data)" round size="mini">回复</el-tag>
             <span class="observe-date">{{data.createDate}}</span>
        </div>
        <p class="observe-content">{{data.observeContent}}</p>
   </div>
</el-tree>
```

- `:data="observes"`是评论信息集合，及需要展示在属性控件的数据
- `:props="defaultProps"`主要用于配置每个节点的选项
- `slot-scope`是树形控件的插槽

详细的树形控件API可参看官网：[https://element.eleme.cn/#/zh-CN/component/tree](https://element.eleme.cn/#/zh-CN/component/tree)

#### 回显数据实例展示

多级评论回复层级结构非常鲜明
![在这里插入图片描述](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202201222341006.png)