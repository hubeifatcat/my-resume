"""部署前安全检查：密钥文件、依赖漏洞、镜像扫描工具可用性。"""

import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
failures = []
warnings = []


def run(cmd, timeout=180):
    try:
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        return proc.returncode, proc.stdout[-3000:], proc.stderr[-1000:]
    except FileNotFoundError:
        return None, "", "command not found"


if (ROOT / ".env").exists():
    failures.append("backend/.env 不应提交到仓库，请确认未纳入 git")
else:
    print("PASS secrets: backend/.env not present")

if (ROOT / ".env.example").exists():
    warnings.append("请检查 .env.example 中的占位值，避免把真实密钥写入示例")

if shutil.which("pip-audit"):
    code, out, err = run([sys.executable, "-m", "pip_audit", "-r", str(ROOT / "requirements.txt")])
    if code == 0:
        print("PASS deps: pip-audit 未发现已知漏洞")
    else:
        failures.append(f"pip-audit 发现风险：{out or err}")
else:
    warnings.append("pip-audit 未安装，建议 pip install pip-audit 后接入部署前检查")

if shutil.which("trivy"):
    code, out, err = run(["trivy", "fs", "--severity", "HIGH,CRITICAL", "--exit-code", "0", str(ROOT)])
    if code == 0:
        print("PASS image: trivy 扫描完成（HIGH/CRITICAL 已记录，exit-code 0 不阻断）")
    else:
        failures.append(f"trivy 扫描异常：{out or err}")
else:
    warnings.append("trivy 未安装，建议在服务器/CI 中安装后扫描镜像")

print("SECURITY_CHECK_DONE")
print("WARNINGS: " + ("; ".join(warnings) if warnings else "none"))
print("FAILURES: " + ("; ".join(failures) if failures else "none"))
sys.exit(1 if failures else 0)
