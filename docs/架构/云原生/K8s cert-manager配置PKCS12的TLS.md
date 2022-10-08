---
title: K8s cert-manager配置PKCS12的TLS
date: 2022-08-25
categories:
 - 云原生
tags:
 - k8s
 - cert-manager
---

## 概念

### TLS

传输层安全性协议（英语：Transport Layer Security，缩写：TLS）及其前身安全套接层（英语：Secure Sockets Layer，缩写：SSL）是一种安全协议，目的是为互联网通信提供安全及数据完整性保障。

TLS协议采用[主从式架构](https://zh.wikipedia.org/wiki/%E4%B8%BB%E5%BE%9E%E5%BC%8F%E6%9E%B6%E6%A7%8B)模型，用于在两个应用程序间透过网络创建起安全的连线，防止在交换资料时受到[窃听](https://zh.wikipedia.org/wiki/%E7%AB%8A%E8%81%BD)及篡改。

TLS协议的优势是与高层的[应用层](https://zh.wikipedia.org/wiki/%E5%BA%94%E7%94%A8%E5%B1%82)协议（如[HTTP](https://zh.wikipedia.org/wiki/%E8%B6%85%E6%96%87%E6%9C%AC%E4%BC%A0%E8%BE%93%E5%8D%8F%E8%AE%AE)、[FTP](https://zh.wikipedia.org/wiki/%E6%96%87%E4%BB%B6%E4%BC%A0%E8%BE%93%E5%8D%8F%E8%AE%AE)、[Telnet](https://zh.wikipedia.org/wiki/Telnet)等）无耦合。应用层协议能透明地运行在TLS协议之上，由TLS协议进行创建加密通道需要的协商和认证。应用层协议传送的数据在通过TLS协议时都会被加密，从而保证通信的私密性。

在客户端和服务器开始交换TLS所保护的加密信息之前，他们必须安全地交换或协定加密密钥和加密数据时要使用的密码。在交换过程中使用的[公钥/私钥](https://zh.wikipedia.org/wiki/%E5%85%AC%E5%BC%80%E5%AF%86%E9%92%A5%E5%8A%A0%E5%AF%86)加密[密钥](https://zh.wikipedia.org/wiki/%E5%AF%86%E9%92%A5)的长度和在交换协议过程中使用的公钥证书也各不相同，因而提供的**强健性**的安全。

> 参看：
> [TLS（维基百科）](https://zh.wikipedia.org/wiki/傳輸層安全性協定)
> [SSL/TLS协议运行机制](https://www.ruanyifeng.com/blog/2014/02/ssl_tls.html)
> [SSL，HTTPS，TLS三者的区别](https://zhuanlan.zhihu.com/p/158711125)

### PKCS12

p12 文件包含使用 PKCS#12（公钥加密标准 #12）加密的**[数字证书。](https://techterms.com/definition/certificate)**它用作传输个人私钥和其他敏感信息的便携式格式。P12 文件被各种安全和加密程序使用。

P12 密钥存储一个私钥，该私钥以这样一种方式**[加密](https://techterms.com/definition/encryption)**信息，即只能通过相应的公钥对其进行解密。同样，用公钥加密的数据只能用私钥解密。这有助于验证传输信息的来源。

> 参看：
> [SSL 证书格式普及，PEM、CER、JKS、PKCS12](https://blog.freessl.cn/ssl-cert-format-introduce/)
> [PKCS12（维基百科）](https://zh.m.wikipedia.org/zh-hans/PKCS_12)

### [证书生成 .p12 .keyStore 和 .truststore文件理解](https://www.cnblogs.com/nhdlb/p/12258225.html)

**.p12(PKCS #12)**

我们的每一个证书都可以生成一个.p12文件，这个文件是一个加密的文件，只要知道其密码，就可以供给所有的系统设备使用，使设备不需要在重新申请开发和发布证书，就能使用。

*注意：一般.p12文件是给与别人使用的，本机必须已经有一个带秘钥的证书才可以生成.p12文件*

**.keystore(密钥库)**

keystore中一般保存的是我们的私钥，用来加解密或者为别人做签名用。

**.truststore(信任库)**

truststore中保存的是一些可信任的证书，主要是java在代码中访问某个https的时候对被访问者进行认证的，以确保其实可信任的。

truststore是必须的，如果我们没有显式的指定，那么java会默认指定为$JAVA_HOME/lib/security/cacerts 这个文件。

**.p12一般存放的是生成的（服务器端或客户端）证书与密钥，类似打包存放。**

**.keystore一般存放的是（服务器端或客户端）证书与密钥，或直接存放 .p12 文件包。**

**.truststore一般存放的是系统根证书与密钥信息。**

## 使用cert-manager配置PKCS12

## 定义证书颁发机构

```yaml
apiVersion:cert-manager.io/v1
kind: Issuer
metadata:
  name: selfsigned-issuer
  namespace: myNamespace
spec:
  selfSigned: {}
```

也可以定义集群全局的证书颁发机构：

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: selfsigned-cluster-issuer
spec:
  selfSigned: {}
```

### 定义P12证书的密码文件

这里使用K8s的secret

```yaml
# pkcs12 Secret
apiVersion: v1
kind: Secret
metadata:
  name: pkcs12-secret
type: Opaque
data:
  # 需要转换成 base64 格式
  # echo -n "your password" | base64
  p12_password.txt: {{ .Values.helmCode }}
```

### 定义证书

```yaml
# create certificate for pkcs12
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: myCert
spec:
  # pkcs12 密钥库的配置
  keystores:
    pkcs12:
      # 创建p12文件
      create: true
      passwordSecretRef:
        name: pkcs12-secret
				# 引用secret中的密码
        key: p12_password.txt
	# 配置合适的dns myService为当前服务的service
  dnsNames:
    - myService
    - myService.myNamespace
    - myService.myNamespace.svc
    - myService.myNamespace.svc.cluster.local
	# 技巧：使用相同的secret，会进行文件合并
  secretName: pkcs12-secret
	# 需要配置commonName，否则可能出现问题
  commonName: myService
  # 证书时间 10年
  duration: 87600h
  issuerRef:
    name: selfsigned-cluster-issuer
    # 使用集群全局issuer，需要配置kind
    kind: ClusterIssuer
```

**keystores** 

> *(Optional)*
>
>
> Keystores configures additional keystore output formats stored in the **`secretName`** Secret resource.

**CertificateKeystores**

> **jks | pkcs12**
> *[PKCS12Keystore](https://cert-manager.io/v1.8-docs/reference/api-docs/#cert-manager.io/v1.PKCS12Keystore)(Optional)* PKCS12 configures options for storing a PKCS12 keystore in the **`spec.secretName`**
>  Secret resource.

**create** *bool*     

Create enables PKCS12 keystore creation for the Certificate. If true, a file named **`keystore.p12`**will be created in the target Secret resource, encrypted using the password stored in **`passwordSecretRef`**. The keystore file will only be updated upon re-issuance. A file named **`truststore.p12`**will also be created in the target Secret resource, encrypted using the password stored in **`passwordSecretRef`**containing the issuing Certificate Authority

创建启用证书的PKCS12密钥库创建。如果为true，将在目标秘密资源中创建一个名为keystore.p12的文件，该文件使用存储在passwordsecretref中的密码进行加密。重新发行时，密钥库文件只会更新。一个名为TrustStore.p12的文件也将在目标秘密资源中创建，并使用存储的密码加密，该密码已存储在Passwordsecretref中

passwordSecretRef

> 
>
>
> *[SecretKeySelector](https://cert-manager.io/v1.8-docs/reference/api-docs/#meta.cert-manager.io/v1.SecretKeySelector)*
>
> PasswordSecretRef is a reference to a key in a Secret resource containing the password used to encrypt the PKCS12 keystore.

具体参看：[https://cert-manager.io/v1.8-docs/reference/api-docs/#cert-manager.io/v1.PKCS12Keystore](https://cert-manager.io/v1.8-docs/reference/api-docs/#cert-manager.io/v1.PKCS12Keystore)

**commonName的说明**

如果不加可能报错：

```bash
java.security.cert.CertificateParsingException: Empty issuer DN not allowed in X509Certificates
```

> 参看:
>
>
> [https://github.com/cert-manager/cert-manager/issues/3634](https://github.com/cert-manager/cert-manager/issues/3634)
>
> [https://github.com/kubernetes-client/java/issues/1926](https://github.com/kubernetes-client/java/issues/1926)

### 生成相应文件

- ca.crt
- keystore.p12
- tls.crt
- tls.key
- truststore.p12
- p12_password.txt

## K8s 自动化引用PKCS12证书

我们已经将pkcs12的证书，还有密码文件生成到名为 `pkcs12-secret` 的secret当中，只要将此secret挂载到pod的pv中即可使用相应的文件。

使用pkcs12服务端和客户端都需要相应的证书配置，具体如何使用，需参看具体的使用场景。

使用K8s的yaml或者helm将cert-manager的配置写到整个流程中，即可完成全流程的pkcs12的TLS配置。

> 参看：[secret使用](https://www.qikqiak.com/post/use-secret-in-k8s/)

## 参看

- [TLS（维基百科）](https://zh.wikipedia.org/wiki/傳輸層安全性協定)
- [SSL/TLS协议运行机制](https://www.ruanyifeng.com/blog/2014/02/ssl_tls.html)
- [SSL，HTTPS，TLS三者的区别](https://zhuanlan.zhihu.com/p/158711125)
- [SSL 证书格式普及，PEM、CER、JKS、PKCS12](https://blog.freessl.cn/ssl-cert-format-introduce/)
- [PKCS12（维基百科）](https://zh.m.wikipedia.org/zh-hans/PKCS_12)
- [证书生成 .p12 .keyStore 和 .truststore文件理解](https://www.cnblogs.com/nhdlb/p/12258225.html)
- [https://cert-manager.io/v1.8-docs/reference/api-docs/#cert-manager.io/v1.PKCS12Keystore](https://cert-manager.io/v1.8-docs/reference/api-docs/#cert-manager.io/v1.PKCS12Keystore)
- [secret使用](https://www.qikqiak.com/post/use-secret-in-k8s/)
