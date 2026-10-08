#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/81dc6d5841c627439138eb6d1d0f2a53989828181ad72668466212e5a7a76918/contract';
import endContract from '../../snapshots/81dc6d5841c627439138eb6d1d0f2a53989828181ad72668466212e5a7a76918/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/91e7f9f035806fa2789a4d726ef7724cad434fd6b00014d47ebf12d6e6bb784e/contract';
import startContract from '../../snapshots/91e7f9f035806fa2789a4d726ef7724cad434fd6b00014d47ebf12d6e6bb784e/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropTable({ schema: 'public', table: 'Post' }),
      this.dropTable({ schema: 'public', table: 'User' }),
      this.createTable({
        schema: 'public',
        table: 'commentary',
        columns: [
          col('actor', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('event_type', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('match_id', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('message', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('meta_data', 'json', { codecRef: { codecId: 'pg/json@1' } }),
          col('minute', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('period', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('sequence', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('tags', 'text[]', { notNull: true, codecRef: { codecId: 'pg/text@1', many: true } }),
          col('team', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'commentary_tags_elem_not_null_aecbe9e2',
            'array_position("tags", NULL) IS NULL',
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'matches',
        columns: [
          col('away_score', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('away_team', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('end_time', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('home_score', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('home_team', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('sport', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('start_time', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('scheduled'),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'matches_status_check_9466da7c',
            "\"status\" IN ('scheduled', 'live', 'finished')",
          ),
        ],
      }),
      this.createIndex({
        schema: 'public',
        table: 'commentary',
        index: 'commentary_match_id_idx_105a9a80',
        columns: ['match_id'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'commentary',
        foreignKey: {
          name: 'commentary_match_id_fkey',
          columns: ['match_id'],
          references: { schema: 'public', table: 'matches', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
