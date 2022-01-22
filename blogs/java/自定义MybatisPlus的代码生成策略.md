---
title: 自定义MybatisPlus的代码生成策略
date: 2020-12-05
categories:
 - java
tags:
 - mybatis
---

@[TOC]

## 背景

MybatisPlus官网提供的默认的代码生成已经很完善了，可以满足基本的开发要求，但是如果想要自定义一些生成策略，那就需要一些深度定制了。

## 流程

### 1.引入相应的jar包

版本的话可自行引入最新稳定版本即可，引入freemarker，之后使用freemarker的代码模板生成代码。
```java
<!--    mybatis plus相关    -->
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.3.2</version>
</dependency>
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-generator</artifactId>
	<version>3.3.2</version>
</dependency>
<!--      mybatis plus      end      -->

<!--      mybatis plus 代码生成模板引擎      -->
<dependency>
    <groupId>org.freemarker</groupId>
    <artifactId>freemarker</artifactId>
    <version>2.3.30</version>
</dependency>
```

### 2.编写MybatisPlus的代码生成类

参考MybatisPlus官网代码生成进行改造：[https://baomidou.com/guide/generator.html](https://baomidou.com/guide/generator.html)

*下面的方法注释写的都比较详细，不做过多解释，仅解释一些重要或者可以额外扩展的配置。*

#### 2.1读取控制台内容的方法

```java
/**
 * description:读取控制台内容，并返回
 *
 * @param tip 输入内容
 * @return 控制台输入内容
 */
private static String scanner(String tip) {
     Scanner scanner = new Scanner(System.in);
     System.out.println("请输入" + tip + "：");
     if (scanner.hasNext()) {
         String ipt = scanner.next();
         if (! "".equals(ipt) && ipt != null) {
             return ipt;
         }
     }
     throw new MybatisPlusException("请输入正确的" + tip + "！");
 }
```

#### 2.2进行数据库相关配置

```java
/** 数据库连接URL */
private final static String URL = "jdbc:mysql://127.0.0.1:3306/smpe?" +
        "serverTimezone=Asia/Shanghai&characterEncoding=utf8&useSSL=false&allowPublicKeyRetrieval=true";
/** 数据库驱动名 */
private final static String DRIVER_NAME = "";
/** 数据库账号 */
private final static String USERNAME = "";
/** 数据库密码 */
private final static String PASSWORD = "";
/** 控制台输入内容n（大小写都可） */
private final static String NO = "n";
/** 控制台输入内容y（大小写都可） */
private final static String YES = "y";
```

#### 2.3进行MybatisPlus代码生成的全局配置

```java
private static GlobalConfig setGlobalConfig() {
    System.out.println("------步骤一：确定代码生成位置及作者信息------");
    GlobalConfig gc = new GlobalConfig();
    String path = "";
    // 因为所有在java.io中的类都是将相对路径名解释为起始于用户的当前工作目录，所以应该清楚当前的目录。
    String isSrc = scanner("1.1：是否在项目根目录下生成代码（y为是，n为否）。多模块开发，要在子模块下生成代码请输入n").toLowerCase();
    if (YES.equals(isSrc)) {
        path = System.getProperty("user.dir");
    } else if (NO.equals(isSrc)) {
        path = scanner("1.2：在项目指定模块下生成代码，请输入模块名");
    } else {
        throw new RuntimeException("【自动生成代码错误】输入错误！！！请输入y或者n");
    }

    String author = scanner("1.3：作者名（方便生成注解及作者相关）");

    // 获取指定项目模块的路径，用于输出路径
    File file = new File(path);
    String projectPath = file.getAbsolutePath();
    gc.setOutputDir(projectPath + "/src/main/java")
            .setAuthor(author)
            // 是否打开输出目录
            .setOpen(false)
            // 主键策略
            .setIdType(IdType.AUTO)
            // 是否覆盖已有文件 （默认false）
            .setFileOverride(false)
            // 设置支持ActiveRecord 继承Model
            .setActiveRecord(true)
            // 实体属性 Swagger2 注解
            .setSwagger2(true);

    return gc;
}
```

#### 2.4进行MybatisPlus代码生成的数据源配置

```java
private static DataSourceConfig setDataSourceConfig() {
    DataSourceConfig dsc = new DataSourceConfig();
    dsc.setDbType(DbType.MYSQL)
            .setUrl(URL)
            .setDriverName(DRIVER_NAME)
            .setUsername(USERNAME)
            .setPassword(PASSWORD);

    return dsc;
}
```

#### 2.5进行MybatisPlus代码生成的包配置

```java
private static PackageConfig setPackageConfig() {
    PackageConfig pc = new PackageConfig();
    String parentPath = scanner("1.4：代码生成的父级包名称（全路径）");
    String sonPath = scanner("1.5：生成在父级包下的指定子包名称（输入n代表直接在父级包下生成）").toLowerCase();
    pc.setParent(parentPath);
    if (! NO.equals(sonPath)) {
        pc.setModuleName(sonPath);
    }

    return pc;
}
```

#### 2.6进行MybatisPlus代码生成的策略配置

策略配置可以配置Entity/Controller的父类、写入父类的字段等，可自行配置。

```java
private static StrategyConfig setStrategyConfig() {
    System.out.println("------步骤二：确定以哪些数据库的表进行代码生成------");
    StrategyConfig strategy = new StrategyConfig();

    String isAllTable = scanner("2.1：是否选择所有数据库的表（请输入y/n）").toLowerCase();
    if (YES.equals(isAllTable)) {
        System.out.println("即将以数据库全表生成代码...");
    } else if (NO.equals(isAllTable)) {
        //指定策略选择数据库表
        String inOrExcludeTable = scanner("2.1：y为输入生成数据库的表，n为输入排除数据库的表").toLowerCase();
        String[] tableNames = scanner("2.2：请输入生成或者排除数据库表的名称，多个用英文状态下的','分割").split(",");
        // 当enableSqlFilter为false时，允许正则表达式
        if (YES.equals(inOrExcludeTable)) {
            strategy.setInclude(tableNames);
        } else if (NO.equals(inOrExcludeTable)) {
            strategy.setExclude(tableNames);
        } else {
            throw new RuntimeException("【自动生成代码错误】输入错误！！！请输入y或者n");
        }
    } else {
        throw new RuntimeException("【自动生成代码错误】输入错误！！！请输入y或者n");
    }

    strategy
            // 数据库表映射到实体的命名策略（下划线处理）
            .setNaming(NamingStrategy.underline_to_camel)
            // 数据库字段映射到实体的命名策略（下划线处理）
            .setColumnNaming(NamingStrategy.underline_to_camel)
            // 全局大写命名
            .setCapitalMode(true)
            // 是否为lombok模型（默认 false）
            .setEntityLombokModel(true)
            // 是否为链式模型（默认 false）
            .setChainModel(true)
            // Boolean类型字段是否移除is前缀（默认 false）
            .setEntityBooleanColumnRemoveIsPrefix(true)
            .setRestControllerStyle(true);

    return strategy;
}
```

#### 2.7进行MybatisPlus代码生成的模板配置

这里使用了==自定义模板引擎（freemarker）==，这样才方便我们进行深度定制。（当然也可以使用官方的默认配置）。
模板引擎文件放置目录：
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201205214807344.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQyOTM3NTIy,size_16,color_FFFFFF,t_70)


模板引擎文件可参看==附2——代码生成模板引擎文件==
```java
private static TemplateConfig setTemplateConfig() {
    TemplateConfig templateConfig = new TemplateConfig();
    // 配置自定义输出模板（如果不配置这些，则会按照官方的配置进行生成）
    // 指定自定义模板路径，注意不要带上.ftl/.vm, 会根据使用的模板引擎自动识别
    templateConfig
            .setController("template/controller.java")
            .setMapper("template/Mapper.java")
            .setServiceImpl("template/ServiceImpl.java")
            .setXml(null);

    return templateConfig;
}
```

#### 2.8进行MybatisPlus代码生成的自定义配置（暂未使用，如有需要自行配置）

```java
private static InjectionConfig setInjectionConfig() {

    // 自定义配置
    return new InjectionConfig() {
        @Override
        public void initMap() {
            // to do nothing
        }
    };

}
```

#### 2.9执行MybatisPlus代码生成

```java
public static void main(String[] args) {
   //实例化以下配置（目的：按照以下的代码顺序执行，方便书写步骤）
   GlobalConfig globalConfig = setGlobalConfig();
   DataSourceConfig dataSourceConfig = setDataSourceConfig();
   PackageConfig packageConfig = setPackageConfig();
   StrategyConfig strategyConfig = setStrategyConfig();
   TemplateConfig templateConfig = setTemplateConfig();

   // 代码生成器（将配置设置进代码生成器）
   AutoGenerator mpg = new AutoGenerator();
   mpg.setGlobalConfig(globalConfig)
           .setDataSource(dataSourceConfig)
           .setPackageInfo(packageConfig)
           .setStrategy(strategyConfig)
           .setTemplate(templateConfig)
           // 设置使用freemarker生成代码，如果使用velocity则可以不用设置
           .setTemplateEngine(new FreemarkerTemplateEngine());
   // 执行
   mpg.execute();
}
```

### 3.启动MybatisPlusGenerator类的main方法后控制台使用流程

假设生成的代码位置：
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201205213014867.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQyOTM3NTIy,size_16,color_FFFFFF,t_70)

#### 步骤一：确定代码生成位置及作者信息

##### 1.1是否在项目根目录下生成代码（y为是，n为否）。多模块开发，要在子模块下生成代码请输入n

如果不是多模块开发，或者想要在根父工程生成代码，直接输入y。
如果想要在子模块生成代码，输入n。

##### 1.2在项目指定模块下生成代码，请输入模块名

如果上一步输入n，则在这一步输入想要生成代码的子模块名。（上一步输入y，则跳过这一步）

##### 1.3作者名（方便生成注解及作者相关）

##### 1.4代码生成的父级包名称（全路径）

从模块/项目下的根包（Java的包）开始，以"."进行分级。
例如：`marchsoft.test2`

##### 1.5生成在父级包下的指定子包名称（输入n代表直接在父级包下生成）

如果还想在子包下生成，直接输入==子包的名称==；如果没有子包，即在上一步父包下生成，直接输入==n==。

#### 步骤二：确定以哪些数据库的表进行代码生成

##### 2.1是否选择所有数据库的表（请输入y/n）

输入y将连接的目标数据库的所有表全部进行代码生成；输入n执行接下来选择表生成代码的策略。

##### 2.2y为输入生成数据库的表，n为输入排除数据库的表

输入y代表采用选择数据库表的代码生成策略；输入n代表采用选择排除数据表的代码生成。

##### 2.3请输入生成或者排除数据库表的名称，多个用英文状态下的','分割

输入表名后，按照相应的策略进行代码生成

***流程完***
<br>

### 4.使用示例

```java
------步骤一：确定代码生成位置及作者信息------
请输入1.1：是否在项目根目录下生成代码（y为是，n为否）。多模块开发，要在子模块下生成代码请输入n：
n
请输入1.2：在项目指定模块下生成代码，请输入模块名：
smpe-system
请输入1.3：作者名（方便生成注解及作者相关）：
RenShiWei
请输入1.4：代码生成的父级包名称：
marchsoft.test2
请输入1.5：生成在父级包下的指定子包名称（输入n代表直接在父级包下生成）：
n
------步骤二：确定以哪些数据库的表进行代码生成------
请输入2.1：是否选择所有数据库的表（请输入y/n）：
n
请输入2.1：y为输入生成数据库的表，n为输入排除数据库的表：
y
请输入2.2：请输入生成或者排除数据库表的名称，多个用英文状态下的','分割：
student_test,sys_user
21:26:41.806 [main] DEBUG com.baomidou.mybatisplus.generator.AutoGenerator - 
==========================准备生成文件...==========================
```

## 注

以上为我经常使用的代码生成的策略和习惯，可以根据其思想自行定制属于自己、适合自己的代码生成策略。
<br>

*代码ftl文件生成里边，import了一些swagger和lombok的类，如果报错，可以修改，或者引入他们的jar包。*

## 附

### 附1：完整的MybatisPlus代码生成类

```java
/**
 * 功能描述：mybatis-plus的代码生成器<p>
 * modify @RenShiWei 2020/12/5 description:进行代码生成的整体优化
 *
 * @author RenShiWei
 * Date: 2020/7/5 15:16
 */
public class MybatisPlusGenerator {

    /** 数据库连接URL */
    private final static String URL = "jdbc:log4jdbc:mysql://127.0.0.1:3306/smpe?" +
            "serverTimezone=Asia/Shanghai&characterEncoding=utf8&useSSL=false&allowPublicKeyRetrieval=true";
    /** 数据库驱动名 */
    private final static String DRIVER_NAME = "com.alibaba.druid.pool.DruidDataSource";
    /** 数据库账号 */
    private final static String USERNAME = "root";
    /** 数据库密码 */
    private final static String PASSWORD = "159357asd";
    /** 控制台输入内容n（大小写都可） */
    private final static String NO = "n";
    /** 控制台输入内容y（大小写都可） */
    private final static String YES = "y";

    /**
     * description:执行MybatisPlus代码生成
     *
     * @author RenShiWei
     * Date: 2020/12/5 17:46
     */
    public static void main(String[] args) {
        //实例化以下配置（目的：按照以下的代码顺序执行，方便书写步骤）
        GlobalConfig globalConfig = setGlobalConfig();
        DataSourceConfig dataSourceConfig = setDataSourceConfig();
        PackageConfig packageConfig = setPackageConfig();
        StrategyConfig strategyConfig = setStrategyConfig();
        TemplateConfig templateConfig = setTemplateConfig();

        // 代码生成器（将配置设置进代码生成器）
        AutoGenerator mpg = new AutoGenerator();
        mpg.setGlobalConfig(globalConfig)
                .setDataSource(dataSourceConfig)
                .setPackageInfo(packageConfig)
                .setStrategy(strategyConfig)
                .setTemplate(templateConfig)
                // 设置使用freemarker生成代码，如果使用velocity则可以不用设置
                .setTemplateEngine(new FreemarkerTemplateEngine());
        // 执行
        mpg.execute();
    }


    /**
     * description:读取控制台内容，并返回
     *
     * @param tip 输入内容
     * @return 控制台输入内容
     * @author RenShiWei
     * Date: 2020/12/5 17:29
     */
    private static String scanner(String tip) {
        Scanner scanner = new Scanner(System.in);
        System.out.println("请输入" + tip + "：");
        if (scanner.hasNext()) {
            String ipt = scanner.next();
            if (! "".equals(ipt) && ipt != null) {
                return ipt;
            }
        }
        throw new MybatisPlusException("请输入正确的" + tip + "！");
    }

    /**
     * description:进行MybatisPlus代码生成的全局配置
     *
     * @return GlobalConfig
     * @author RenShiWei
     * Date: 2020/12/5 17:36
     */
    private static GlobalConfig setGlobalConfig() {
        System.out.println("------步骤一：确定代码生成位置及作者信息------");
        GlobalConfig gc = new GlobalConfig();
        String path = "";
        // 因为所有在java.io中的类都是将相对路径名解释为起始于用户的当前工作目录，所以应该清楚当前的目录。
        String isSrc = scanner("1.1：是否在项目根目录下生成代码（y为是，n为否）。多模块开发，要在子模块下生成代码请输入n").toLowerCase();
        if (YES.equals(isSrc)) {
            path = System.getProperty("user.dir");
        } else if (NO.equals(isSrc)) {
            path = scanner("1.2：在项目指定模块下生成代码，请输入模块名");
        } else {
            throw new RuntimeException("【自动生成代码错误】输入错误！！！请输入y或者n");
        }

        String author = scanner("1.3：作者名（方便生成注解及作者相关）");

        // 获取指定项目模块的路径，用于输出路径
        File file = new File(path);
        String projectPath = file.getAbsolutePath();
        gc.setOutputDir(projectPath + "/src/main/java")
                .setAuthor(author)
                // 是否打开输出目录
                .setOpen(false)
                // 主键策略
                .setIdType(IdType.AUTO)
                // 是否覆盖已有文件 （默认false）
                .setFileOverride(false)
                // 设置支持ActiveRecord 继承Model
                .setActiveRecord(true)
                // 实体属性 Swagger2 注解
                .setSwagger2(true);

        return gc;
    }

    /**
     * description:进行MybatisPlus代码生成的数据源配置
     *
     * @return DataSourceConfig
     * @author RenShiWei
     * Date: 2020/12/5 17:36
     */
    private static DataSourceConfig setDataSourceConfig() {
        DataSourceConfig dsc = new DataSourceConfig();
        dsc.setDbType(DbType.MYSQL)
                .setUrl(URL)
                .setDriverName(DRIVER_NAME)
                .setUsername(USERNAME)
                .setPassword(PASSWORD);

        return dsc;
    }

    /**
     * description:进行MybatisPlus代码生成的包配置
     *
     * @return PackageConfig
     * @author RenShiWei
     * Date: 2020/12/5 17:36
     */
    private static PackageConfig setPackageConfig() {
        PackageConfig pc = new PackageConfig();
        String parentPath = scanner("1.4：代码生成的父级包名称（全路径）");
        String sonPath = scanner("1.5：生成在父级包下的指定子包名称（输入n代表直接在父级包下生成）").toLowerCase();
        pc.setParent(parentPath);
        if (! NO.equals(sonPath)) {
            pc.setModuleName(sonPath);
        }

        return pc;
    }

    /**
     * description:进行MybatisPlus代码生成的策略配置
     *
     * @return StrategyConfig
     * @author RenShiWei
     * Date: 2020/12/5 17:36
     */
    private static StrategyConfig setStrategyConfig() {
        System.out.println("------步骤二：确定以哪些数据库的表进行代码生成------");
        StrategyConfig strategy = new StrategyConfig();

        String isAllTable = scanner("2.1：是否选择所有数据库的表（请输入y/n）").toLowerCase();
        if (YES.equals(isAllTable)) {
            System.out.println("即将以数据库全表生成代码...");
        } else if (NO.equals(isAllTable)) {
            //指定策略选择数据库表
            String inOrExcludeTable = scanner("2.1：y为输入生成数据库的表，n为输入排除数据库的表").toLowerCase();
            String[] tableNames = scanner("2.2：请输入生成或者排除数据库表的名称，多个用英文状态下的','分割").split(",");
            // 当enableSqlFilter为false时，允许正则表达式
            if (YES.equals(inOrExcludeTable)) {
                strategy.setInclude(tableNames);
            } else if (NO.equals(inOrExcludeTable)) {
                strategy.setExclude(tableNames);
            } else {
                throw new RuntimeException("【自动生成代码错误】输入错误！！！请输入y或者n");
            }
        } else {
            throw new RuntimeException("【自动生成代码错误】输入错误！！！请输入y或者n");
        }

        strategy
                // 数据库表映射到实体的命名策略（下划线处理）
                .setNaming(NamingStrategy.underline_to_camel)
                // 数据库字段映射到实体的命名策略（下划线处理）
                .setColumnNaming(NamingStrategy.underline_to_camel)
                // 全局大写命名
                .setCapitalMode(true)
                // 是否为lombok模型（默认 false）
                .setEntityLombokModel(true)
                // 是否为链式模型（默认 false）
                .setChainModel(true)
                // Boolean类型字段是否移除is前缀（默认 false）
                .setEntityBooleanColumnRemoveIsPrefix(true)
                .setRestControllerStyle(true);

        return strategy;
    }

    /**
     * description:进行MybatisPlus代码生成的模板配置
     *
     * @return TemplateConfig
     * @author RenShiWei
     * Date: 2020/12/5 17:36
     */
    private static TemplateConfig setTemplateConfig() {
        TemplateConfig templateConfig = new TemplateConfig();
        // 配置自定义输出模板（如果不配置这些，则会按照官方的配置进行生成）
        // 指定自定义模板路径，注意不要带上.ftl/.vm, 会根据使用的模板引擎自动识别
        templateConfig
                .setController("template/controller.java")
                .setMapper("template/Mapper.java")
                .setServiceImpl("template/ServiceImpl.java")
                .setXml(null);

        return templateConfig;
    }

    /**
     * description:进行MybatisPlus代码生成的自定义配置（暂未使用）
     *
     * @return TemplateConfig
     * @author RenShiWei
     * Date: 2020/12/5 17:36
     */
    private static InjectionConfig setInjectionConfig() {

        // 自定义配置
        return new InjectionConfig() {
            @Override
            public void initMap() {
                // to do nothing
            }
        };

    }

}

```

### 附2——代码生成模板引擎文件

#### Controller.java.ftl

```java
package ${package.Controller};

import lombok.RequiredArgsConstructor;
<#--标注controller，判断是否为rset风格-->
<#if restControllerStyle>
import org.springframework.web.bind.annotation.RestController;
<#else>
import org.springframework.stereotype.Controller;
</#if>
<#--如果继承有公共controller，导入-->
<#if superControllerClassPackage??>
import ${superControllerClassPackage};
</#if>
<#--swagger相关注解-->
<#if swagger2>
import io.swagger.annotations.Api;
</#if>
<#--日志-->
<#if entityLombokModel>
import lombok.extern.slf4j.Slf4j;
</#if>

<#--实体类和service类-->
import ${package.Service}.${table.serviceName};
import ${package.Entity}.${entity};


/**
* <p>
* ${table.comment} 前端控制器
* </p>
* @author ${author}
* @since ${date}
*/
@RequiredArgsConstructor
<#if restControllerStyle>
@RestController
<#else>
@Controller
</#if>
<#--日志注解，采用Lombok的快捷日志-->
<#if entityLombokModel>
@Slf4j
</#if>
<#--swagger注解-->
<#if swagger2>
@Api(tags = "${table.comment}模块")
</#if>
@RequestMapping("/api/${table.entityPath}")
<#if superControllerClassPackage??>
public class ${table.controllerName} extends ${superControllerClass} {
<#else>
public class ${table.controllerName} {
</#if>
    private final ${table.serviceName} ${table.entityPath}Service;

}

```

#### Mapper.java.ftl

```java
package ${package.Mapper};

import ${package.Entity}.${entity};
import ${superMapperClassPackage};
import org.springframework.stereotype.Component;

/**
* <p>
* ${table.comment!} Mapper 接口
* </p>
*
* @author ${author}
* @since ${date}
*/
@Component
public interface ${table.mapperName} extends ${superMapperClass}<${entity}> {

}

```

#### ServiceImpl.java.ftl

```java
package ${package.ServiceImpl};

import lombok.RequiredArgsConstructor;
import ${package.Entity}.${entity};
import ${package.Mapper}.${table.mapperName};
import ${package.Service}.${table.serviceName};
import ${superServiceImplClassPackage};
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

/**
* <p>
* ${table.comment!} 服务实现类
* </p>
*
* @author ${author}
* @since ${date}
*/
@Service
@RequiredArgsConstructor
public class ${table.serviceImplName} extends ${superServiceImplClass}<${table.mapperName}, ${entity}> implements ${table.serviceName} {

    private final ${table.mapperName} ${table.entityPath}Mapper;

}


```

## 更新

### 2020.12.6更新

新增对自定义扩展MybatisPlus的提供的Model、Mapper、Service层的方法的代码生成策略。

主要修改其继承父类的策略：
```java
-private static StrategyConfig setStrategyConfig() {
    System.out.println("------步骤二：确定以哪些数据库的表进行代码生成------");
    StrategyConfig strategy = new StrategyConfig();

    String isAllTable = scanner("2.1：是否选择所有数据库的表（请输入y/n）").toLowerCase();
    if (YES.equals(isAllTable)) {
        System.out.println("即将以数据库全表生成代码...");
    } else if (NO.equals(isAllTable)) {
        //指定策略选择数据库表
        String inOrExcludeTable = scanner("2.2：y为输入生成数据库的表，n为输入排除数据库的表").toLowerCase();
        String[] tableNames = scanner("2.3：请输入生成或者排除数据库表的名称，多个用英文状态下的','分割").split(",");
        // 当enableSqlFilter为false时，允许正则表达式
        if (YES.equals(inOrExcludeTable)) {
            strategy.setInclude(tableNames);
        } else if (NO.equals(inOrExcludeTable)) {
            strategy.setExclude(tableNames);
        } else {
            throw new RuntimeException("【自动生成代码错误】输入错误！！！请输入y或者n");
        }
    } else {
        throw new RuntimeException("【自动生成代码错误】输入错误！！！请输入y或者n");
    }

    strategy
            // 数据库表映射到实体的命名策略（下划线处理）
            .setNaming(NamingStrategy.underline_to_camel)
            // 数据库字段映射到实体的命名策略（下划线处理）
            .setColumnNaming(NamingStrategy.underline_to_camel)
            // 全局大写命名
            .setCapitalMode(true)
            // 是否为lombok模型（默认 false）
            .setEntityLombokModel(true)
            // 是否为链式模型（默认 false）
            .setChainModel(true)
            // Boolean类型字段是否移除is前缀（默认 false）
            .setEntityBooleanColumnRemoveIsPrefix(true)
            .setRestControllerStyle(true)
            /*
                设置父类策略
             */
            // 设置实体类的父类
            .setSuperEntityClass(BasicModel.class)
            //设置写入实体父类的字段
            .setSuperEntityColumns("create_time", "update_time", "create_by", "update_by")
            .setSuperMapperClass("marchsoft.base.BasicMapper")
            .setSuperServiceClass(IBasicService.class)
            .setSuperServiceImplClass(BasicServiceImpl.class);

    return strategy;
}
```