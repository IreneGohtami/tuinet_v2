import mssql from 'mssql'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import countries from 'i18n-iso-countries'
import en from 'i18n-iso-countries/langs/en.json'
import es from 'i18n-iso-countries/langs/es.json'

countries.registerLocale(en)
countries.registerLocale(es)

dotenv.config({ path: '.env.local' })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

const mssqlConfig = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  database: process.env.MSSQL_DATABASE || 'PolarTur_Net_TuiNet',
  server: process.env.MSSQL_HOST || 'localhost',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
}

const MAPPINGS = {
  settings_booking_statuses: {
    AtributoId: 'id',
    Valor: 'code',
    ValorInterno: 'name'
  },
  settings_countries: {
    PaisId: 'id',
    Nombre: 'name',
    IsoAlfa2: 'iso_alpha2',
    IsoAlfa3: 'iso_alpha3',
    IsoNum: 'iso_num',
    PrefijoTelefono: 'phone_prefix'
  }
}

const TABLE_MAP = {
  settings_booking_statuses: { mssql: 'dbo.Atributo', id_col: 'AtributoId' },
  settings_countries: { mssql: 'dbo.Pais', id_col: 'PaisId' }
}

async function upsertBatch(tableName: string, records: any[]) {
  const mapping = MAPPINGS[tableName as keyof typeof MAPPINGS]

  const dbRecords = records.map(record => {
    const dbRecord: any = {}
    Object.entries(mapping).forEach(([mssqlCol, dbCol]) => {
      let value = record[mssqlCol]
      if (value === undefined) return
      if (value === null || value === '-' || (typeof value === 'string' && value.trim() === '')) {
        dbRecord[dbCol] = null
      } else if (typeof value === 'string') {
        dbRecord[dbCol] = value.trim()
      } else {
        dbRecord[dbCol] = value
      }
    })

    // Special translation for countries
    if (tableName === 'settings_countries' && dbRecord.name && (dbRecord.iso_alpha2 || dbRecord.iso_alpha3)) {
      const isoCode = dbRecord.iso_alpha2 || dbRecord.iso_alpha3
      const englishName = countries.getName(isoCode, 'en')
      if (englishName) {
        dbRecord.name = englishName
      }
    }

    return dbRecord
  }).filter(r => Object.keys(r).length > 0)

  if (dbRecords.length === 0) return

  const { error } = await supabase.from(tableName).upsert(dbRecords, {
    onConflict: 'id'
  })

  if (error) {
    console.error(`[ERROR] Upserting into ${tableName}:`, error.message)
    throw error
  }
}

async function runMigration() {
  console.log('--- Starting MSSQL to Supabase Settings Migration ---')
  try {
    const pool = await mssql.connect(mssqlConfig)

    /*console.log('[REFERENCE] Migrating Booking Statuses...')
    const statusResult = await pool.request().query(`SELECT * FROM ${TABLE_MAP.settings_booking_statuses.mssql} WHERE Codigo = 'EstadoReserva'`)

    if (statusResult.recordset.length > 0) {
      await upsertBatch('settings_booking_statuses', statusResult.recordset)
      console.log(`[SUCCESS] Upserted ${statusResult.recordset.length} booking statuses`)
    }*/

    console.log('[REFERENCE] Migrating Countries...')
    const countryResult = await pool.request().query(`SELECT * FROM ${TABLE_MAP.settings_countries.mssql}`)

    if (countryResult.recordset.length > 0) {
      await upsertBatch('settings_countries', countryResult.recordset)
      console.log(`[SUCCESS] Upserted ${countryResult.recordset.length} countries`)
    }

    await pool.close()
    console.log('--- Settings Migration Completed Successfully ---')
  } catch (error: any) {
    console.error('[FATAL] Migration error:', error.message)
    process.exit(1)
  }
}

runMigration()
