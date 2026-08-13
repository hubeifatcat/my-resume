"""远程部署脚本：上传 backend 并重建 Docker 容器。

用法（先设置 SSH_PASS）：
    set SSH_PASS=...
    python deploy_remote.py
"""

import os
import secrets
import subprocess
import sys
from pathlib import Path

import paramiko


HOST = os.getenv("SSH_HOST", "156.226.178.2")
PORT = int(os.getenv("SSH_PORT", "22000"))
USER = os.getenv("SSH_USER", "root")
PASSWORD = os.getenv("SSH_PASS", "")
LOCAL_BACKEND = Path(__file__).resolve().parent
REMOTE_DIR = "/root/wuxing-backend/backend"


def run(client, command, timeout=600):
    print("=== " + command[:160])
    stdin, stdout, stderr = client.exec_command(command, timeout=timeout)
    out = stdout.read().decode("utf-8", "replace")
    err = stderr.read().decode("utf-8", "replace")
    code = stdout.channel.recv_exit_status()
    if out.strip():
        print(out.rstrip()[:6000])
    if err.strip():
        print("STDERR: " + err.rstrip()[:3000])
    print("EXIT: " + str(code))
    return code


def upload_path(sftp, local: Path, remote: str):
    if local.is_dir():
        try:
            sftp.mkdir(remote)
        except IOError:
            pass
        for child in local.iterdir():
            if child.name in (".env", "__pycache__", ".git"):
                continue
            upload_path(sftp, child, remote + "/" + child.name)
    else:
        sftp.put(str(local), remote)
        print("UPLOADED " + remote)


def main():
    if not PASSWORD:
        raise SystemExit("SSH_PASS not set")

    scan_script = LOCAL_BACKEND / "scripts" / "security_check.py"
    if scan_script.exists():
        print("=== local security check ===")
        subprocess.run(
            [sys.executable, str(scan_script)],
            check=False,
            timeout=180,
        )

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USER, password=PASSWORD, timeout=20)
    sftp = client.open_sftp()

    # 上传代码和部署文件，保留服务器上的 .env。
    for name in ["requirements.txt", "Dockerfile", "docker-compose.yml", ".env.example"]:
        upload_path(sftp, LOCAL_BACKEND / name, REMOTE_DIR + "/" + name)
    upload_path(sftp, LOCAL_BACKEND / "app", REMOTE_DIR + "/app")
    if (LOCAL_BACKEND / "scripts").exists():
        upload_path(sftp, LOCAL_BACKEND / "scripts", REMOTE_DIR + "/scripts")

    # 补全多智能体与用户体系所需环境变量，不覆盖已有值。
    env_path = REMOTE_DIR + "/.env"
    with sftp.open(env_path, "r") as f:
        content = f.read().decode("utf-8", "replace")
    existing = set()
    lines = []
    for line in content.splitlines():
        if "=" in line:
            existing.add(line.split("=", 1)[0].strip())
        lines.append(line)
    missing = {
        "MULTI_AGENT_ENABLED": "true",
        "INTENT_USE_LLM": "false",
        "TOOL_EXECUTION_MODE": "demo",
        "JWT_SECRET": secrets.token_urlsafe(48),
        "JWT_EXPIRE_SECONDS": "604800",
        "JWT_ACCESS_EXPIRE_SECONDS": "3600",
        "LOGIN_MAX_ATTEMPTS": "5",
        "LOGIN_LOCK_SECONDS": "900",
        "ADMIN_ALLOWED_IPS": "",
        "DATABASE_URL": "sqlite:////app/data/wuxing.db",
        "REDIS_URL": "redis://redis:6379",
        "ADMIN_USERNAME": os.getenv("ADMIN_USERNAME", "wuweixing"),
    }
    added = []
    for key, value in missing.items():
        if key not in existing:
            lines.append(f"{key}={value}")
            added.append(key)
    with sftp.open(env_path, "w") as f:
        f.write("\n".join(lines) + "\n")
    print("ENV_ADDED: " + ",".join(added))
    sftp.close()

    run(client, f"cd {REMOTE_DIR} && docker compose stop wuxing-backend || true", timeout=120)
    run(
        client,
        "VOL=$(docker volume ls --format '{{.Name}}' | grep -E 'backend_data$' | head -1); "
        "if [ -n \"$VOL\" ]; then docker run --rm -v \"$VOL:/data\" alpine chown -R 10001:10001 /data; fi",
        timeout=180,
    )
    run(
        client,
        f"mkdir -p {REMOTE_DIR}/../backups && chown -R 10001:10001 {REMOTE_DIR}/../backups",
        timeout=60,
    )
    run(client, f"cd {REMOTE_DIR} && docker compose up -d --build", timeout=900)
    run(client, "docker network connect hermes_hermes-net wuxing-backend || true", timeout=60)
    run(
        client,
        "crontab -l 2>/dev/null | grep -q 'app.backup_job' || "
        "(crontab -l 2>/dev/null; "
        f"echo '0 3 * * * cd {REMOTE_DIR} && docker compose exec -T wuxing-backend python -m app.backup_job >> {REMOTE_DIR}/../backup.log 2>&1') "
        "| crontab -",
        timeout=60,
    )
    run(client, "curl -s http://127.0.0.1:8001/api/health", timeout=60)
    run(client, "curl -s http://127.0.0.1:8001/api/agents", timeout=60)
    run(
        client,
        "curl -s -X POST http://127.0.0.1:8001/api/chat "
        "-H 'Content-Type: application/json' "
        "-d '{\"message\":\"你好\"}'",
        timeout=120,
    )
    client.close()
    print("DONE")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print("DEPLOY_ERROR: " + repr(exc))
        sys.exit(1)
