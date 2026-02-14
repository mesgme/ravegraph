import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('readiness_scores')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('service_id', 'varchar(255)', (col) => col.notNull())
    .addColumn('service_name', 'varchar(255)', (col) => col.notNull())
    .addColumn('score', sql`DECIMAL(5,2)`, (col) =>
      col.notNull().check(sql`score >= 0 AND score <= 100`)
    )
    .addColumn('section_scores', 'jsonb')
    .addColumn('recorded_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`NOW()`)
    )
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`NOW()`)
    )
    .execute();

  await db.schema
    .createIndex('idx_readiness_scores_service')
    .ifNotExists()
    .on('readiness_scores')
    .column('service_id')
    .execute();

  await db.schema
    .createIndex('idx_readiness_scores_recorded')
    .ifNotExists()
    .on('readiness_scores')
    .column('recorded_at')
    .execute();

  await db.schema
    .createTable('controls')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('control_type', 'varchar(50)', (col) =>
      col
        .notNull()
        .check(sql`control_type IN ('PREVENT', 'DETECT', 'RESPOND', 'LEARN')`)
    )
    .addColumn('title', 'varchar(500)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('incident_id', 'integer')
    .addColumn('service_id', 'varchar(255)')
    .addColumn('priority', 'varchar(20)', (col) =>
      col.check(sql`priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')`)
    )
    .addColumn('status', 'varchar(20)', (col) =>
      col
        .defaultTo('PROPOSED')
        .check(
          sql`status IN ('PROPOSED', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED')`
        )
    )
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`NOW()`)
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`NOW()`)
    )
    .execute();

  await db.schema
    .createIndex('idx_controls_service')
    .ifNotExists()
    .on('controls')
    .column('service_id')
    .execute();

  await db.schema
    .createIndex('idx_controls_status')
    .ifNotExists()
    .on('controls')
    .column('status')
    .execute();

  await db.schema
    .createIndex('idx_controls_priority')
    .ifNotExists()
    .on('controls')
    .column('priority')
    .execute();

  await db.schema
    .createTable('work_items')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('external_id', 'varchar(255)')
    .addColumn('external_system', 'varchar(50)', (col) =>
      col.check(sql`external_system IN ('GITHUB', 'JIRA', 'LINEAR')`)
    )
    .addColumn('title', 'varchar(500)', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('work_type', 'varchar(50)', (col) =>
      col.check(
        sql`work_type IN ('REMEDIATION', 'INVESTIGATION', 'DOCUMENTATION', 'MODEL_UPDATE')`
      )
    )
    .addColumn('control_id', 'integer', (col) => col.references('controls.id'))
    .addColumn('incident_id', 'integer')
    .addColumn('service_id', 'varchar(255)')
    .addColumn('status', 'varchar(20)', (col) =>
      col
        .defaultTo('OPEN')
        .check(sql`status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CLOSED')`)
    )
    .addColumn('assigned_to', 'varchar(255)')
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`NOW()`)
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`NOW()`)
    )
    .execute();

  await db.schema
    .createIndex('idx_work_items_service')
    .ifNotExists()
    .on('work_items')
    .column('service_id')
    .execute();

  await db.schema
    .createIndex('idx_work_items_status')
    .ifNotExists()
    .on('work_items')
    .column('status')
    .execute();

  await db.schema
    .createIndex('idx_work_items_control')
    .ifNotExists()
    .on('work_items')
    .column('control_id')
    .execute();

  await db.schema
    .createTable('incidents')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('title', 'varchar(500)', (col) => col.notNull())
    .addColumn('severity', 'varchar(20)', (col) =>
      col.check(sql`severity IN ('SEV1', 'SEV2', 'SEV3', 'SEV4')`)
    )
    .addColumn('service_id', 'varchar(255)')
    .addColumn('started_at', 'timestamp', (col) => col.notNull())
    .addColumn('resolved_at', 'timestamp')
    .addColumn('impact', 'text')
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`NOW()`)
    )
    .execute();

  await db.schema
    .createIndex('idx_incidents_service')
    .ifNotExists()
    .on('incidents')
    .column('service_id')
    .execute();

  await db.schema
    .createIndex('idx_incidents_started')
    .ifNotExists()
    .on('incidents')
    .column('started_at')
    .execute();

  await db.schema
    .createTable('services')
    .ifNotExists()
    .addColumn('id', 'varchar(255)', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('tier', 'varchar(20)')
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`NOW()`)
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('work_items').ifExists().execute();
  await db.schema.dropTable('controls').ifExists().execute();
  await db.schema.dropTable('readiness_scores').ifExists().execute();
  await db.schema.dropTable('incidents').ifExists().execute();
  await db.schema.dropTable('services').ifExists().execute();
}
