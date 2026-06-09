# 贡献指南

## 为开源项目创建技能

### 步骤 1：注册项目

在 `sources.yaml` 中添加条目：

```yaml
projects:
  some-tool:
    repo: https://github.com/org/some-tool.git
    ref: main              # 可选，默认 main
    sparse:                # 可选，只拉取指定目录
      - docs
      - src
    skill: pending         # pending / in-progress / done
    notes: 缺少 agent skill
```

### 步骤 2：同步源码

```bash
pnpm sync
```

脚本会根据 `sources.yaml` 自动添加 git submodule 到 `sources/`。支持稀疏检出。

### 步骤 3：分析项目

按优先级阅读：

1. **API/CLI 参考文档** — 核心能力和命令
2. **配置文件** — schema、选项、默认值
3. **示例代码** — 实际使用模式
4. **源码** — 文档未覆盖的行为和细节

重点关注：
- agent 的功能和实际使用模式
- 非显而易见的默认值和陷阱
- 工具特定的术语和概念

忽略：
- 面向用户的介绍和入门指南
- 安装指南
- LLM 训练数据中已有的通用知识
- 版本历史和变更日志

### 步骤 4：创建技能

```bash
mkdir -p skills/<skill-name>
```

使用 `templates/SKILL.md.template` 作为起点，遵循以下规范：

- `SKILL.md` 不超过 500 行
- 使用第三人称祈使语气
- 描述要具体且"主动"，便于触发
- 一个技能只解决一个关注点
- 密集参考材料放 `references/`（只嵌套一层）
- 不依赖特定 agent 的专有功能

### 步骤 5：验证

1. **触发验证**：想出 3 个应该触发和 3 个不应该触发的提示词，检查描述是否合理
2. **逻辑验证**：模拟执行流程，检查是否有需要猜测的步骤
3. **边界测试**：检查边缘情况和缺失的回退路径

## 安装技能

```bash
# 通过 pnpm dlx skills（推荐，兼容所有 agent）
pnpm dlx skills add <owner>/skills --skill <skill-name>

# 手动安装到特定 agent
cp -r skills/<skill-name> ~/.claude/skills/    # Claude Code
cp -r skills/<skill-name> ~/.cursor/skills/    # Cursor
```

## 目录结构约定

```
skills/<skill-name>/
  SKILL.md              # 必需：元数据 + 核心指令
  references/           # 可选：补充上下文（一层深度）
  scripts/              # 可选：可执行脚本
  assets/               # 可选：模板或静态文件
```

## 命名规范

- 技能名：kebab-case，1-64 字符，只用小写字母、数字、连字符
- 目录名必须与 `name` 字段一致
- 避免模糊名称（`helper`、`utils`、`tools`）
