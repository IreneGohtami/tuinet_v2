-- Recreate Bookings Module with reordered column
-- Drop existing tables first (they are blank)
DROP TABLE IF EXISTS booking_pvp_details CASCADE;
DROP TABLE IF EXISTS booking_transfers CASCADE;
DROP TABLE IF EXISTS booking_tours CASCADE;
DROP TABLE IF EXISTS booking_other_services CASCADE;
DROP TABLE IF EXISTS booking_invoice_details CASCADE;
DROP TABLE IF EXISTS booking_invoices CASCADE;
DROP TABLE IF EXISTS booking_hotels CASCADE;
DROP TABLE IF EXISTS booking_flights CASCADE;
DROP TABLE IF EXISTS booking_passengers CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;

-- 1. Main Bookings Table
CREATE TABLE bookings (
    id INTEGER PRIMARY KEY, -- Maps from ReservaId
    booking_reference_id TEXT, -- Renamed from external_transaction_id and moved
    locator TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    first_service_date TIMESTAMPTZ,
    agency_id INTEGER,
    office_id INTEGER,
    agent_office_id INTEGER,
    status_id INTEGER,
    payment_type_id INTEGER,
    user_id UUID REFERENCES auth.users(id), -- Link to Supabase Auth
    brochure_id INTEGER,
    expiry_date TIMESTAMPTZ,
    commissionable_amount NUMERIC(20, 4),
    net_amount NUMERIC(20, 4),
    total_amount NUMERIC(20, 4),
    commission_percentage NUMERIC(5, 2),
    commission_amount NUMERIC(20, 4),
    commission_vat_percentage NUMERIC(5, 2),
    commission_vat_amount NUMERIC(20, 4),
    self_invoice_amount NUMERIC(20, 4),
    gross_amount NUMERIC(20, 4),
    cost NUMERIC(20, 4),
    margin_amount NUMERIC(20, 4),
    reference TEXT,
    deposit BOOLEAN,
    flag_in_use TEXT,
    proforma_id INTEGER,
    delegation_id INTEGER,
    direct_sale BOOLEAN,
    group_id INTEGER,
    currency_id INTEGER, -- Link to settings_currencies; TBD: might just store the currency code in future instead
    sale_percentage NUMERIC(20, 4),
    no_recalculate BOOLEAN,
    recoveries BOOLEAN,
    claim BOOLEAN,
    customer_total_amount NUMERIC(20, 4),
    confirmation_email TEXT,
    is_group BOOLEAN,
    group_name TEXT,
    documentation_status_id INTEGER,
    issue_deadline TIMESTAMPTZ,
    issue_deadline_amount NUMERIC(20, 4),
    issue_deadline_communicated BOOLEAN,
    no_rappel BOOLEAN,
    advance_payment_amount NUMERIC(20, 4),
    commission_lock BOOLEAN,
    currency_exchange_rate NUMERIC(10, 5),
    agency_fee NUMERIC(20, 4),
    tracking_user_id INTEGER,
    sales_channel_id INTEGER,
    is_test_booking BOOLEAN,
    budget_locator TEXT,
    end_customer_id INTEGER,
    is_manual_booking BOOLEAN,
    billing_type_id INTEGER,
    is_closed BOOLEAN,
    distribution_channel_id INTEGER,
    documenting_user_id INTEGER,
    payment_due_date DATE,
    sales_channel_value TEXT,
    entry_channel_id INTEGER,
    flag_in_use_user_id INTEGER,
    status_backup TEXT,
    admin_status_id INTEGER,
    admin_check BOOLEAN,
    manual_admin_status_id INTEGER,
    package_name TEXT,
    settlement_currency_type_id INTEGER,
    settlement_currency_rate NUMERIC(18, 5),
    system_accounting_cost NUMERIC(20, 4),
    exclude_mandatory_insurance BOOLEAN,
    region_code TEXT,
    country_code TEXT,
    language_code TEXT,
    associated_budget TEXT,
    toms NUMERIC(20, 4),
    invoice_tax_currency TEXT,
    invoice_tax_currency_rate NUMERIC(20, 10)
);

-- 2. Passengers
CREATE TABLE booking_passengers (
    id INTEGER PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    passenger_type_id INTEGER,
    document_number TEXT,
    document_type_id INTEGER,
    document_issue_date TIMESTAMPTZ,
    document_expiry_date TIMESTAMPTZ,
    nationality_country_id INTEGER,
    first_name TEXT,
    last_name1 TEXT,
    last_name2 TEXT,
    title_id INTEGER,
    birth_date TIMESTAMPTZ,
    document_country_id INTEGER,
    birth_place_id INTEGER,
    registered_in_sara BOOLEAN,
    codmun TEXT,
    coddto TEXT,
    restem TEXT,
    is_main_passenger BOOLEAN,
    codres TEXT,
    codfiscal TEXT,
    amadeus_first_name TEXT,
    amadeus_last_name TEXT,
    gender TEXT,
    phone TEXT,
    email TEXT
);

-- 3. Flights
CREATE TABLE booking_flights (
    id INTEGER PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    airline_contract_id INTEGER,
    air_service_type_id INTEGER,
    commissionable_cost_id INTEGER,
    item_status_id INTEGER,
    cost_currency_id INTEGER,
    adult_count INTEGER,
    child_count INTEGER,
    infant_count INTEGER,
    pvp_per_pax NUMERIC(20, 4),
    from_product BOOLEAN,
    quota_confirmation_text TEXT,
    provider_locator TEXT,
    cost_per_pax NUMERIC(20, 4),
    cost_exchange_rate NUMERIC(18, 5),
    gds_locator TEXT,
    account TEXT,
    provider_id INTEGER,
    destination_id INTEGER,
    description TEXT,
    service_type_id INTEGER,
    payer_provider_id INTEGER,
    departure_terminal TEXT,
    arrival_terminal TEXT,
    issue_deadline TIMESTAMPTZ,
    uapi_locator TEXT,
    airline_locator TEXT,
    terminal_locator TEXT,
    waiting_list INTEGER,
    settlement_currency_type_id INTEGER,
    settlement_currency_rate NUMERIC(18, 5),
    gst_price NUMERIC(20, 4),
    price_with_taxes NUMERIC(20, 4),
    fare_type_id INTEGER,
    invoice_import_request_id INTEGER,
    adult_baggage TEXT,
    child_baggage TEXT,
    infant_baggage TEXT,
    segment_status_code TEXT
);

-- 4. Hotels
CREATE TABLE booking_hotels (
    id INTEGER PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    hotel_contract_id INTEGER,
    check_in_date DATE,
    check_out_date DATE,
    adult_count INTEGER,
    child_count INTEGER,
    infant_count INTEGER,
    pvp_per_pax NUMERIC(20, 4),
    accommodation_feature_id INTEGER,
    board_basis_id INTEGER,
    room_count INTEGER,
    item_status_id INTEGER,
    from_product BOOLEAN,
    cost_currency_id INTEGER,
    legacy_hotel_booking_id INTEGER,
    use_quota BOOLEAN,
    quota_confirmation_text TEXT,
    cost_per_pax NUMERIC(20, 4),
    cost_exchange_rate NUMERIC(18, 5),
    on_voucher BOOLEAN,
    commissionable_cost_id INTEGER,
    provider_locator TEXT,
    account TEXT,
    provider_id INTEGER,
    destination_id INTEGER,
    description TEXT,
    service_type_id INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    payer_provider_id INTEGER,
    extra_nights INTEGER,
    source TEXT,
    category_id INTEGER,
    settlement_currency_type_id INTEGER,
    settlement_currency_rate NUMERIC(18, 5),
    additional_locator TEXT,
    fare_type_id INTEGER,
    invoice_import_request_id INTEGER
);

-- 5. Invoices
CREATE TABLE booking_invoices (
    id INTEGER PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    invoice_number TEXT,
    end_customer_data_id INTEGER,
    pdf_generated BOOLEAN,
    generated_invoice_type_id INTEGER,
    invoice_type_id INTEGER,
    sent BOOLEAN,
    show_vat BOOLEAN,
    invoice_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    accounting_sale BOOLEAN,
    accounting_purchase BOOLEAN,
    external_billing_id INTEGER,
    external_billing_status_id INTEGER,
    external_billing_error TEXT,
    external_invoice_number TEXT,
    external_reception_date TIMESTAMPTZ
);

-- 6. Invoice Details
CREATE TABLE booking_invoice_details (
    id INTEGER PRIMARY KEY,
    invoice_id INTEGER REFERENCES booking_invoices(id) ON DELETE CASCADE,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    tax_base NUMERIC(16, 2),
    vat NUMERIC(16, 2),
    concept TEXT,
    deposit_payment_id INTEGER,
    exempt_tax_rate TEXT,
    exempt_tax_amount NUMERIC(20, 4),
    exempt_tax_invoice NUMERIC(20, 4),
    zero_tax_rate TEXT,
    zero_tax_amount NUMERIC(20, 4),
    zero_tax_invoice NUMERIC(20, 4),
    na_tax_rate TEXT,
    na_tax_amount NUMERIC(20, 4),
    na_tax_invoice NUMERIC(20, 4),
    taxable_rate_5 TEXT,
    taxable_amount_5 NUMERIC(20, 4),
    taxable_invoice_5 NUMERIC(20, 4),
    taxable_base_5 NUMERIC(20, 4),
    taxable_rate_10 TEXT,
    taxable_amount_10 NUMERIC(20, 4),
    taxable_invoice_10 NUMERIC(20, 4),
    taxable_base_10 NUMERIC(20, 4)
);

-- 7. Other Services
CREATE TABLE booking_other_services (
    id INTEGER PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    service_date DATE,
    pvp_per_pax NUMERIC(20, 4),
    cost_per_pax NUMERIC(20, 4),
    commissionable_cost_id INTEGER,
    on_voucher BOOLEAN,
    cost_currency_id INTEGER,
    adult_count INTEGER,
    child_count INTEGER,
    infant_count INTEGER,
    from_product BOOLEAN,
    cost_exchange_rate NUMERIC(18, 5),
    item_status_id INTEGER,
    quota_confirmation_text TEXT,
    duration INTEGER,
    service_contract_id INTEGER,
    provider_locator TEXT,
    account TEXT,
    provider_id INTEGER,
    destination_id INTEGER,
    description TEXT,
    service_type_id INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    payer_provider_id INTEGER,
    service_id INTEGER,
    service_type_feature_id INTEGER,
    settlement_currency_type_id INTEGER,
    settlement_currency_rate NUMERIC(18, 5),
    is_visible BOOLEAN,
    fare_type_id INTEGER,
    invoice_import_request_id INTEGER
);

-- 8. Tours
CREATE TABLE booking_tours (
    id INTEGER PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    item_status_id INTEGER,
    cost_currency_id INTEGER,
    tour_date TIMESTAMPTZ,
    pvp_per_pax NUMERIC(20, 4),
    cost_per_pax NUMERIC(20, 4),
    commissionable_cost_id INTEGER,
    adult_count INTEGER,
    child_count INTEGER,
    infant_count INTEGER,
    from_product BOOLEAN,
    cost_exchange_rate NUMERIC(18, 5),
    duration INTEGER,
    service_contract_id INTEGER,
    provider_locator TEXT,
    provider_id INTEGER,
    description TEXT,
    destination_id INTEGER,
    token TEXT,
    service_type_id INTEGER,
    price_info TEXT,
    payer_name TEXT,
    payer_vat TEXT,
    child_ages TEXT,
    wholesaler_locator TEXT,
    product_type_info TEXT,
    customer_comments TEXT,
    customer_language_id INTEGER,
    ticket_title TEXT,
    ticket_modality TEXT,
    ticket_file TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    payer_provider_id INTEGER,
    quota_confirmation_text TEXT,
    on_voucher BOOLEAN,
    display_order INTEGER,
    service_type_feature_id INTEGER,
    pickup_location TEXT,
    settlement_currency_type_id INTEGER,
    settlement_currency_rate NUMERIC(18, 5),
    is_visible BOOLEAN,
    pickup_time TEXT,
    fare_type_id INTEGER,
    invoice_import_request_id INTEGER
);

-- 9. Transfers
CREATE TABLE booking_transfers (
    id INTEGER PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    item_status_id INTEGER,
    cost_currency_id INTEGER,
    transfer_date TIMESTAMPTZ,
    pvp_per_pax NUMERIC(20, 4),
    cost_per_pax NUMERIC(20, 4),
    commissionable_cost_id INTEGER,
    adult_count INTEGER,
    child_count INTEGER,
    infant_count INTEGER,
    from_product BOOLEAN,
    cost_exchange_rate NUMERIC(18, 5),
    duration INTEGER,
    service_contract_id INTEGER,
    provider_locator TEXT,
    wholesaler_locator TEXT,
    provider_id INTEGER,
    description TEXT,
    destination_id INTEGER,
    token TEXT,
    service_type_id INTEGER,
    payer_name TEXT,
    payer_vat TEXT,
    child_ages TEXT,
    created_by TEXT,
    customer_comments TEXT,
    rental_company TEXT,
    pickup_location TEXT,
    pickup_location_detail TEXT,
    pickup_phone TEXT,
    pickup_fax TEXT,
    return_location TEXT,
    return_location_detail TEXT,
    return_phone TEXT,
    return_fax TEXT,
    flight_number TEXT,
    min_age INTEGER,
    max_age INTEGER,
    arrival_flight TEXT,
    arrival_time TIMESTAMPTZ,
    included_services TEXT,
    transfer_type_id INTEGER,
    car_model TEXT,
    pickup_from TIMESTAMPTZ,
    pickup_until TIMESTAMPTZ,
    return_from TIMESTAMPTZ,
    return_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    payer_provider_id INTEGER,
    quota_confirmation_text TEXT,
    on_voucher BOOLEAN,
    display_order INTEGER,
    service_type_feature_id INTEGER,
    settlement_currency_type_id INTEGER,
    settlement_currency_rate NUMERIC(18, 5),
    vehicle_count INTEGER,
    is_visible BOOLEAN,
    luggage TEXT,
    fare_type_id INTEGER,
    invoice_import_request_id INTEGER
);

-- 10. PVP Details
CREATE TABLE booking_pvp_details (
    id INTEGER PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    commissionable_cost_id INTEGER,
    display_order INTEGER,
    pvp_per_pax NUMERIC(20, 4),
    passenger_count INTEGER,
    name TEXT,
    from_product BOOLEAN,
    is_discount BOOLEAN,
    is_visible BOOLEAN,
    tax_rate TEXT,
    tax_amount NUMERIC(20, 4),
    component TEXT,
    direction TEXT,
    tax_type TEXT,
    is_invoiced BOOLEAN
);

-- Enable RLS on all tables
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_invoice_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_other_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_pvp_details ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY "Authenticated users can read bookings" ON bookings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access for bookings" ON bookings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

CREATE POLICY "Authenticated users can read booking_passengers" ON booking_passengers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access for booking_passengers" ON booking_passengers FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- Apply similar policies for other tables
CREATE POLICY "Authenticated users can read booking_flights" ON booking_flights FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access for booking_flights" ON booking_flights FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'));

CREATE POLICY "Authenticated users can read booking_hotels" ON booking_hotels FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access for booking_hotels" ON booking_hotels FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'));

CREATE POLICY "Authenticated users can read booking_invoices" ON booking_invoices FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access for booking_invoices" ON booking_invoices FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'));

CREATE POLICY "Authenticated users can read booking_invoice_details" ON booking_invoice_details FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access for booking_invoice_details" ON booking_invoice_details FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'));

CREATE POLICY "Authenticated users can read booking_other_services" ON booking_other_services FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access for booking_other_services" ON booking_other_services FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'));

CREATE POLICY "Authenticated users can read booking_tours" ON booking_tours FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access for booking_tours" ON booking_tours FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'));

CREATE POLICY "Authenticated users can read booking_transfers" ON booking_transfers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access for booking_transfers" ON booking_transfers FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'));

CREATE POLICY "Authenticated users can read booking_pvp_details" ON booking_pvp_details FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access for booking_pvp_details" ON booking_pvp_details FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'));

-- Fill any existing NULL values with a reference derived from the ID
UPDATE public.bookings
SET booking_reference_id = 'REF-' || id::text
WHERE booking_reference_id IS NULL;

-- Add constraints
ALTER TABLE public.bookings
  ALTER COLUMN booking_reference_id SET NOT NULL,
  ADD CONSTRAINT bookings_booking_reference_id_key UNIQUE (booking_reference_id);