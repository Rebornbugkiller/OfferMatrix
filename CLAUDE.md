# Claude Code 项目规则

## 数据库操作注意事项

### MySQL 中文字符集
在使用 Docker 容器中的 MySQL 执行 SQL 语句时，必须添加 `--default-character-set=utf8mb4` 参数，否则中文会出现乱码。

**正确示例：**
```bash
docker exec offermatrix-mysql mysql -uroot -p密码 数据库名 --default-character-set=utf8mb4 -e "INSERT INTO table_name ..."
```

**错误示例（会导致中文乱码）：**
```bash
docker exec offermatrix-mysql mysql -uroot -p密码 数据库名 -e "INSERT INTO table_name ..."
```

此规则适用于所有涉及中文数据的 INSERT、UPDATE 操作。
