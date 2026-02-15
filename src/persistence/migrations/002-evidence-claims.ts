import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('evidence_items')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('service_id', 'varchar(255)', (col) =>
      col.notNull().references('services.id')
    )
    .addColumn('evidence_type', 'varchar(100)', (col) =>
      col
        .notNull()
        .check(
          sql`evidence_type IN ('SBOM', 'VULNERABILITY_SCAN', 'MONITORING', 'TESTING', 'DEPLOYMENT', 'PROVENANCE', 'CONFIGURATION', 'OTHER')`
        )
    )
    .addColumn('source', 'varchar(500)', (col) => col.notNull())
    .addColumn('body', 'jsonb', (col) => col.notNull())
    .addColumn('tags', sql`TEXT[]`, (col) =>
      col.notNull().defaultTo(sql`'{}'::text[]`)
    )
    .addColumn('confidence', 'integer', (col) =>
      col.notNull().check(sql`confidence >= 0 AND confidence <= 100`)
    )
    .addColumn('ttl_hours', 'integer')
    .addColumn('collected_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`NOW()`)
    )
    .addColumn('expires_at', 'timestamp')
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`NOW()`)
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`NOW()`)
    )
    .execute();

  await db.schema
    .createIndex('idx_evidence_items_service')
    .ifNotExists()
    .on('evidence_items')
    .column('service_id')
    .execute();

  await db.schema
    .createIndex('idx_evidence_items_type')
    .ifNotExists()
    .on('evidence_items')
    .column('evidence_type')
    .execute();

  await db.schema
    .createIndex('idx_evidence_items_collected')
    .ifNotExists()
    .on('evidence_items')
    .column('collected_at')
    .execute();

  await db.schema
    .createIndex('idx_evidence_items_expires')
    .ifNotExists()
    .on('evidence_items')
    .column('expires_at')
    .execute();

  await sql`CREATE INDEX IF NOT EXISTS idx_evidence_items_tags ON evidence_items USING GIN (tags)`.execute(
    db
  );

  await db.schema
    .createTable('claims')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('service_id', 'varchar(255)', (col) =>
      col.notNull().references('services.id')
    )
    .addColumn('title', 'varchar(500)', (col) => col.notNull())
    .addColumn('section', 'varchar(100)', (col) => col.notNull())
    .addColumn('status', 'varchar(20)', (col) =>
      col
        .notNull()
        .defaultTo('UNKNOWN')
        .check(sql`status IN ('PASS', 'PARTIAL', 'FAIL', 'UNKNOWN')`)
    )
    .addColumn('confidence', 'integer', (col) =>
      col
        .notNull()
        .defaultTo(0)
        .check(sql`confidence >= 0 AND confidence <= 100`)
    )
    .addColumn('reason', 'text')
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`NOW()`)
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`NOW()`)
    )
    .execute();

  await db.schema
    .createIndex('idx_claims_service')
    .ifNotExists()
    .on('claims')
    .column('service_id')
    .execute();

  await db.schema
    .createIndex('idx_claims_section')
    .ifNotExists()
    .on('claims')
    .column('section')
    .execute();

  await db.schema
    .createIndex('idx_claims_status')
    .ifNotExists()
    .on('claims')
    .column('status')
    .execute();

  await db.schema
    .createTable('claim_evidence')
    .ifNotExists()
    .addColumn('claim_id', 'integer', (col) =>
      col.notNull().references('claims.id').onDelete('cascade')
    )
    .addColumn('evidence_id', 'integer', (col) =>
      col.notNull().references('evidence_items.id').onDelete('cascade')
    )
    .execute();

  await sql`ALTER TABLE claim_evidence ADD CONSTRAINT claim_evidence_pkey PRIMARY KEY (claim_id, evidence_id)`.execute(
    db
  );

  await db.schema
    .createIndex('idx_claim_evidence_evidence')
    .ifNotExists()
    .on('claim_evidence')
    .column('evidence_id')
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('claim_evidence').ifExists().execute();
  await db.schema.dropTable('claims').ifExists().execute();
  await db.schema.dropTable('evidence_items').ifExists().execute();
}
