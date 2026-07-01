# Content Planner

## Context Files

Read the followiing to get the full context of the project:

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

### Rules

1. **Skip project discovery** — Do not call `list_projects` to find the database. Use the IDs above.
2. **Always pass `branchId`** — For every Neon MCP call that accepts it (`run_sql`, `run_sql_transaction`, `prepare_database_migration`, `complete_database_migration`, `describe_branch`, `get_database_tables`, `describe_table_schema`, etc.), pass `branchId: "br-frosty-resonance-aq29cpbq"`.
3. **Production is off-limits by default** — Do not query, migrate, or modify the **production** branch (`br-green-scene-aqxo7cne`) unless I explicitly ask for production (e.g. "use production", "run on production branch").
4. **Confirm before destructive work** — Even on development, ask before `DROP`, `DELETE`, `TRUNCATE`, or broad `UPDATE` statements, and before Neon tools marked destructive (`delete_branch`, `reset_from_parent`, `delete_project`, etc.).
5. **Migrations** — Use `prepare_database_migration` / `complete_database_migration` against the **development** branch only, unless I explicitly request production.
6. **If IDs change** — If a Neon MCP call fails because the project or branch no longer exists, stop and tell me; do not silently switch to production or another project.
