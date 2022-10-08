---
title: go-kit grpc调用及中间件封装
date: 2022-09-02
categories:
- go
tags:
- go
---

## 存在问题

### grpc 调用问题

通常我们向业务返回会定义如下的结构：

```json
{
    "code": 20000,
    "msg": "Success",
    "data": {}
}
```

但是如果我们定义如下的proro，**grpc的返回值可以在客户端不能直接使用，还需要使用json进行解析**。

```protobuf
message Response {
  string code = 1;  // 响应码
  string msg = 2;  // 响应描述信息
  string data = 3;  // json 格式待定
}
```

如果每次都定义rpc的响应的话，又会引发另一个问题：

每个rpc请求都会定义一个 `Response` ，这样我们的 `data` 的数据类型可能是不同的。

如果我们在写service的时候，即需要处理error请求，返回error的结果，还需要返回正常的结构，那么我们的代码中可能会经常出现如下的现象：

**一个 `func` 可能出现返回多个返参，会使得代码变得臃肿。**

```go
if err != nil {
		logger.Warnf("方法名: %s, 错误: %+v, 参数:  %s", methodName, err, url)
		return &pb.Response{
			Code: 32000,
			Msg:  err.Error(),
			Data: nil,
		}
	}

	if err != nil {
		logger.Warnf("方法名: %s, 错误: %+v, 参数:  %+v", methodName, err, cond2)
		return &pb.Response{
			Code: 32001,
			Msg:  err.Error(),
			Data: nil,
		}
	}

	return &pb.Response{
		Code: 20000,
		Msg:  err.Error(),
		Data: nil,
	}
```

### 日志频繁记录问题

存在问题：

- 项目中service遇到error经常会写一些error/warn日志
- 很多 `func` 定义了 `error` 但是返回的却是 `nil` （*因为已经记录了日志，没必要往下继续执行*）

代码示例如下：

```go
if err != nil {
	logger.Warnf("方法名: %s, 错误: %+v, 参数:  %+v", methodName, err, cond2)
	return nil
}
```

与go-kit的分层理念并不符合，service专注于业务的开发。

### grpc异常panic导致程序挂掉

如果在一次grpc调用中，出现了 `panic` 异常，没有 `recover` 处理的话，会导致程序宕机。

## 封装通用结构体和响应

```go
type CommonResponse struct {
	Code string      `json:"code"`
	Msg  string      `json:"msg"`
	Data interface{} `json:"data"`
}

// SuccessResponse 成功的响应
func SuccessResponse(data interface{}) *CommonResponse {
	return &CommonResponse{
		Code: SUCCESS_CODE,
		Msg:  SUCCESS_MSG,
		Data: data,
	}
}

// OkResponse 成功的响应
func OkResponse() *CommonResponse {
	return &CommonResponse{
		Code: SUCCESS_CODE,
		Msg:  SUCCESS_MSG,
	}
}

// FailDefaultResponse 失败的响应
func FailDefaultResponse(msg string) *CommonResponse {
	return &CommonResponse{
		Code: ERROR_CODE,
		Msg:  msg,
	}
}

// FailResponse 失败的响应
func FailResponse(code, msg string) *CommonResponse {
	return &CommonResponse{
		Code: code,
		Msg:  msg,
	}
}

// FailDefaultResponseWithData 失败的响应
func FailDefaultResponseWithData(msg string, failData interface{}) *CommonResponse {
	return &CommonResponse{
		Code: ERROR_CODE,
		Msg:  msg,
		Data: failData,
	}
}

// FailResponseWithData 失败的响应
func FailResponseWithData(code, msg string, failData interface{}) *CommonResponse {
	return &CommonResponse{
		Code: code,
		Msg:  msg,
		Data: failData,
	}
}
```

## go-kit中间件封装

go-kit可以封装中间件，在 endpoint 层进行绑定，类似于java的AOP思想，可以用来日志记录、监控、统计等场景。

### Recover中间件

封装recover中间件，绑定到每个rpc service，处理 `panic` 异常，解决程序宕机问题。

```go
// RecoveringEndpointMiddleware panic 处理
func RecoveringEndpointMiddleware(method string) endpoint.Middleware {
	return func(next endpoint.Endpoint) endpoint.Endpoint {
		return func(ctx context.Context, request interface{}) (response interface{}, e error) {

			defer func() {
				if err := recover(); err != nil {
					switch err.(type) {
					case runtime.Error: // 运行时错误
						logger.Errorf("method:%v runtime error:%+v", method, err)
					default: // 非运行时错误
						logger.Errorf("method:%v error::%+v", method, err)
					}
					debug.PrintStack()
					
					// 自定义失败的响应
					response = res.FailResponse(res.ERROR_CODE, res.ERROR_MSG)
					e = nil
				}
			}()

			response, e = next(ctx, request)
			return response, e
		}
	}
}
```

### 日志记录中间件

```go
// LoggingMiddleware returns an endpoint middleware that logs the
// duration of each invocation, and the resulting error, if any.
func LoggingMiddleware(method string) endpoint.Middleware {
	return func(next endpoint.Endpoint) endpoint.Endpoint {
		return func(ctx context.Context, request interface{}) (response interface{}, err error) {
			r, errs := next(ctx, request)

			defer func(begin time.Time) {
				if errs != nil {
					logger.Errorf("method: %v,time consuming:%v err: %v", method, time.Since(begin), errs.Error())
				} else {
					logger.Infof("method: %v,time consuming:%v", method, time.Since(begin))
				}

				errs = nil
			}(time.Now())

			return r, errs
		}
	}
}
```

`next` 函数可以返回上一层的error，service的error在这里统一处理，然后在这里统一进行日志的记录。

记录日志时，并且记录service的执行时间。

如果遇到业务异常，直接自定义再次处理error：

```go
if err != nil {
		return res.FailDefaultResponse("server err"), errors.Errorf("server err err. param:%v", param)
}
```
