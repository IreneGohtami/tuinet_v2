-- Function to get grouped booking flights with MAX(pvp_per_pax) and concatenated airline_contract_id
CREATE OR REPLACE FUNCTION get_grouped_booking_flights(booking_id_param INTEGER)
RETURNS TABLE (
  id INTEGER,
  booking_id INTEGER,
  issued_date TIMESTAMPTZ,
  airline_contract_id INTEGER,
  air_service_id INTEGER,
  service_type_id INTEGER,
  item_status_id INTEGER,
  destination_id INTEGER,
  pvp_per_pax NUMERIC(20, 4),
  cost_per_pax NUMERIC(20, 4),
  price_with_taxes NUMERIC(20, 4),
  cost_currency_id INTEGER,
  cost_currency_exchange_rate NUMERIC(18, 5),
  settlement_currency_id INTEGER,
  settlement_currency_exchange_rate NUMERIC(18, 5),
  supplier_id INTEGER,
  cabin_class TEXT,
  pnr_code TEXT,
  departure_terminal TEXT,
  arrival_terminal TEXT,
  adult_count INTEGER,
  child_count INTEGER,
  infant_count INTEGER,
  adult_baggage TEXT,
  child_baggage TEXT,
  infant_baggage TEXT,
  description TEXT,
  is_waitlisted BOOLEAN,
  airline_contract_ids TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH grouped_flights AS (
    SELECT
      bf.*,
      ROW_NUMBER() OVER (
        PARTITION BY bf.booking_id, bf.service_type_id
        ORDER BY bf.pvp_per_pax DESC NULLS LAST
      ) AS rn
    FROM booking_flights bf
    WHERE bf.booking_id = booking_id_param
  ),
  contract_ids AS (
    SELECT
      bf.service_type_id,
      STRING_AGG(bf.airline_contract_id::TEXT, ',' ORDER BY bf.airline_contract_id) AS airline_contract_ids
    FROM booking_flights bf
    WHERE bf.booking_id = booking_id_param
    GROUP BY bf.service_type_id
  )
  SELECT
    gf.id,
    gf.booking_id,
    gf.issued_date,
    gf.airline_contract_id,
    gf.air_service_id,
    gf.service_type_id,
    gf.item_status_id,
    gf.destination_id,
    gf.pvp_per_pax,
    gf.cost_per_pax,
    gf.price_with_taxes,
    gf.cost_currency_id,
    gf.cost_currency_exchange_rate,
    gf.settlement_currency_id,
    gf.settlement_currency_exchange_rate,
    gf.supplier_id,
    gf.cabin_class,
    gf.pnr_code,
    gf.departure_terminal,
    gf.arrival_terminal,
    gf.adult_count,
    gf.child_count,
    gf.infant_count,
    gf.adult_baggage,
    gf.child_baggage,
    gf.infant_baggage,
    gf.description,
    gf.is_waitlisted,
    ci.airline_contract_ids
  FROM grouped_flights gf
  JOIN contract_ids ci
    ON gf.service_type_id = ci.service_type_id
  WHERE gf.rn = 1;
END;
$$ LANGUAGE plpgsql;