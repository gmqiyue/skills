# Skills

我的个人 [Agent Skills](https://agentskills.io/home) 仓库，用于统一管理日常使用的 AI agent 技能。

除了自建的工具型技能外，当一些开源项目官方还没有提供对应的 agent skill 时，我会把它们以 git submodule 的方式添加到 `sources/` 目录，阅读源码和文档后为其编写技能。

## 安装

技能通过 [vercel-labs/skills](https://github.com/vercel-labs/skills) 提供的 CLI 安装，兼容 Claude Code、Cursor、Codex 等 80+ agent。

```bash
# 安装全部技能
pnpx skills add gmqiyue/skills --skill='*'

# 安装指定技能
pnpx skills add gmqiyue/skills --skill nameit

# 全局安装（对所有项目生效）
pnpx skills add gmqiyue/skills --skill='*' -g
```

更多用法参见 [skills CLI 文档](https://github.com/vercel-labs/skills)。

## 技能列表

### 自建技能

| 技能 | 说明 |
|------|------|
| [nameit](skills/nameit) | 项目命名生成器 — 根据上下文生成创意代号并创建项目目录 |
| [opensource-skill-creator](skills/opensource-skill-creator) | 从开源项目文档和源码生成 agent skill |

### 开源项目技能

基于 git submodule 引入的开源项目源码和文档生成。

| 技能 | 说明 | 上游项目 |
|------|------|----------|
| [vite](skills/vite) | Vite 配置、插件、SSR、Library Mode、性能优化 | [vitejs/vite](https://github.com/vitejs/vite) |

## 项目结构

```
skills/           技能目录（每个子目录即一个可安装的技能）
sources/          开源项目源码（git submodule，由 sync 脚本管理）
sources.yaml      源项目注册表
scripts/          工具脚本
templates/        新技能模板
```

## 添加新技能

### 为开源项目创建

1. 在 `sources.yaml` 中注册项目
2. 运行 `pnpm sync` 同步源码（自动添加 git submodule，支持稀疏检出）
3. 阅读 `sources/<project>/` 下的文档和源码，生成技能到 `skills/<name>/`

### 自建

```bash
mkdir skills/<skill-name>
# 以 templates/SKILL.md.template 为起点编写 SKILL.md
```

详细规范见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 致谢

项目架构参考了 [antfu/skills](https://github.com/antfu/skills)。

## License

[MIT](LICENSE)
