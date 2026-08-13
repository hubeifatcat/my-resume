"""每日备份任务：把 SQLite 数据卷备份到 /backups，保留最近 14 份。"""

import os
import sqlite3
import time
from pathlib import Path


BACKUP_DIR = Path(os.getenv("BACKUP_DIR", "/backups"))
SOURCE_DB = os.getenv("DATABASE_URL", "sqlite:////app/data/wuxing.db").replace("sqlite:///", "")
RETENTION_DAYS = int(os.getenv("BACKUP_RETENTION_DAYS", "14"))


def main():
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = time.strftime("%Y%m%d-%H%M%S")
    target = BACKUP_DIR / f"wuxing-{timestamp}.db"

    src = sqlite3.connect(SOURCE_DB)
    dst = sqlite3.connect(str(target))
    try:
        with dst:
            src.backup(dst)
    finally:
        dst.close()
        src.close()

    cutoff = time.time() - RETENTION_DAYS * 86400
    for item in BACKUP_DIR.glob("wuxing-*.db"):
        if item.stat().st_mtime < cutoff:
            item.unlink(missing_ok=True)

    print(f"BACKUP_OK {target}")


if __name__ == "__main__":
    main()
