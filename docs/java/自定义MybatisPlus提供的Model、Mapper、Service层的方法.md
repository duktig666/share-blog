---
title: 自定义MybatisPlus的代码生成策略
date: 2020-12-07
categories:
 - java
tags:
 - mybatis
---

@[TOC]

## 背景

Mybatis现在作为一款比较流行的ORM框架，深受国内开发者的喜爱。MybatisPlus作为只对Mybatis增强的一个框架，所有单表操作无需手写sql，而且内置分页插件、代码生成器等，大大提高了开发效率。

但是作为一个IT人员，我总是不能满足于此，而MybatisPlus刚好具备自定义定制方法的能力。

## 问题

### 问题1：`selectOne`方法在查询数据结果不是一条的时候会报错，导致业务逻辑不能运行

最近发现MybatisPlus其ServiceImpl的`getOne`，Mapper和Model的`selectOne`方法在查询数据结果不是一条的时候会报错，导致业务逻辑不能运行。
错误如下：

```java
@Test
public void testGetOne() {
    LambdaQueryWrapper<Dept> wrapper = new LambdaQueryWrapper<>();
    wrapper.eq(Dept::getSubCount,2);
    deptService.getOne(wrapper);
}
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201206164638983.png)
官方推荐的方法是，如果不能保证数据唯一，要么不使用，要么给`wrapper`添加`wrapper.last("LIMIT 1)`，**但是如果每次使用都要加`wrapper.last("LIMIT 1)`又很不友好，所以我们就可以自定义定制和扩展MybatisPlus的方法**。

换成以下代码即可解决问题：
```java
@Test
public void testGetOne() {
    LambdaQueryWrapper<Dept> wrapper = new LambdaQueryWrapper<>();
    wrapper.eq(Dept::getSubCount,2).last("LIMIT 1");
    deptService.getOne(wrapper);
}
```
<br>

### 问题2：批量插入执行多条sql，导致效率低下

mysql是可以一条sql批量插入多条sql的，但是可能是mp官方考虑到各种数据库的兼容性，所以没有提供这样的方法。刚好利用这条，可以来演示我们的扩展mp方法。
<br>

我们更期望的是如下的sql，而不是批量新增执行多条sql，每条sql插入一条数据。

```java
insert into user(id, name, age) values (1, "a", 17), (2,"b", 18),(3,"c",19);
```
<br>

## 深度定制扩展MybatisPlus提供的方法

### 扩展MybatisPlus的Service层的方法

相对来说，Service层的方法比较好扩展，根据官方提供的说法，我们只需要简单的继承就可以扩展其方法。
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201206165515270.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQyOTM3NTIy,size_16,color_FFFFFF,t_70)

#### 自定义`IBasicService`继承MybatisPlus的`IService`接口

可以直接用实现类继承，为什么接口还要继承？

因为在我们平时开发的过程当中，我们通常是将`IService接口`注入到Controller层当中，如果我们接口中没有定制接口方法，注入到Controller层后，不能直接调用实现类扩展的方法。

- 扩展**批量新增，一条sql插入所有的sql语句**的接口方法

```java
/**
 * description:继承MybatisPlus的IService，方便进行自定义和扩展
 *
 **/
public interface IBasicService<T> extends IService<T> {

    /**
     * description:批量新增，一条sql插入所有的sql语句
     *
     * @param batchList 新增数据的集合对象
     * @return 是否执行成功
     */
    boolean saveAllBatch(Collection<T> batchList);

}
```
<br>

#### 自定义`BasicServiceImpl`继承MybatisPlus的`ServiceImpl`类

我们可以重写`ServiceImpl`类的方法，也可以自定义上面对`IBasicService`的接口方法的实现用以扩展。

- 重写`getOne`方法，默认添加`abstractWrapper.last("LIMIT 1");`
- 调用之后Mapper的批量新增执行一条sql的方法


*Wrapper默认做过处理，添加多个`last("LIMIT 1")`，最后只会有一个生效，拼接到执行的sql当中，多写也没有关系。*

```java
/**
 * description:自定义ServiceImpl继承ServiceImpl，便于扩展；之后所有的ServiceImpl继承本类
 *
 **/
public class BasicServiceImpl<M extends BasicMapper<T>, T> extends ServiceImpl<M, T> implements IBasicService<T> {

    /**
     * description:重写getOne方法，加上"LIMIT 1"，防止出现异常
     * 不用担心存在多个abstractWrapper.last("LIMIT 1")，默认已经处理，不会出现重复
     *
     * @param wrapper /
     * @return /
     */
    @Override
    public T getOne(Wrapper<T> wrapper) {
        AbstractWrapper<T, SFunction<T, ?>, ?> abstractWrapper = (AbstractWrapper<T, SFunction<T, ?>, ?>) wrapper;
        abstractWrapper.last("LIMIT 1");
        return this.getOne(abstractWrapper, true);
    }

    /**
     * description:批量新增，一条sql插入所有的sql语句
     *
     * @param batchList 新增数据的集合对象
     * @return 是否执行成功
     */
    @Override
    public boolean saveAllBatch(Collection<T> batchList) {
        int count = baseMapper.insertAllBatch(batchList);
        return count > 0;
    }

}
```
<br>

### 扩展MybatisPlus的Mapper层的方法

#### 自定义`BasicMapper`继承MybatisPlus的`BaseMapper`类

- 扩展**批量新增，一条sql插入所有的sql语句**的方法
- 使用切面拦截`BaseMapper`的`selectOne`，为其参数设置`wrapper.last("LIMIT 1");`

```java
/**
 * description:自定义BaseMapper，重写其方法，便于扩展；之后的Mapper继承本接口
 *
 **/
public interface BasicMapper<T> extends BaseMapper<T> {

    /**
     * description:批量新增，一条sql插入所有的sql语句
     *
     * @param batchList 新增数据的集合对象
     * @return 新增的执行条数（正常情况下 >= 1）
     */
    int insertAllBatch(@Param("list") Collection<T> batchList);

}
```
<br>

#### 实现批量新增，一条sql插入所有的sql语句的方法`insertAllBatch`

##### 1.在BaseMapper中定义接口方法体

参上如上`BasicMapper`的`insertAllBatch`

##### 2.定义sql方法枚举（参照MybatisPlus的`SqlMethod`）

`SqlMethod`在包`com.baomidou.mybatisplus.core.enums`下，主要定义了sql方法的==方法名、描述和基础sql语句==。如下图：
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201206174243947.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQyOTM3NTIy,size_16,color_FFFFFF,t_70)
为了方便起见和后续好扩展，我们也定义一个这样的枚举类`BaseMapperMethodEnum`。

***PS：枚举里的方法名必须要与BaseMapper自定义的方法名一致。***

```java
/**
 * description:自定义MybatisPlus的BaseMapper方法枚举
 *
 */
@Getter
public enum BaseMapperMethodEnum {

    /** 查询数据的第一条 */
    INSERT_ALL_BATCH("insertAllBatch", "批量新增，一条sql插入所有的内容", "<script>INSERT INTO %s %s VALUES %s\n</script>"),

    ;
    /** 方法名 */
    private final String method;

    /** 方法描述 */
    private final String desc;

    /** 方法对应的sql语句 */
    private final String sql;

    BaseMapperMethodEnum(String method, String desc, String sql) {
        this.method = method;
        this.desc = desc;
        this.sql = sql;
    }

}
```
##### 3.定义`InsertAllBatch`类，继承`AbstractMethod`方法，装配sql

主要作用就是生成预期的sql，看注释即可，不在详细阐述。

```java
/**
 * description:对自定义BaseMapper中的insertAllBatch方法进行sql装配<p>
 * insertAllBatch——批量新增，一条sql插入所有的内容
 *
 **/
public class InsertAllBatch extends AbstractMethod {

    @Override
    public MappedStatement injectMappedStatement(Class<?> mapperClass, Class<?> modelClass, TableInfo tableInfo) {
        BaseMapperMethodEnum baseMapperMethodEnum = BaseMapperMethodEnum.INSERT_ALL_BATCH;
        final String fieldSql = prepareFieldSql(tableInfo);
        final String valueSql = prepareValuesSqlForMysqlBatch(tableInfo);
        final String sqlResult = String.format(baseMapperMethodEnum.getSql(), tableInfo.getTableName(), fieldSql,
                valueSql);
        SqlSource sqlSource = this.languageDriver.createSqlSource(this.configuration, sqlResult, modelClass);
        return this.addInsertMappedStatement(mapperClass, modelClass, baseMapperMethodEnum.getMethod(), sqlSource,
                new NoKeyGenerator(), null, null);
    }

    /**
     * description:生成新增语句VALUES之前的数据库字段
     *
     * @param tableInfo /
     * @return /
     */
    private String prepareFieldSql(TableInfo tableInfo) {
        StringBuilder fieldSql = new StringBuilder();
        //拼接主键列
        fieldSql.append(tableInfo.getKeyColumn()).append(",");
        //拼接其他字段列
        tableInfo.getFieldList().forEach(x -> {
            fieldSql.append(x.getColumn()).append(",");
        });
        //去除最后一个","
        fieldSql.delete(fieldSql.length() - 1, fieldSql.length());
        //前后添加"()"
        fieldSql.insert(0, "(");
        fieldSql.append(")");
        return fieldSql.toString();
    }

    /**
     * description:生成拼接VALUES后的多个值
     *
     * @param tableInfo /
     * @return /
     */
    private String prepareValuesSqlForMysqlBatch(TableInfo tableInfo) {
        final StringBuilder valueSql = new StringBuilder();
        //构建foreach语句
        valueSql.append("<foreach collection=\"list\" item=\"item\" index=\"index\" open=\"(\" separator=\"),(\" " +
                "close=\")\">");
        valueSql.append("#{item.").append(tableInfo.getKeyProperty()).append("},");
        tableInfo.getFieldList().forEach(x -> valueSql.append("#{item.").append(x.getProperty()).append("},"));
        valueSql.delete(valueSql.length() - 1, valueSql.length());
        valueSql.append("</foreach>");
        return valueSql.toString();
    }

}
```

##### 4.定义`MyLogicSqlInjector`类, 注册自定义方法

```java
/**
 * description:装配BaseMapper自定义的方法
 */
public class MyLogicSqlInjector extends DefaultSqlInjector {

    /**
     * 如果只需增加方法，保留MP自带方法
     * 可以super.getMethodList() 再add
     *
     * @return /
     */
    @Override
    public List<AbstractMethod> getMethodList(Class<?> mapperClass) {
        List<AbstractMethod> methodList = super.getMethodList(mapperClass);
        methodList.add(new InsertAllBatch());
        return methodList;
    }
}
```

*到这里自定义扩展一个BaseMapper的方法配置完毕。*

可以自行测试一下，`insertAllBatch`方法是否执行的是类似下面的sql：

```java
insert into user(id, name, age) values (1, "a", 17), (2,"b", 18),(3,"c",19);
```
<br>

#### 如何实现改造`BaseMapper`的`selectOne()`

通过查看源码可以知道`BaseMapper`是一个接口，但是这个接口并没有提供默认的实现，我们并不能很容易地像ServiceImpl那样继承来进行扩展。

##### 思路一：自定义继承包`com.baomidou.mybatisplus.core.injector.methods`下的`SelectOne类`重写其方法 ==（失败）==

之前尝试写自定义了一个`SelectOne`类，来进行继承包`com.baomidou.mybatisplus.core.injector.methods`下的`SelectOne类`，按照如上`insertAllBatch`方法的步骤来写，重写其方法，并添加`"LIMIT 1"`的限制，但是自定义继承的类并没有生效。

##### 思路二：利用切面解决

考虑了好久没有想到合适的解决方法，之前想过的方法是在写一套新的方法，Model、Mapper、Service层都以`selectFirst`，来命名，统一遵循这个规范，但是却也得不偿失。

而然机会下，得到另一位小伙伴的思想，利用切面来完美解决这个问题。

*看来对面向切面编程的思想还是不熟悉，而且没有经常使用，之后需要补强一下。*

**直接利用切面拦截`BaseMapper`的`selectOne()`方法，在其执行前做操作**

```java
@Slf4j
@Aspect
@Component
public class MybatisAspectj {

    /**
     * description:配置切面织入点
     *
     */
    @Pointcut("execution(public * com.baomidou.mybatisplus.core.mapper.BaseMapper.selectOne(..))")
    public void selectOneAspect() {}

    /**
     * description:在执行BaseMapper的selectOne方法前的操作<P>
     * 添加"LIMIT 1"限制，解决selectOne报错的问题
     *
     */
    @Before("selectOneAspect()")
    public void beforeSelect(JoinPoint point) {
        Object arg = point.getArgs()[0];
        if (arg instanceof AbstractWrapper) {
            //强转参数类型
            AbstractWrapper<?, ?, ?> abstractWrapper = Convert.convert(AbstractWrapper.class, arg);
            log.info("BaseMapper的selectOne设置切面成功");
            abstractWrapper.last("LIMIT 1");
        }
    }

}
```

完美解决`BaseMapper`的`selectOne()`的`last("LIMIT 1")`的问题。

**所以之后`BaseMapper`原有提供的方法，都可以用切面思想来对其方法进行扩展。**

### 扩展MybatisPlus的Model层的方法

#### MybatisPlus的Model层的方法简介

可能很多人对==MybatisPlus的Model层的方法==还不熟悉，或者没有使用过。

其实简单来说，就是**可以直接通过实体类来直接实现增删改查方法，而无需调用Service和Mapper层的方法**，不需要Spring注入，非常方便。

如何使用MybatisPlus的Model层的方法？

##### 1. 实体类继承`Model<T>`

`Model<T>类`在包`com.baomidou.mybatisplus.extension.activerecord`下

```java
public class User extends Model<User> {

}
```
##### 2.使用

以新增一条用户数据为例：

```java
@Test
public void testModel() {
    User user = new User();
    user.setUsername("admin");
    user.setEmail("1485656989@qq.com");
    user.insert();
}
```
##### 3.可以配置代码生成默认实体类继承

这里展示主要代码，详细代码生成策略，可参考我的另一篇博客：[自定义深度定制人性化的MybatisPlus的代码生成策略](https://blog.csdn.net/qq_42937522/article/details/110725251)

```java
GlobalConfig gc = new GlobalConfig();
// 设置支持ActiveRecord 实体类继承Model
gc.setActiveRecord(true)
```

##### 引发的问题

这个==ActiveRecord模式==非常好用，但是我们知道Java的一个实体类，只能继承一个类，这样就会引发一些问题。
- 我们的实体类也就不能继承我们的公共父类（我们每个表通常都有 =="create_time", "update_time", "create_by", "update_by"== 等一些字段）。
- Model层的方法不方便去扩展，只能使用一些原有提供的方法。

#### 定制MybatisPlus的Model层的方法

##### 1.自定义`BasicModel`继承MybatisPlus的`Model`类

```java
/**
 * description:公共实体类
 *
 **/
@EqualsAndHashCode(callSuper = true)
@Data
@ApiModel
public class BasicModel<T extends Model<?>> extends Model<T> implements Serializable {

    @ApiModelProperty(value = "创建者")
    @TableField(fill = FieldFill.INSERT)
    private String createBy;

    @ApiModelProperty(value = "更新者")
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private String updateBy;

    @ApiModelProperty(value = "创建日期")
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @ApiModelProperty(value = "更新时间")
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    /**
     * description:重写父类的selectOne方法，添加"LIMIT 1"的限制，默认查第一条；
     * 防止selectList扫描全表，提高效率
     *
     * @param queryWrapper /
     * @return /
     */
    @Override
    public T selectOne(Wrapper<T> queryWrapper) {
        AbstractWrapper<T, SFunction<T, ?>, ?> abstractWrapper = (AbstractWrapper<T, SFunction<T, ?>, ?>) queryWrapper;
        abstractWrapper.last("LIMIT 1");
        return super.selectOne(abstractWrapper);
    }

    /**
     * description:批量新增，一条sql插入所有的sql语句<p>
     * 使用Collection<T>其中一个对象执行即可批量插入
     *
     * @param batchList 新增数据的集合对象
     * @return 是否执行成功
     */
    public boolean insertAllBatch(Collection<T> batchList) {
        SqlSession sqlSession = this.sqlSession();
        boolean var2;
        try {
            var2 = SqlHelper.retBool(sqlSession.insert(this.sqlStatement(BaseMapperMethodEnum.INSERT_ALL_BATCH.getMethod()), batchList));
        } finally {
            this.closeSqlSession(sqlSession);
        }
        return var2;
    }

}

```
<br>

##### 2.方法分析

关于`selectOne`方法的实现，其实还是继承，然后重写其父类的方法，没有什么好说的。

下面重点分析一下的`insertAllBatch`方法实现的原理。

通过查看Model的方法，分析其实现原理。
<br>

**Model层方法实现原理浅析**

```java
public boolean insert() {
        SqlSession sqlSession = this.sqlSession();

        boolean var2;
        try {
            var2 = SqlHelper.retBool(sqlSession.insert(this.sqlStatement(SqlMethod.INSERT_ONE), this));
        } finally {
            this.closeSqlSession(sqlSession);
        }

        return var2;
    }
```
增删改的方法执行的都是`SqlHelper.retBool()`方法。

`SqlHelper.retBool()`方法主要用来判断是都执行成功，即将执行sql的int返回值，转换为boolean值。

```java
public static boolean retBool(Integer result) {
    return null != result && result >= 1;
}
```

增删改的执行核心方法，只要是`SqlSession接口`的方法，其实mybatis官方提供的。

**对于MybatisPlus来说SqlSession方法的第一个参数一般来说是BaseMapper的方法名，第二个参数是方法所需要的参数。如果不需要参数，通常为this。**

*可以参看`BasicModel`中的`insertAllBatch`方法。*

**所以我们也可以以这为基础扩展自己的Model层方法，调用Mapper层的方法，来完成对Model层方法的扩展。**

**备注：**
当然这个Model层的批量新增的方法使用起来稍显有些鸡肋，但是确实是实现了批量新增的功能。

```java
@Test
public void testModelInsertAllBatch() {
    List<StudentTest> studentTestList = new ArrayList<>();
    StudentTest student1 = new StudentTest();
    StudentTest student2 = new StudentTest();
    student1.setName("张凯杰").setAge(23).setNumber("20170256214");
    student2.setName("焦前进").setAge(23).setNumber("20170289214");
    studentTestList.add(student1);
    studentTestList.add(student2);
	//随便使用一个StudentTest对象，调用insertAllBatch方法，传入List<StudentTest>即可调用成功
    System.out.println(student2.insertAllBatch(studentTestList));
}
```
<br>

## 总结

学习一项技术不只是会用，还要明白哪些是适合我们的，哪些我们可以去扩展，去实现我们想要实现的操作。对于重要的技术，甚至要明白其的一些原理。

扒源码确实刚开始是一件比较困难的事情，但是如果习惯了，那么就可能会快速提供，可以借鉴其他优秀的开源框架的思想。

话说回来，对于深度定制扩展MybatisPlus的方法，我也只是举了两个基本的例子，一个是重写其官方提供的方法，一个是自定义扩展方法。重要的思想，和明白自己需要什么，然后自己去扩展。

参考：
https://gitee.com/baomidou/mybatis-plus-samples/tree/master/mybatis-plus-sample-deluxe