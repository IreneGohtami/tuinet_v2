import mssql from 'mssql'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import countries from 'i18n-iso-countries'
//import en from 'i18n-iso-countries/langs/en.json'
//import es from 'i18n-iso-countries/langs/es.json'

//countries.registerLocale(en)
//countries.registerLocale(es)

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
  setting_booking_statuses: {
    AtributoId: 'id',
    Valor: 'code',
    ValorInterno: 'name'
  },
  setting_countries: {
    PaisId: 'id',
    Nombre: 'name',
    IsoAlfa2: 'iso_alpha2',
    IsoAlfa3: 'iso_alpha3',
    IsoNum: 'iso_num',
    PrefijoTelefono: 'phone_prefix'
  },
  inventory_suppliers: {
    ProveedorId: 'id',
    CIF: 'cif',
    CodigoProveedor: 'provider_code',
    Activo: 'is_active'
  }
}

const TABLE_MAP = {
  setting_booking_statuses: { mssql: 'dbo.Atributo', id_col: 'AtributoId' },
  setting_countries: { mssql: 'dbo.Pais', id_col: 'PaisId' },
  inventory_suppliers: { mssql: 'dbo.Proveedor', id_col: 'ProveedorId' }
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
    if (tableName === 'setting_countries' && dbRecord.name && (dbRecord.iso_alpha2 || dbRecord.iso_alpha3)) {
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
    const statusResult = await pool.request().query(`SELECT * FROM ${TABLE_MAP.setting_booking_statuses.mssql} WHERE Codigo = 'EstadoReserva'`)

    if (statusResult.recordset.length > 0) {
      await upsertBatch('setting_booking_statuses', statusResult.recordset)
      console.log(`[SUCCESS] Upserted ${statusResult.recordset.length} booking statuses`)
    }

    console.log('[REFERENCE] Migrating Countries...')
    const countryResult = await pool.request().query(`SELECT * FROM ${TABLE_MAP.setting_countries.mssql}`)

    if (countryResult.recordset.length > 0) {
      await upsertBatch('setting_countries', countryResult.recordset)
      console.log(`[SUCCESS] Upserted ${countryResult.recordset.length} countries`)
    }*/

    console.log('[INVENTORY] Migrating Suppliers...')
    // Join Proveedor (entity) with ProveedorProveedor (codes) — take the first active code per supplier
    const supplierResult = await pool.request().query(`
      SELECT
        p.ProveedorId,
        p.CIF,
        COALESCE(p.NombreFiscal COLLATE DATABASE_DEFAULT, pp.CodigoProveedor COLLATE DATABASE_DEFAULT) AS CodigoProveedor,
        CAST(COALESCE(pp.Activo, 1) AS BIT) AS Activo
      FROM dbo.Proveedor p
      LEFT JOIN (
        SELECT IdProveedorMapeado, CodigoProveedor, Activo,
               ROW_NUMBER() OVER (PARTITION BY IdProveedorMapeado ORDER BY Activo DESC, ProveedorProveedorId ASC) AS rn
        FROM dbo.ProveedorProveedor
      ) pp ON pp.IdProveedorMapeado = p.ProveedorId AND pp.rn = 1
      WHERE /*p.Activo = 1 AND*/ pp.Activo = 1
    `)

    if (supplierResult.recordset.length > 0) {
      await upsertBatch('inventory_suppliers', supplierResult.recordset)
      console.log(`[SUCCESS] Upserted ${supplierResult.recordset.length} suppliers`)
    }

    await pool.close()
    console.log('--- Settings Migration Completed Successfully ---')
  } catch (error: any) {
    console.error('[FATAL] Migration error:', error.message)
    process.exit(1)
  }
}

runMigration()
