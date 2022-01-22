---
title: SpringBoot 配置返回前端时间戳和接收时间戳自动转为LocalDateTime（前后端统一使用时间戳交互）
date: 2020-11-29
categories:
 - spring family
tags:
 - springboot
---

## 背景

在项目开发当中，前后端使用什么样的时间格式，是一个值得关注的问题。如果都各自使用自己的格式，那么很不好统一。

## 确定时间格式

### 1.确定后端返回前端时间格式

**前端一般来说对于时间的处理是富有变化的**。有的地方可能使用 ==“2020-11-29 11:15:25”== 这样的格式，也可能使用 ==“2020/11/29 11:15”== 的格式，或者只需要显示到分，不需要显示到秒。如果是这样的话，后端返回给前端字符串类型的时间格式是不友好的，前端不好做到兼容性。

对于时间的兼容性，后端可以给前端返回时间戳，时间戳可以做到任意转化前端想要的格式（前端可以提供对应的JS工具类）。
<br>

### 2.确定后端接收前端的时间格式

后端可以接受前端传类似于 ==“2020-11-29 11:15:25”== 这样格式的时间，但还是上述说的问题，不好统一，所以不妨后端也接受前端传时间戳的时间格式。
<br>

### 3.关于时间戳的选择

时间戳无非常使用的就两种，10位秒级的时间戳和13位的毫秒级的时间戳。
10位秒级的时间戳往往要经过乘1000或除1000操作，而且未来我们可能会遇到需要毫秒级的精度需求，所以我们不妨**确定前后端统一使用==13位毫秒级时间戳==进行交互**。
<br>

### 4.关于后端Java使用日期数据类型的确定

数据库我们常用的时间格式是`DateTime`，我们暂时也以此为例。
可以使用`java.util.Date`，也可以使用`java.sql.TimeStamp`，但是学过java8新特性的应该都知道，Java8新特性的时间戳有很多的优点（相对于老的那套时间，尤其是好用程度和高并发问题）。
所以**后端我们确定使用`LocalDateTime`来映射数据库的`DateTime`的数据类型（使用Java8的时间格式来映射数据库的时间日期数据类型）**。
<br>

## SpringBoot配置LocalDateTime自动返回前端时间戳

如果是java.util.Date，配置统一返回时间戳就比较容易了。
直接在yml配置即可。

```yaml
spring:
  jackson:
    time-zone: Asia/Shanghai
    serialization:
      # Date返回前端转时间戳 但不能解决LocalDateTime转时间戳（JacksonCustomizerConfig类解决）
      write-dates-as-timestamps: true
```
但是此配置对`LocalDateTime`不生效。

我们可以使用重写SpringBoot默认内置的Jackson的序列化来解决这个问题。

里面使用的工具类`LocalDateTimeUtil`来自于HuTool，可参考：[https://hutool.cn/docs/#/](https://hutool.cn/docs/#/)

可直接通过maven引入：

```java
<dependency>
    <groupId>cn.hutool</groupId>
    <artifactId>hutool-all</artifactId>
    <version>5.5.1</version>
</dependency>
```


```java
/**
 * jackson全局配置java8 LocalDateTime的序列化 全局配置时间返回格式
 */
@Configuration
public class JacksonCustomizerConfig {

    /**
     * description:适配自定义序列化和反序列化策略，返回前端指定数据类型的数据
     */
    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jackson2ObjectMapperBuilderCustomizer() {
        return builder -> {
            builder.serializerByType(LocalDateTime.class, new LocalDateTimeSerializer());
            builder.deserializerByType(LocalDateTime.class, new LocalDateTimeDeserializer());
        };
    }

    /**
     * description:序列化
     * LocalDateTime序列化为毫秒级时间戳
     */
    public static class LocalDateTimeSerializer extends JsonSerializer<LocalDateTime> {
        @Override
        public void serialize(LocalDateTime value, JsonGenerator gen, SerializerProvider serializers)
                throws IOException {
            if (value != null) {
                long timestamp = LocalDateTimeUtil.toEpochMilli(value);
                gen.writeNumber(timestamp);
            }
        }
    }

    /**
     * description:反序列化
     * 毫秒级时间戳序列化为LocalDateTime
     */
    public static class LocalDateTimeDeserializer extends JsonDeserializer<LocalDateTime> {
        @Override
        public LocalDateTime deserialize(JsonParser p, DeserializationContext deserializationContext)
                throws IOException {
            long timestamp = p.getValueAsLong();
            if (timestamp > 0) {
                return LocalDateTimeUtil.of(timestamp, ZoneOffset.of("+8"));
            } else {
                return null;
            }
        }
    }
}
```

## SpringBoot配置接收前端时间戳自动转LocalDateTime

```java
/**
 * jackson全局配置java8 LocalDateTime的序列化 全局配置时间返回格式
 */
@Configuration
public class JacksonCustomizerConfig {

    /**
     * description:LocalDateTime转换器，用于转换RequestParam和PathVariable参数
     * 接收毫秒级时间戳字符串——>LocalDateTime
     */
    @Bean
    public Converter<String, LocalDateTime> localDateTimeConverter() {
        return new Converter<String, LocalDateTime>() {
            @Override
            public LocalDateTime convert(String source) {
                //毫秒级时间戳转LocalDateTime
                return LocalDateTimeUtil.of(Long.parseLong(source), ZoneOffset.of("+8"));
            }
        };
    }

    /**
     * description:java.util.Date转换器
     * 接收毫秒级时间戳字符串——>Date
     */
    @Bean
    public Converter<String, Date> dateConverter() {
        return new Converter<String, Date>() {
            @Override
            public Date convert(String source) {
                long longTimeStamp = new Long(source);
                return new Date(longTimeStamp);
            }
        };
    }

}
```

**使用时注意事项：**

- 如果在接口（Controller）中方法的参数类型是LocalDateTime需要加`@RequestParam`注解，否则会有问题。
*至于原因，通过dubug研究因为对其进行了数据类型判断，认为LocalDateTime不是简单的数据类型（如果有兴趣可以研究一下）。*
- 如果接口的参数类型是JavaBean，里边有属性时LocalDateTime，那么不用做额外处理。

**例：**

```java
@ApiOperation("测试后端直接接受时间戳")
@GetMapping("/timestamp")
@AnonymousAccess
public ResponseEntity<Object> testLocalDateTime(@RequestParam LocalDateTime h) throws Exception {
    System.out.println(h);
    return new ResponseEntity<>(h, HttpStatus.OK);
}

@ApiOperation("测试后端接收JavaBean的时间戳")
@GetMapping("/timestamp2")
@AnonymousAccess
public ResponseEntity<Object> testLocalDateTime2(QueryLocalDateTime queryLocalDateTime) throws Exception {
    System.out.println(queryLocalDateTime);
    return new ResponseEntity<>(queryLocalDateTime, HttpStatus.OK);
}
```

```java
/**
 * description: LocalDateTime测试实体
 **/
@Data
public class QueryLocalDateTime {

    private LocalDateTime createTime;

    private LocalDateTime endTime;

}
```


*PS：以上只做了对Java8时间中的LocalDateTime的适配，如果想要适配LocalDate或者适配LocalTime，可自行配置，原理都相同。*
<br>

## 附：完整的JacksonCustomizerConfig配置

```java
/**
 * jackson全局配置java8 LocalDateTime的序列化 全局配置时间返回格式
 */
@Configuration
public class JacksonCustomizerConfig {

    /**
     * description:适配自定义序列化和反序列化策略
     */
    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jackson2ObjectMapperBuilderCustomizer() {
        return builder -> {
            builder.serializerByType(LocalDateTime.class, new LocalDateTimeSerializer());
            builder.deserializerByType(LocalDateTime.class, new LocalDateTimeDeserializer());
        };
    }

    /**
     * description:序列化
     * LocalDateTime序列化为毫秒级时间戳
     */
    public static class LocalDateTimeSerializer extends JsonSerializer<LocalDateTime> {
        @Override
        public void serialize(LocalDateTime value, JsonGenerator gen, SerializerProvider serializers)
                throws IOException {
            if (value != null) {
                long timestamp = LocalDateTimeUtil.toEpochMilli(value);
                gen.writeNumber(timestamp);
            }
        }
    }

    /**
     * description:反序列化
     * 毫秒级时间戳序列化为LocalDateTime
     */
    public static class LocalDateTimeDeserializer extends JsonDeserializer<LocalDateTime> {
        @Override
        public LocalDateTime deserialize(JsonParser p, DeserializationContext deserializationContext)
                throws IOException {
            long timestamp = p.getValueAsLong();
            if (timestamp > 0) {
                return LocalDateTimeUtil.of(timestamp, ZoneOffset.of("+8"));
            } else {
                return null;
            }
        }
    }

    /**
     * description:LocalDateTime转换器，用于转换RequestParam和PathVariable参数
     * 接收毫秒级时间戳字符串——>LocalDateTime
     */
    @Bean
    public Converter<String, LocalDateTime> localDateTimeConverter() {
        return new Converter<String, LocalDateTime>() {
            @Override
            public LocalDateTime convert(String source) {
                //毫秒级时间戳转LocalDateTime
                return LocalDateTimeUtil.of(Long.parseLong(source), ZoneOffset.of("+8"));
            }
        };
    }

    /**
     * description:java.util.Date转换器
     * 接收毫秒级时间戳字符串——>Date
     */
    @Bean
    public Converter<String, Date> dateConverter() {
        return new Converter<String, Date>() {
            @Override
            public Date convert(String source) {
                long longTimeStamp = new Long(source);
                return new Date(longTimeStamp);
            }
        };
    }

}

```