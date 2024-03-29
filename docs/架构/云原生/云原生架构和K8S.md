---
title: 云原生架构和K8S
date: 2021-10-21
categories:
 - 微服务
---

> 本篇文章的思维导图参看语雀：https://www.yuque.com/docs/share/d54efb7e-1d2d-4004-9ec3-f634d803456e?# 《云原生》

# 云原生

## 什么是云原生？

云原生是一种**构建和运行应用程序的方法**，是一套技术体系和方法论。云原生（CloudNative）是一个组合词，Cloud+Native。Cloud表示应用程序位于云中，而不是传统的数据中心；Native表示应用程序从设计之初即考虑到云的环境，原生为云而设计，**在云上以最佳姿势运行**，充分利用和发挥云平台的弹性+分布式优势。

简单理解：**从设计之初考虑，将原生程序以最好的方式运行在云上**。

重要点：**DevOps+持续交付+微服务+容器**

## 符合云原生架构的程序？

**符合云原生架构的应用程序应该是：采用开源堆栈（K8S+Docker）进行容器化，基于微服务架构提高灵活性和可维护性，借助敏捷方法、DevOps支持持续迭代和运维自动化，利用云平台设施实现弹性伸缩、动态调度、优化资源利用率。**

# Kubernetes

## 什么是 K8S ？

> [Kubernetes](https://kubernetes.io/zh/docs/concepts/overview/what-is-kubernetes/) 是用于**自动部署**，**扩展和管理容器化应用程序**的开源系统。
>
> 它将组成应用程序的容器组合成逻辑单元，以便于管理和服务发现。Kubernetes ，同时凝聚了社区的最佳创意和实践。
>
> k8s 这个缩写是因为 k 和 s 之间有八个字符的关系。 Google 在 2014 年开源了 Kubernetes 项目。Kubernetes 源自[Google 15 年生产环境的运维经验](http://queue.acm.org/detail.cfm?id=2898444) ，结合了社区中最好的想法和实践。
>
> Kubernetes 为你提供了一个可弹性运行分布式系统的框架。 Kubernetes 会满足你的扩展要求、故障转移、部署模式等。

## 部署架构发展史？

从部署的 **架构发展史** 角度出发：

![部署架构发展史](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202110072149288.png)

### 传统部署时代

早期，各个组织机构在物理服务器上运行应用程序，无法为物理服务器中的应用程序定义资源边界，这会导致资源分配问题。

总结：**无法实现资源隔离**。

可能出现的问题：

> 例1：如果在物理服务器上运行多个应用程序，则可能会出现一个应用程序占用大部分资源的情况， 结果可能导致其他应用程序的性能下降。 
>
> 例2：网易云音乐修改了QQ的文件，很有可能大致QQ的应用程序崩溃。

一种解决方案是在不同的物理服务器上运行每个应用程序，但是由于资源利用不足而无法扩展， 并且维护许多物理服务器的成本很高。

### 虚拟化部署时代

虚拟化技术**允许在单个物理服务器的 CPU 上运行多个虚拟机（VM）**。 虚拟化**允许应用程序在 VM 之间隔离**，并提供一定程度的安全，因为一个应用程序的信息 不能被另一应用程序随意访问。

虚拟化技术能够更好地利用物理服务器上的资源，并且因为可轻松地添加或更新应用程序 而可以实现更好的可伸缩性，降低硬件成本等等。

每个 VM 是一台完整的计算机，在虚拟化硬件之上运行所有组件，包括其自己的操作系统。

总结：虽然资源实现隔离，但是

## 容器部署时代

容器类似于 VM，但是它们具有被**放宽的隔离属性**，可以在应用程序之间共享操作系统（OS），因此容器是**轻量级**的。

它具有自己的文件系统、CPU、内存、进程空间等。 由于它们与基础架构分离，因此**可以跨云和 OS 发行版本进行移植**。

容器因具有许多优势而变得流行起来。下面列出的是容器的一些好处：

- 敏捷应用程序的创建和部署：与使用 VM 镜像相比，提高了容器镜像创建的简便性和效率。
- 持续开发、集成和部署：通过快速简单的回滚（由于镜像不可变性），支持可靠且频繁的 容器镜像构建和部署。
- 关注开发与运维的分离：在构建/发布时而不是在部署时创建应用程序容器镜像， 从而将应用程序与基础架构分离。
- 可观察性：不仅可以显示操作系统级别的信息和指标，还可以显示应用程序的运行状况和其他指标信号。
- 跨开发、测试和生产的环境一致性：在便携式计算机上与在云中相同地运行。
- 跨云和操作系统发行版本的可移植性：可在 Ubuntu、RHEL、CoreOS、本地、 Google Kubernetes Engine 和其他任何地方运行。
- 以应用程序为中心的管理：提高抽象级别，从在虚拟硬件上运行 OS 到使用逻辑资源在 OS 上运行应用程序。
- 松散耦合、分布式、弹性、解放的微服务：应用程序被分解成较小的独立部分， 并且可以动态部署和管理 - 而不是在一台大型单机上整体运行。
- 资源隔离：可预测的应用程序性能。
- 资源利用：高效率和高密度。



## 为什么要使用 K8S ？（K8S的特性）

- **服务发现与负载均衡**

- - **无需修改你的应用程序即可使用陌生的服务发现机制**。Kubernetes 可以使用 DNS 名称或自己的 IP 地址**公开容器**，如果进入容器的流量很大， Kubernetes 可以**负载均衡并分配网络流量**，从而使部署稳定

- **存储编排**

- - **自动挂载所选存储系统**，包括本地存储（诸如 GCP 或 AWS 之类公有云提供商所提供的存储）或者网络存储系统（诸如 NFS、iSCSI、Gluster、Ceph、Cinder 或 Flocker）。

- **自动化上线和回滚**

- - Kubernetes 会分步骤地将针对应用或其配置的更改上线，同时监视应用程序运行状况以确保你不会同时终止所有实例。如果出现问题，Kubernetes 会为你回滚所作更改。你应该充分利用不断成长的部署方案生态系统。

- **自动装箱**

- - 根据资源需求和其他约束自动放置容器，同时避免影响可用性。Kubernetes 允许你指定每个容器所需 CPU 和内存（RAM）。 当容器指定了资源请求时，Kubernetes 可以做出更好的决策来管理容器的资源。

- **Secret 和配置管理**

- - Kubernetes 允许你**存储和管理敏感信息**，例如密码、OAuth 令牌和 ssh 密钥。 你可以在不重建容器镜像的情况下部署和更新密钥和应用程序配置，也无需在堆栈配置中暴露密钥。

- **自我修复**

- - Kubernetes 重新启动失败的容器、替换容器、杀死不响应用户定义的 运行状况检查的容器，并且在准备好服务之前不将其通告给客户端。

- ……

## 组件

一个 Kubernetes 集群由一组被称作节点的机器组成。这些节点上运行 Kubernetes 所管理的容器化应用。集群具有至少一个工作节点。

工作节点托管作为应用负载的组件的 Pod 。控制平面管理集群中的工作节点和 Pod 。 为集群提供故障转移和高可用性，这些控制平面一般跨多主机运行，集群跨多个节点运行。

![K8S架构](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202109302051980.png)

### 1、控制平面组件（Control Plane Components）

控制平面的组件**对集群做出全局决策(比如调度)**，以及**检测和响应集群事件**（例如，当不满足部署的 `replicas` 字段时，启动新的 [pod](https://kubernetes.io/docs/concepts/workloads/pods/pod-overview/)）。

控制平面组件可以在集群中的任何节点上运行。 然而，为了简单起见，设置脚本通常会在同一个计算机上启动所有控制平面组件， 并且不会在此计算机上运行用户容器。 请参阅[使用 kubeadm 构建高可用性集群](https://kubernetes.io/zh/docs/setup/production-environment/tools/kubeadm/high-availability/) 中关于多 VM 控制平面设置的示例。

#### kube-apiserver

API 服务器是 Kubernetes [控制面](https://kubernetes.io/zh/docs/reference/glossary/?all=true#term-control-plane)的组件， 该组件**公开了 Kubernetes API**。 API 服务器是 Kubernetes 控制面的前端。

Kubernetes API 服务器的主要实现是 [kube-apiserver](https://kubernetes.io/zh/docs/reference/command-line-tools-reference/kube-apiserver/)。 kube-apiserver 设计上考虑了水平伸缩，也就是说，它可通过部署多个实例进行伸缩。 你可以运行 kube-apiserver 的多个实例，并在这些实例之间平衡流量。

***有点类似于微服务中的网关***。

#### etcd

etcd 是兼具一致性和高可用性的键值数据库，可以**作为保存 Kubernetes 所有集群数据的后台数据库**。

*您的 Kubernetes 集群的 etcd 数据库通常需要有个备份计划。要了解 etcd 更深层次的信息，请参考 [etcd 文档](https://etcd.io/docs/)。*

#### kube-scheduler

控制平面组件，负责**监视新创建的、未指定运行[节点（node）](https://kubernetes.io/zh/docs/concepts/architecture/nodes/)的 [Pods](https://kubernetes.io/docs/concepts/workloads/pods/pod-overview/)，选择节点让 Pod 在上面运行**。

调度决策考虑的因素包括单个 Pod 和 Pod 集合的资源需求、硬件/软件/策略约束、亲和性和反亲和性规范、数据位置、工作负载间的干扰和最后时限。

#### kube-controller-manager

运行[控制器](https://kubernetes.io/zh/docs/concepts/architecture/controller/)进程的控制平面组件。

从逻辑上讲，每个[控制器](https://kubernetes.io/zh/docs/concepts/architecture/controller/)都是一个单独的进程， 但是为了降低复杂性，它们都被编译到同一个可执行文件，并在一个进程中运行。

这些控制器包括:

- 节点控制器（Node Controller）: 负责在节点出现故障时进行通知和响应
- 任务控制器（Job controller）: 监测代表一次性任务的 Job 对象，然后创建 Pods 来运行这些任务直至完成
- 端点控制器（Endpoints Controller）: 填充端点(Endpoints)对象(即加入 Service 与 Pod)
- 服务帐户和令牌控制器（Service Account & Token Controllers）: 为新的命名空间创建默认帐户和 API 访问令牌

#### cloud-controller-manager

云控制器管理器是指嵌入特定云的控制逻辑的 [控制平面](https://kubernetes.io/zh/docs/reference/glossary/?all=true#term-control-plane)组件。 云控制器管理器使得你可以将你的集群连接到云提供商的 API 之上， 并将与该云平台交互的组件同与你的集群交互的组件分离开来。

`cloud-controller-manager` 仅运行特定于云平台的控制回路。 如果你在自己的环境中运行 Kubernetes，或者在本地计算机中运行学习环境， 所部署的环境中不需要云控制器管理器。

与 `kube-controller-manager` 类似，`cloud-controller-manager` 将若干逻辑上独立的 控制回路组合到同一个可执行文件中，供你以同一进程的方式运行。 你可以对其执行水平扩容（运行不止一个副本）以提升性能或者增强容错能力。

下面的控制器都包含对云平台驱动的依赖：

- 节点控制器（Node Controller）: 用于在节点终止响应后检查云提供商以确定节点是否已被删除
- 路由控制器（Route Controller）: 用于在底层云基础架构中设置路由
- 服务控制器（Service Controller）: 用于创建、更新和删除云提供商负载均衡器

### 2、Node 组件

节点组件在每个节点上运行，维护运行的 Pod 并提供 Kubernetes 运行环境。

#### kubelet

一个在集群中每个[节点（node）](https://kubernetes.io/zh/docs/concepts/architecture/nodes/)上运行的代理。 它保证[容器（containers）](https://kubernetes.io/zh/docs/concepts/overview/what-is-kubernetes/#why-containers)都 运行在 [Pod](https://kubernetes.io/docs/concepts/workloads/pods/pod-overview/) 中。

kubelet 接收一组通过各类机制提供给它的 PodSpecs，确保这些 PodSpecs 中描述的容器处于运行状态且健康。 kubelet 不会管理不是由 Kubernetes 创建的容器。

#### kube-proxy

[kube-proxy](https://kubernetes.io/zh/docs/reference/command-line-tools-reference/kube-proxy/) 是集群中每个节点上运行的网络代理， 实现 Kubernetes [服务（Service）](https://kubernetes.io/zh/docs/concepts/services-networking/service/) 概念的一部分。

kube-proxy 维护节点上的网络规则。这些网络规则允许从集群内部或外部的网络会话与 Pod 进行网络通信。

如果操作系统提供了数据包过滤层并可用的话，kube-proxy 会通过它来实现网络规则。否则， kube-proxy 仅转发流量本身。



## 理解K8S的组件

下图为尚硅谷云原生视频中讲述的例子，方便理解：

![K8S架构详解](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202109302051122.png)

- Control Plane Components（硅谷总部）：K8S的控制层，用于管理所有的容器节点，一般部署在master节点上。可类比公司总部，宏观调控整个公司。
  - kubu-apiserver（秘书部）：控制层的入口，负责传达决策的命令。就像秘书一样。有点类似于微服务架构中的Nginx，访问后端的唯一入口。
  - etcd（资料库）：用于存储K8S所有集群数据的后台数据库。
  - kube-scheduler（调度者）：根据服务器综合因素运行和监控节点。
  - kube-controller-manager（决策者）：控制层的真正决策者，几大作用：
    - 节点控制器：在节点故障时进行通知和响应
    - 任务控制器：创建Pod运行并检测任务（Job）
    - 端点控制器：加入Service和Pod
    - 服务帐户和令牌控制器：创建和管理账户和API令牌
  - cloud-controller-manager（外联部）：与第三方云提供商进行交互
- Node节点（公司分部）：维护和运行的Pod（K8S中最小的运行单位，相当于docker中的多个容器）
  - kubelet（厂长）：管理集群中的一个节点
  - kube-proxy（门卫）：维护节点的网络规则，并与其他节点的kube-proxy进行互通。

# KubeSphere

## KubeSphere 概述

> [KubeSphere](https://kubesphere.io/) 是在 [Kubernetes](https://kubernetes.io/) 之上构建的面向云原生应用的**分布式操作系统**，完全开源，支持多云与多集群管理，提供全栈的 IT 自动化运维能力，简化企业的 DevOps 工作流。它的架构可以非常方便地使第三方应用与云原生生态组件进行即插即用 (plug-and-play) 的集成。
>
> KubeSphere 为用户提供构建企业级 Kubernetes 环境所需的多项功能，例如**多云与多集群管理、Kubernetes 资源管理、DevOps、应用生命周期管理、微服务治理（服务网格）、日志查询与收集、服务与网络、多租户管理、监控告警、事件与审计查询、存储管理、访问权限控制、GPU 支持、网络策略、镜像仓库管理以及安全管理**等。

![KubeSphere功能](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202109302151590.jpeg)

## **KubeSphere**的优势？

虽然K8S为我们提供了一些列的容器化治理的能力，也提供了Web组件dashboard方便操作。但是在部署复杂的微服务项目时，还是显的比较复杂。

而使用KubeSphere后，我们可以更加方便去部署和运维，可以适用于更加庞大和复杂的场景。

通过 KubeSphere 可以快速管理 Kubernetes 集群、部署应用、服务发现、CI/CD 流水线、集群扩容、微服务治理、日志查询和监控告警。换句话说，Kubernetes 是一个很棒的开源项目（或被认为是一个框架），但是 KubeSphere 是一款非常专业的企业级平台产品，专注于解决用户在复杂业务场景中的痛点，提供更友好更专业的用户体验。

## 为什么要使用**KubeSphere**？

KubeSphere 为企业用户提供高性能可伸缩的容器应用管理服务，旨在帮助企业完成新一代互联网技术驱动下的数字化转型，加速业务的快速迭代与交付，以满足企业日新月异的业务需求。

### 极简体验，向导式 UI

- 面向开发、测试、运维友好的用户界面，向导式用户体验，降低 Kubernetes 学习成本的设计理念
- 用户基于应用模板可以一键部署一个完整应用的所有服务，UI 提供全生命周期管理

### 业务高可靠与高可用

- **自动弹性伸缩**：部署 (Deployment) 支持根据访问量进行动态横向伸缩和容器资源的弹性扩缩容，保证集群和容器资源的高可用
- **提供健康检查**：支持为容器设置健康检查探针来检查容器的健康状态，确保业务的可靠性

### 容器化 DevOps 持续交付

- **简单易用的 DevOps**：基于 Jenkins 的可视化 CI/CD 流水线编辑，无需对 Jenkins 进行配置，同时内置丰富的 CI/CD 流水线模版
- **Source to Image (s2i)**：从已有的代码仓库中获取代码，并通过 s2i 自动构建镜像完成应用部署并自动推送至镜像仓库，无需编写 Dockerfile
- **端到端的流水线设置**：支持从仓库 (GitHub / SVN / Git)、代码编译、镜像制作、镜像安全、推送仓库、版本发布、到定时构建的端到端流水线设置
- **安全管理**：支持代码静态分析扫描以对 DevOps 工程中代码质量进行安全管理
- **日志**：日志完整记录 CI / CD 流水线运行全过程

### 开箱即用的微服务治理

- 灵活的微服务框架：基于 Istio 微服务框架提供可视化的微服务治理功能，将 Kubernetes 的服务进行更细粒度的拆分，支持无侵入的微服务治理
- 完善的治理功能：支持**灰度发布、熔断、流量监测、流量管控、限流、链路追踪、智能路由等完善的微服务治理功能**

### 灵活的持久化存储方案

- 支持 GlusterFS、CephRBD、NFS 等开源存储方案，支持有状态存储
- NeonSAN CSI 插件对接 QingStor NeonSAN，以更低时延、更加弹性、更高性能的存储，满足核心业务需求
- QingCloud CSI 插件对接 QingCloud 云平台各种性能的块存储服务

### 灵活的网络方案支持

- 支持 Calico、Flannel 等开源网络方案
- 分别开发了 QingCloud 云平台负载均衡器插件 和适用于物理机部署 Kubernetes 的 负载均衡器插件 Porter
- 商业验证的 SDN 能力：可通过 QingCloud CNI 插件对接 QingCloud SDN，获得更安全、更高性能的网络支持

### 多维度监控日志告警

- KubeSphere **全监控运维功能可通过可视化界面操作**，同时，开放标准接口对接企业运维系统，以统一运维入口实现集中化运维
- 可视化秒级监控：秒级频率、双重维度、十六项指标立体化监控；提供服务组件监控，快速定位组件故障
- 提供按节点、企业空间、项目等资源用量排行
- 支持基于多租户、多维度的监控指标告警，目前告警策略支持集群节点级别和工作负载级别等两个层级
- 提供多租户日志管理，在 KubeSphere 的日志查询系统中，不同的租户只能看到属于自己的日志信息

## 应用场景

KubeSphere适用于企业在数字化转型时所面临的敏捷开发与自动化运维、微服务应用架构与流量治理、自动弹性伸缩和业务高可用、DevOps 持续集成与交付等应用场景。

- **一步升级容器架构，助力业务数字化转型**
- **多维管控 Kubernetes，降低运维复杂度**
- **敏捷开发与自动化运维，推动企业 DevOps 落地**
- **灵活的微服务解决方案，一步升级云原生架构**
- **基于物理环境构建全栈容器架构，释放硬件最大效能**

# DevOps

## DevOps简介



> DevOps这个词，其实就是Development和Operations两个词的组合。它的英文发音是 /de'vɒps/，类似于“迪沃普斯”。
>
> DevOps **是一系列做法和工具**，可以使 IT 和软件开发团队之间的**流程实现自动化**。其中，随着敏捷软件开发日趋流行，**持续集成 (CI)** 和**持续交付 (CD)** 已经成为该领域一个理想的解决方案。在 CI/CD 工作流中，每次集成都通过自动化构建来验证，包括编码、发布和测试，从而帮助开发者提前发现集成错误，团队也可以快速、安全、可靠地将内部软件交付到生产环境。

![KubeSphere的DevOps流程](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202109302213567.png)

![DevOps流程](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202109302217855.jpeg)

在DevOps的流程下，运维人员会在项目开发期间就介入到开发过程中，了解开发人员使用的系统架构和技术路线，从而制定适当的运维方案。而开发人员也会在运维的初期参与到系统部署中，并提供系统部署的优化建议。

DevOps的实施，促进开发和运维人员的沟通，增进彼此的理（gan）解（qing）。

## 开发模式对比

对比的瀑布式开发和敏捷开发，我们可以明显看出，DevOps贯穿了软件全生命周期，而不仅限于开发阶段。

![开发模式对比](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202109302218214.jpeg)

## DevOps的价值

![DevOps的价值](https://typecho-1300745270.cos.ap-shanghai.myqcloud.com/typora/202109302220840.jpg)



# 参看

- [什么是云原生？这回终于有人讲明白了](https://zhuanlan.zhihu.com/p/150190166)
- [微服务、容器、云原生、Kubernetes、SOA、PaaS平台、Devops 之间的关系](https://zhuanlan.zhihu.com/p/74483850)
- [kubernetes官方文档](https://kubernetes.io/zh/)
- [从0开始的云原生实战入门系列课程-leifengyang](https://www.yuque.com/leifengyang/oncloud)
- [KubeSphere官方文档](https://kubesphere.com.cn/docs/introduction/what-is-kubesphere/)
- [Kubesphere 与 Rancher 有什么区别？](https://www.zhihu.com/question/348609092/answer/874540259)
- [KubeSphere简介，功能介绍，优势，架构说明及应用场景](https://blog.csdn.net/An1090239782/article/details/110038285)
- [DevOps到底是什么意思？](https://zhuanlan.zhihu.com/p/91371659) （本篇文章对比瀑布式、敏捷和DevOps开发，由浅入深进行各种实例论证介绍，文末也结合了微服务，很nice！）

