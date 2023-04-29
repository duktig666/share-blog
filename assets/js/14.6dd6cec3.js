(window.webpackJsonp=window.webpackJsonp||[]).push([[14],{443:function(s,n,t){"use strict";t.r(n);var a=t(3),e=Object(a.a)({},(function(){var s=this,n=s._self._c;return n("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[n("h2",{attrs:{id:"以太坊上的-dapp-跟普通的应用程序的区别"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#以太坊上的-dapp-跟普通的应用程序的区别"}},[s._v("#")]),s._v(" 以太坊上的 DApp 跟普通的应用程序的区别")]),s._v(" "),n("ol",[n("li",[n("p",[s._v("在你把智能协议传上以太坊之后，它就变得 "),n("strong",[s._v("不可更改")]),s._v(", 这种永固性意味着你的代码永远不能被调整或更新。")]),s._v(" "),n("p",[s._v("如果你的智能协议有任何漏洞，即使你发现了也无法补救。你只能让你的用户们放弃这个智能协议，然后转移到一个新的修复后的合约上。")])]),s._v(" "),n("li",[n("p",[s._v("在 Solidity 中，你的用户想要每次执行你的 DApp 都需要支付一定的 "),n("strong",[s._v("gas")]),s._v("，gas 可以用以太币购买，因此，用户每次跑 DApp 都得花费以太币。")]),s._v(" "),n("p",[s._v("一个 DApp 收取多少 gas 取决于功能逻辑的复杂程度。每个操作背后，都在计算完成这个操作所需要的计算资源，（比如，存储数据就比做个加法运算贵得多）， 一次操作所需要花费的 *"),n("strong",[s._v("gas*")]),s._v(" 等于这个操作背后的所有运算花销的总和。")])])]),s._v(" "),n("h2",{attrs:{id:"为什么要用-gas-来驱动"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#为什么要用-gas-来驱动"}},[s._v("#")]),s._v(" 为什么要用 *"),n("strong",[s._v("gas*")]),s._v(" 来驱动？")]),s._v(" "),n("p",[s._v("以太坊就像一个巨大、缓慢、但非常安全的电脑。当你运行一个程序的时候，网络上的每一个节点都在进行相同的运算，以验证它的输出 —— 这就是所谓的“去中心化” 由于数以千计的节点同时在验证着每个功能的运行，这可以确保它的数据不会被被监控，或者被刻意修改。")]),s._v(" "),n("p",[s._v("可能会有用户用无限循环堵塞网络，抑或用密集运算来占用大量的网络资源，为了防止这种事情的发生，以太坊的创建者为以太坊上的资源制定了价格，想要在以太坊上运算或者存储，你需要先付费。")]),s._v(" "),n("blockquote",[n("p",[s._v("注意：如果你使用侧链，倒是不一定需要付费，比如咱们在 Loom Network 上构建的 CryptoZombies 就免费。你不会想要在以太坊主网上玩儿“魔兽世界”吧？ - 所需要的 gas 可能会买到你破产。但是你可以找个算法理念不同的侧链来玩它。我们将在以后的课程中咱们会讨论到，什么样的 DApp 应该部署在太坊主链上，什么又最好放在侧链。")])]),s._v(" "),n("h2",{attrs:{id:"函数修饰符"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#函数修饰符"}},[s._v("#")]),s._v(" 函数修饰符")]),s._v(" "),n("ol",[n("li",[s._v("我们有决定函数何时和被谁调用的可见性修饰符: "),n("code",[s._v("private")]),s._v(" 意味着它只能被合约内部调用； "),n("code",[s._v("internal")]),s._v(" 就像 "),n("code",[s._v("private")]),s._v(" 但是也能被继承的合约调用； "),n("code",[s._v("external")]),s._v(" 只能从合约外部调用；最后 "),n("code",[s._v("public")]),s._v(" 可以在任何地方调用，不管是内部还是外部。")]),s._v(" "),n("li",[s._v("我们也有状态修饰符， 告诉我们函数如何和区块链交互: "),n("code",[s._v("view")]),s._v(" 告诉我们运行这个函数不会更改和保存任何数据； "),n("code",[s._v("pure")]),s._v(" 告诉我们这个函数不但不会往区块链写数据，它甚至不从区块链读取数据。这两种在被从合约外部调用的时候都不花费任何gas（但是它们在被内部其他函数调用的时候将会耗费gas）。")]),s._v(" "),n("li",[s._v("然后我们有了自定义的 "),n("code",[s._v("modifiers")]),s._v("。")]),s._v(" "),n("li",[s._v("修饰符 "),n("code",[s._v("payable")]),s._v("，它们是一种可以接收以太的特殊函数。")])]),s._v(" "),n("h2",{attrs:{id:"solidity优化"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#solidity优化"}},[s._v("#")]),s._v(" Solidity优化")]),s._v(" "),n("p",[s._v("当 "),n("code",[s._v("uint")]),s._v(" 定义在一个 "),n("code",[s._v("struct")]),s._v(" 中的时候，尽量使用最小的整数子类型以节约空间。 并且把同样类型的变量放一起（即在 struct 中将把变量按照类型依次放置），这样 Solidity 可以将存储空间最小化。")]),s._v(" "),n("p",[n("strong",[s._v("利用 'View' 函数节省 Gas。当从外部调用一个"),n("code",[s._v("view")]),s._v("函数，是不需要支付一分 gas 的")]),s._v("。这是因为 "),n("code",[s._v("view")]),s._v(" 函数不会真正改变区块链上的任何数据 - 它们只是读取。因此用 "),n("code",[s._v("view")]),s._v(" 标记一个函数，意味着告诉 "),n("code",[s._v("web3.js")]),s._v("，运行这个函数只需要查询你的本地以太坊节点，而不需要在区块链上创建一个事务（事务需要运行在每个节点上，因此花费 gas）。")]),s._v(" "),n("p",[s._v("Solidity 使用"),n("code",[s._v("storage")]),s._v("(存储)是相当昂贵的，”写入“操作尤其贵。")]),s._v(" "),n("p",[s._v("**采用“函数”，以便于 DApp 的关键部分可以以参数形式修改。为了降低成本，不到万不得已，避免将数据写入存储。**这也会导致效率低下的编程逻辑 - 比如每次调用一个函数，都需要在 "),n("code",[s._v("memory")]),s._v("(内存) 中重建一个数组，而不是简单地将上次计算的数组给存储下来以便快速查找。")]),s._v(" "),n("blockquote",[n("p",[s._v("这是因为，无论是写入还是更改一段数据， 这都将永久性地写入区块链。”永久性“啊！需要在全球数千个节点的硬盘上存入这些数据，随着区块链的增长，拷贝份数更多，存储量也就越大。这是需要成本的！")]),s._v(" "),n("p",[s._v("在大多数编程语言中，遍历大数据集合都是昂贵的。但是在 Solidity 中，使用一个标记了"),n("code",[s._v("external view")]),s._v("的函数，遍历比 "),n("code",[s._v("storage")]),s._v(" 要便宜太多，因为 "),n("code",[s._v("view")]),s._v(" 函数不会产生任何花销。 （gas可是真金白银啊！）。")])]),s._v(" "),n("div",{staticClass:"language-js line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-js"}},[n("code",[n("span",{pre:!0,attrs:{class:"token comment"}},[s._v('/**\n * @title Ownable\n * @dev The Ownable contract has an owner address, and provides basic authorization control\n * functions, this simplifies the implementation of "user permissions".\n */')]),s._v("\ncontract Ownable "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n  address "),n("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("public")]),s._v(" owner"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n\n  event "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("OwnershipTransferred")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("address indexed previousOwner"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v(" address indexed newOwner"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n\n  "),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("/**\n   * @dev The Ownable constructor sets the original `owner` of the contract to the sender\n   * account.\n   */")]),s._v("\n  "),n("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("function")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("Ownable")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("public")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n    owner "),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" msg"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("sender"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n  "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n\n\n  "),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("/**\n   * @dev Throws if called by any account other than the owner.\n   */")]),s._v("\n  modifier "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("onlyOwner")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n    "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("require")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("msg"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("sender "),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v("==")]),s._v(" owner"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n    _"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n  "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n\n\n  "),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("/**\n   * @dev Allows the current owner to transfer control of the contract to a newOwner.\n   * @param newOwner The address to transfer ownership to.\n   */")]),s._v("\n  "),n("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("function")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("transferOwnership")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),n("span",{pre:!0,attrs:{class:"token parameter"}},[s._v("address newOwner")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("public")]),s._v(" onlyOwner "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("\n    "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("require")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("newOwner "),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v("!=")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("address")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n    "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("OwnershipTransferred")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("owner"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v(" newOwner"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n    owner "),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v(" newOwner"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n  "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n\n"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v("\n\n")])]),s._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[s._v("1")]),n("br"),n("span",{staticClass:"line-number"},[s._v("2")]),n("br"),n("span",{staticClass:"line-number"},[s._v("3")]),n("br"),n("span",{staticClass:"line-number"},[s._v("4")]),n("br"),n("span",{staticClass:"line-number"},[s._v("5")]),n("br"),n("span",{staticClass:"line-number"},[s._v("6")]),n("br"),n("span",{staticClass:"line-number"},[s._v("7")]),n("br"),n("span",{staticClass:"line-number"},[s._v("8")]),n("br"),n("span",{staticClass:"line-number"},[s._v("9")]),n("br"),n("span",{staticClass:"line-number"},[s._v("10")]),n("br"),n("span",{staticClass:"line-number"},[s._v("11")]),n("br"),n("span",{staticClass:"line-number"},[s._v("12")]),n("br"),n("span",{staticClass:"line-number"},[s._v("13")]),n("br"),n("span",{staticClass:"line-number"},[s._v("14")]),n("br"),n("span",{staticClass:"line-number"},[s._v("15")]),n("br"),n("span",{staticClass:"line-number"},[s._v("16")]),n("br"),n("span",{staticClass:"line-number"},[s._v("17")]),n("br"),n("span",{staticClass:"line-number"},[s._v("18")]),n("br"),n("span",{staticClass:"line-number"},[s._v("19")]),n("br"),n("span",{staticClass:"line-number"},[s._v("20")]),n("br"),n("span",{staticClass:"line-number"},[s._v("21")]),n("br"),n("span",{staticClass:"line-number"},[s._v("22")]),n("br"),n("span",{staticClass:"line-number"},[s._v("23")]),n("br"),n("span",{staticClass:"line-number"},[s._v("24")]),n("br"),n("span",{staticClass:"line-number"},[s._v("25")]),n("br"),n("span",{staticClass:"line-number"},[s._v("26")]),n("br"),n("span",{staticClass:"line-number"},[s._v("27")]),n("br"),n("span",{staticClass:"line-number"},[s._v("28")]),n("br"),n("span",{staticClass:"line-number"},[s._v("29")]),n("br"),n("span",{staticClass:"line-number"},[s._v("30")]),n("br"),n("span",{staticClass:"line-number"},[s._v("31")]),n("br"),n("span",{staticClass:"line-number"},[s._v("32")]),n("br"),n("span",{staticClass:"line-number"},[s._v("33")]),n("br"),n("span",{staticClass:"line-number"},[s._v("34")]),n("br"),n("span",{staticClass:"line-number"},[s._v("35")]),n("br"),n("span",{staticClass:"line-number"},[s._v("36")]),n("br"),n("span",{staticClass:"line-number"},[s._v("37")]),n("br"),n("span",{staticClass:"line-number"},[s._v("38")]),n("br"),n("span",{staticClass:"line-number"},[s._v("39")]),n("br"),n("span",{staticClass:"line-number"},[s._v("40")]),n("br")])]),n("p",[s._v("执行到 "),n("code",[s._v("onlyOwner")]),s._v(" 中的 "),n("code",[s._v("_;")]),s._v(" 语句时，程序再返回并执行。")])])}),[],!1,null,null,null);n.default=e.exports}}]);