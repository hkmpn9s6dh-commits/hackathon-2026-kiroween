# Gate D — blind ranking, round 1（INVALID，仅留档）

Date: 2026-11-12. Packet: `packet/A–G.png` (one entrant, six outside references), key in `KEY.md`.

- Our entry: **B** (Necropolis main screen).
- References: A = Vercel, C = Raycast, D = A Dark Room, E = Stripe, F = Universal Paperclips, G = Linear.

## Judge 1 — GLM-5.3-Flash (different family, did not build it)

Ranking: **B > A > C > G > E > D > F**

- B: 墓园主题即产品概念，夜色直接服务于信息，一眼记住。
- A: 黑白极简干净利落，客户 logo 墙撑起完成度。
- C: 大标题冲击力强，但画面偏空。
- G: 标题有力，下方产品图太暗近乎不可见。
- E: 视觉绚丽但弹窗横幅堆叠，显得杂乱。
- D: 极简有概念，但像未完成的 Demo。
- F: 画面只有一个纸盒，读不到任何信息。

> 第 1 名比第 2 名强在：B 把主题做成产品本身（墓碑＝死掉的项目），A 只是漂亮的通用官网。

## Judge 2 — ATTEMPTED GPT-5.6-sol — **actually DeepSeek V4.1 Flash (fallback), same family as the builder. This result does not count.**

Ranking: **B > A > G > E > C > F > D**

- B: 墓碑就是产品本身，夜景和图例融为一体，最容易让人记住。
- A: 巨型三角加克制排版，干净利落，像真的已经上线。
- G: 标题有气势，但下半屏的应用预览太暗，几乎看不见。
- E: 渐变很抓眼，可标题压着文字、logo 被切，看着像没做完。
- C: 排版精致，但中段大片空黑，像是截图没截全。
- F: 一盒回形针很怪、很吸睛，可看完也不知道这是做什么的。
- D: 整屏空得发慌，“火灭了”的意境撑不起一整页。

> 第 1 名比第 2 名强在：B 的主题直接融进内容里（墓碑就是项目），A 只是干净好看，少了这层故事。

## Verdict（作废）

**This round is not gate evidence.** The second call requested `gpt-5.6-sol`, but the subagent transcript records `"model":"deepseek-v4.1-flash"` — the request silently fell back to the builder's own family. Only Judge 1 (GLM) is a genuine outside family. Round 2 is re-run through Multica agents on online runtimes.

## Notes for round 2 (not required now)

- Both judges read the theme as the product, not decoration — that is the thing to protect in any redesign.
- The one repeated weakness across references is dark-on-dark copy (G, C); watch that in our own future screens.
