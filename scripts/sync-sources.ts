import { execSync } from "node:child_process";
import { existsSync, readFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const METADATA = resolve(ROOT, "sources.yaml");
const SOURCES = resolve(ROOT, "sources");

interface Project {
  repo: string;
  ref?: string;
  sparse?: string[];
  skill?: string;
  notes?: string;
}

interface Metadata {
  projects?: Record<string, Project>;
}

function run(cmd: string, cwd?: string): string {
  try {
    return execSync(cmd, {
      cwd: cwd || ROOT,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch (e: any) {
    throw new Error(e.stderr?.trim() || e.message);
  }
}

function isSubmodule(name: string): boolean {
  try {
    const output = run(`git config --file .gitmodules --get submodule.sources/${name}.url`);
    return !!output;
  } catch {
    return false;
  }
}

function addSubmodule(name: string, project: Project): void {
  const ref = project.ref || "main";
  const target = `sources/${name}`;

  run(`git submodule add --branch ${ref} ${project.repo} ${target}`);

  if (project.sparse?.length) {
    const absTarget = resolve(ROOT, target);
    run("git sparse-checkout init --cone", absTarget);
    run(`git sparse-checkout set ${project.sparse.join(" ")}`, absTarget);
    console.log(`  ✓ 子模块添加完成（稀疏检出: ${project.sparse.join(", ")}）`);
  } else {
    console.log("  ✓ 子模块添加完成");
  }
}

function updateSubmodule(name: string, project: Project): void {
  const target = resolve(SOURCES, name);
  run(`git submodule update --remote --depth=1 sources/${name}`);

  if (project.sparse?.length) {
    run(`git sparse-checkout set ${project.sparse.join(" ")}`, target);
  }

  console.log("  ✓ 更新完成");
}

function main(): void {
  if (!existsSync(METADATA)) {
    console.error(`错误: 元数据文件不存在 — ${METADATA}`);
    process.exit(1);
  }

  const metadata = parse(readFileSync(METADATA, "utf-8")) as Metadata;
  const projects = metadata.projects;

  if (!projects || Object.keys(projects).length === 0) {
    console.log("元数据为空，没有项目需要同步。");
    return;
  }

  mkdirSync(SOURCES, { recursive: true });

  let synced = 0;
  let skipped = 0;
  let failed = 0;

  for (const [name, project] of Object.entries(projects)) {
    if (!project.repo) {
      console.log(`⚠ ${name}: 缺少 repo 字段，跳过`);
      skipped++;
      continue;
    }

    try {
      if (isSubmodule(name)) {
        console.log(`↻ ${name}: 子模块已存在，更新中...`);
        updateSubmodule(name, project);
      } else {
        console.log(`↓ ${name}: 添加子模块 ${project.repo} (ref: ${project.ref || "main"})...`);
        addSubmodule(name, project);
      }
      synced++;
    } catch (e: any) {
      console.log(`  ✗ 失败: ${e.message}`);
      failed++;
    }
  }

  console.log(`\n同步完成: ${synced} 成功, ${skipped} 跳过, ${failed} 失败`);
  if (failed > 0) process.exit(1);
}

main();
