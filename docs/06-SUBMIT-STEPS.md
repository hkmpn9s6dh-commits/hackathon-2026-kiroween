# 06 — 提交照抄单（Devpost）

> 给用户用。每一步写清「在哪、点哪个、填什么」。做完一步打一个勾。
> 官方截止：**北京 2026-12-05 06:00**（12-04 14:00 PT）。目标：**12-04 白天提交完**。

## 0. 交件前 60 秒自检

- [ ] 仓库公开：https://github.com/hkmpn9s6dh-commits/hackathon-2026-kiroween （不登录也能打开）
- [ ] 仓库首页 About 区能看到 **MIT license**
- [ ] 仓库根目录有 `.kiro/`（含 steering、specs、hooks）
- [ ] 线上能开：https://hkmpn9s6dh-commits.github.io/hackathon-2026-kiroween/
- [ ] 影片已上传 YouTube，**公开**，时长 ≤ 3 分钟
- [ ] 所有材料是英文

## 1. 报名 / 进入提交页

1. 打开 https://kiroween.devpost.com/
2. 登录 Devpost（用你提交 PayPal 那场的账号）。
3. 如果主按钮还是 **Join**，先点 Join 完成报名；变成 **Enter a submission** 就是报上了。
4. 点 **Enter a submission**。

## 2. 逐栏填写

| Devpost 字段 | 填什么 |
|---|---|
| **Project name** | `Necropolis` |
| **Tagline**（≤200 字符） | `Enter your GitHub handle. Necropolis builds a graveyard of your abandoned repositories, performs an autopsy on each, and gives you a revival plan — or a proper burial.` |
| **Category** | `Costume Contest` |
| **"Built with"** | `react`, `typescript`, `vite`, `canvas`, `github-api`, `kiro`, `github-pages` |
| **App URL** | `https://hkmpn9s6dh-commits.github.io/hackathon-2026-kiroween/` |
| **GitHub repo URL** | `https://github.com/hkmpn9s6dh-commits/hackathon-2026-kiroween` |
| **Video URL** | 你的 YouTube 链接（公开） |

## 3. 文字说明

把 `docs/05-SUBMISSION.md` 里这几段直接贴进对应框：

- **Inspiration** → `## Inspiration`
- **What it does** → `## What it does`
- **How we built it** → `## How we built it`
- **Challenges** → `## Challenges`
- **What we learned** → `## What we learned`
- **What's next** → `## What's next`

## 4. Kiro 使用说明（单独一栏）

把 `KIRO.md` 的正文贴进去（或贴这四段）：

1. 用的是 **Kiro CLI 3.2.1**（Windows 11，Builder ID 登录）。
2. **Spec-driven**：`.kiro/specs/necropolis/` 的 requirements（EARS）→ design → tasks；每次先让 Kiro 读 steering 与 spec，再点任务号。
3. **Steering**：product / tech / structure 三份常驻，约束了「无后端、无运行时 LLM、Canvas 2D、包体预算、字体自托管」。
4. **Hooks**：`PostFileSave` 与 `Stop` 都会跑 `scripts/verify-hook.cmd`；**Custom agent**：`.kiro/agents/reviewer.json`（只读评审），真跑过一轮并据此改了字号。

## 5. 可选加分（能做就做，各 2 分钟）

- **Social Blitz**：在 X / LinkedIn / IG / TikTok 发一条公开帖，**开头必须是** `#KiroweenHackathon26`，说一句你最喜欢 Kiro 的哪一点；把帖子链接填进表单。
- **Bonus Blog**：在任意第三方博客平台发一篇公开文章，文中写明「written as part of the Kiroween 2026 hackathon」；把链接填进表单。

> 两个 bonus 都不影响主评审，但 Social Blitz 有 5 个 3 个月 Pro+，Blog 有 100 个 2,000 credits。

## 6. 提交

1. 点 **Save draft**（可以先存草稿）。
2. 全部填完点 **Submit**。
3. 提交后页面顶部应显示 **Submitted to Kiroween 2026**；把这一屏截图发我一份。
4. 截止前还可以改：改完再点一次 Submit。

## 7. 提交后

- 评审 2026-12-16 ～ 2027-01-29；结果约 2027-02-03。
- 把评审反馈原文、作品链接、一条可复用的经验发我，我做回流。
