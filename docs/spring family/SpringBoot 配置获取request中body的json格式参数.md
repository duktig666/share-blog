---
title: 修改SpringBoot默认的启动图案
date: 2021-05-16
author: RenShiWei
categories:
 - spring family
tags:
 - springboot
---

## 背景

最近开发项目，因为有第三方调用我们的接口，我们使用`SpringBoot`以`JavaBean`的方式接收了我们预期的参数，参数接收也没有什么异常。但是有一些需求问题需要沟通，需要拿到合作第三方传入的所有参数，来进行参数核验。

如何拿到请求的所有参数呢？正常的思路肯定是从`request`中获取，如果是`GET`请求，参数在请求路径中拼接；如果是`POST`请求，参数在`request`的请求体（`body`）中。

一番检索，很容易拿到相关代码。但是经过实操，发现并不能如期获取到参数。经过思考，我的接口是`POST`请求，参数形式是json格式（使用了`@RequestBody`来修饰参数）。

*具体过程参看如下分析*

<br>

## 获取请求中的参数（非json格式参数）

### 获取方法

#### 方法一

```java
Enumeration<String> parameterNames = request.getParameterNames();
while (parameterNames.hasMoreElements()) {
    String paraName = parameterNames.nextElement();
    System.out.println(paraName + ": " + request.getParameter(paraName));
}
```
#### 方法二

```java
Map<String, String[]> map = request.getParameterMap();
Set<Map.Entry<String, String[]>> keSet = map.entrySet();
for (Iterator<Map.Entry<String, String[]>> itr = keSet.iterator(); itr.hasNext(); ) {
    Map.Entry<String, String[]> me = itr.next();
    Object ok = me.getKey();
    Object ov = me.getValue();
    String[] value = new String[1];
    if (ov != null) {
        value = (String[]) ov;
    } else {
        value[0] = ov.toString();
    }
    for (int k = 0; k < value.length; k++) {
        System.out.println(ok + "=" + value[k]);
    }
}
```

### 结论

**经过测试以上两个方法可以获取==GET请求==的参数，以及==参数格式为form-data、x-www-form-urlencoded的POST请求==，但是==json格式参数（postman中为raw）的参数不能获得==**。

根据代码的简介程度，选择方法一，明显更舒服一些。

*以上结论经过postman实测.*

<br>

## 获取POST请求json格式的参数

以上方法已经可以获取大多数情况下的请求的参数，但是明显还不能满足需求，需要获取传入json格式的参数。
<br>

### 经过检索推荐方法（参看后边完整方法）

经过一番检索，网上推荐的方法一般都是使用流来进行参数读取，即使用`getInputStream()`和`getReader()`：

```java
Map<String, Object> params = new HashMap<>();
BufferedReader br = null;
try {
    try {
        br = request.getReader();
    } catch (IOException e) {
        e.printStackTrace();
    }
    String str;
    StringBuilder wholeStr = new StringBuilder();
    while ((str = Objects.requireNonNull(br).readLine()) != null) {
        wholeStr.append(str);
    }
    if (StrUtil.isNotEmpty(wholeStr.toString())) {
        params = JSON.parseObject(wholeStr.toString(), Map.class);
    }
} catch (IOException e) {
    e.printStackTrace();
}
System.out.println(params);
```
<br>

#### 遇到的问题及解决思路

##### 问题1 流不能多次被调用

但是又会遇到如下问题：

```java
ERROR m.e.handler.GlobalExceptionHandler - getInputStream() has already been called for this request
java.lang.IllegalStateException: getInputStream() has already been called for this request
	at org.apache.catalina.connector.Request.getReader(Request.java:1212)
	at org.apache.catalina.connector.RequestFacade.getReader(RequestFacade.java:504)
```
根据报错信息分析简单来说，就是`getInputStream()`已经被调用了，不能再次调用。可是我看代码上，我也没调用。经过一番检索，原来`@RequestBody`注解配置后，默认会使用流来读取数据。

**具体原因：**
- 默认配置时，`getInputStream()`和`getReader()`一起使用会报错，使用两遍`getInputStream()`，第二遍会为空。
- 当存在`@RequestBody`等注解时，springMVC已读取过一遍流，默认单独使用`getInputStream()`或`getReader()`都为空。

实测，不加`@RequestBody`注解，可以如期获得请求中的json参数，但是又不得不加`@RequestBody`注解。这样就需要新的思路

<br>

#### 解决思路

写filter继承`HttpServletRequestWrapper`，缓存`InputStream`，覆盖`getInputStream()`和`getReader()`方法，使用`ByteArrayInputStream is = new ByteArrayInputStream(body.getBytes());`读取`InputStream`。

<br>

### 实现方法

#### 1.定义增强类，继承继承HttpServletRequestWrapper

将请求体中的流copy一份，覆写`getInputStream()`和`getReader()`方法供外部使用。每次调用覆写后的`getInputStream()`方法都是从复制出来的二进制数组中进行获取，这个二进制数组在对象存在期间一直存在，这样就实现了流的重复读取。
<br>

```java
public class BodyReaderHttpServletRequestWrapper extends HttpServletRequestWrapper {

    private byte[] body;

    public BodyReaderHttpServletRequestWrapper(HttpServletRequest request) throws IOException {
        super(request);
        body = HttpHelper.getBodyString(request).getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public BufferedReader getReader() throws IOException {
        return new BufferedReader(new InputStreamReader(getInputStream()));
    }

    @Override
    public ServletInputStream getInputStream() throws IOException {

        final ByteArrayInputStream bais = new ByteArrayInputStream(body);

        return new ServletInputStream() {

            @Override
            public int read() throws IOException {
                return bais.read();
            }

            @Override
            public boolean isFinished() {
                return false;
            }

            @Override
            public boolean isReady() {
                return false;
            }

            @Override
            public void setReadListener(ReadListener readListener) {

            }

        };
    }

    public void setInputStream(byte[] body) {
        this.body = body;
    }
}

```

#### 2.构建过滤器

```java
@Slf4j
@WebFilter(filterName = "RequestWrapperFilter", urlPatterns = "/api/test/test2")
public class RequestWrapperFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws ServletException
            , IOException {
        ServletRequest requestWrapper = null;
        if (request instanceof HttpServletRequest) {
            requestWrapper = new BodyReaderHttpServletRequestWrapper((HttpServletRequest) request);
        }
        if (null == requestWrapper) {
            log.error("过滤器包装request失败!将返回原来的request");
            chain.doFilter(request, response);
        } else {
            log.info("过滤器包装request成功");
            chain.doFilter(requestWrapper, response);
        }
    }

    @Override
    public void destroy() {

    }

}
```

注意事项：
1. 使用`@WebFilter`注解的`urlPatterns`属性，可指定过滤哪一个接口方法。
2. 过滤器类最好不要交由Spring管理，否则每一个接口都会进行过滤（实测）。例如：不要添加`@Component`注解.

#### 3.编写工具类方便调用

```java
/**
 * description:http辅助工具类
 *
 * @author RenShiWei
 * Date: 2021/5/7 22:11
 **/
public class HttpHelper {

    /**
     * description:从request获取body的json数据
     *
     * @param request /
     * @return /
     * @author RenShiWei
     * Date: 2021/5/7 22:44
     */
    public static String getBodyString(ServletRequest request) {
        StringBuilder sb = new StringBuilder();
        ServletInputStream inputStream = null;
        BufferedReader reader = null;
        try {
            inputStream = request.getInputStream();
            reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8));
            String line = "";
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (inputStream != null) {
                try {
                    inputStream.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            if (reader != null) {
                try {
                    reader.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        return sb.toString();
    }

    /**
     * description:从request获取body的json数据，并格式化成map形式
     *
     * @param request /
     * @return /
     * @author RenShiWei
     * Date: 2021/5/7 22:44
     */
    @SuppressWarnings("all")
    public static Map<String, Object> getBodyMap(ServletRequest request) {
        Map<String, Object> params = new HashMap<>();
        String bodyString = getBodyString(request);
        if (StrUtil.isNotEmpty(bodyString)) {
            params = JSON.parseObject(bodyString, Map.class);
        }
        return params;
    }

}


```

#### 4.在SpringBoot启动类上添加`@ServletComponentScan`注解

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210516143005224.png)

<br>

### 使用

```java
@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/test1")
    @AnonymousAccess
    public ResponseEntity<String> test1(HttpServletRequest request) {
        System.out.println("---GET请求 getParameterNames 入参---");
        try {
            request.setCharacterEncoding("utf-8");
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        Enumeration<String> parameterNames = request.getParameterNames();
        while (parameterNames.hasMoreElements()) {
            String paraName = parameterNames.nextElement();
            System.out.println(paraName + ": " + request.getParameter(paraName));
        }

        System.out.println("---GET请求 getParameterMap 入参---");
        Map<String, String[]> map = request.getParameterMap();
        Set<Map.Entry<String, String[]>> keSet = map.entrySet();
        for (Iterator<Map.Entry<String, String[]>> itr = keSet.iterator(); itr.hasNext(); ) {
            Map.Entry<String, String[]> me = itr.next();
            Object ok = me.getKey();
            Object ov = me.getValue();
            String[] value = new String[1];
            if (ov != null) {
                value = (String[]) ov;
            } else {
                value[0] = ov.toString();
            }
            for (int k = 0; k < value.length; k++) {
                System.out.println(ok + "=" + value[k]);
            }
        }

        return ResponseEntity.ok(null);
    }

    @PostMapping("/test2")
    @AnonymousAccess
    public ResponseEntity<String> test2(@RequestBody TestParam testParam, HttpServletRequest request) {
        String body = HttpHelper.getBodyString(request);
        Map<String, Object> bodyMap = HttpHelper.getBodyMap(request);
        System.out.println("body: " + body);
        System.out.println("bodyMap: " + bodyMap);

        return ResponseEntity.ok(null);
    }

}

```

#### postman测试

1. GET请求
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210516142354397.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQyOTM3NTIy,size_16,color_FFFFFF,t_70)
2. POST的JSON格式参数（其他方式结果与GET请求结果一致）
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210516142459899.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQyOTM3NTIy,size_16,color_FFFFFF,t_70)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20210516142518948.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQyOTM3NTIy,size_16,color_FFFFFF,t_70)

#### 结果

![在这里插入图片描述](https://img-blog.csdnimg.cn/20210516144628521.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQyOTM3NTIy,size_16,color_FFFFFF,t_70)

## 参考

- [Springboot读取Request参数的坑](https://www.cnblogs.com/feixuefubing/p/9381731.html)
- [完美解决request请求流只能读取一次的问题](https://www.jb51.net/article/193961.htm)
- [SpringBoot 之 SpringMVC拦截器从Request中获取参数并解决request的请求流只能读取一次的问题](https://blog.csdn.net/zhouzhiwengang/article/details/101031353)
- [java has already_spring mvc处理http请求报错:java.lang.IllegalStateException: getInputStream() has already ...](https://blog.csdn.net/weixin_35152751/article/details/114658453)
- [获取HttpServletRequest中的所有参数](https://blog.csdn.net/qq_34589867/article/details/93033481)
- [从HttpServletRequest中获取body中的参数](https://blog.csdn.net/alvin_hop/article/details/84883825?utm_medium=distribute.pc_relevant.none-task-blog-2~default~BlogCommendFromMachineLearnPai2~default-3.control&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2~default~BlogCommendFromMachineLearnPai2~default-3.control)