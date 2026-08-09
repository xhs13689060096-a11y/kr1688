# PostgreSQL backup and restore runbook

This is a Phase 3A operator contract. It does not schedule backups or connect to
production infrastructure.

## Backup policy

- Run a PostgreSQL logical backup every day and retain each backup for 30 days.
- Record the backup timestamp, checksum, database version, and restoration operator.
- Maintain a separate media inventory for R2 objects; database backups do not contain media.
- Store backup artifacts and the media inventory separately from the primary environment.

## Monthly empty-environment restore drill

1. Create an empty, non-production PostgreSQL database.
2. Restore one retained backup using a least-privilege restoration account.
3. Verify the schema can initialize without applying unexpected migrations.
4. Compare restored metadata counts and representative records for `users`, `stories`,
   `chapters`, `comments`, and `media`.
5. Compare the media inventory to the restored media metadata; do not fetch production media.
6. Record the outcome, restore duration, checksum result, discrepancies, and remediation owner.

## Failure handling

Do not declare recovery-ready after a failed drill. Keep the failed artifact and logs, open a
remediation item, and repeat the empty-environment restore after the correction.
