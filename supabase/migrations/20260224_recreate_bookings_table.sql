-- Recreate Bookings Module with reordered column
-- Drop existing tables first (they are blank)
DROP TABLE IF EXISTS booking_pvp_details CASCADE;
DROP TABLE IF EXISTS booking_transfers CASCADE;
DROP TABLE IF EXISTS booking_tours CASCADE;
DROP TABLE IF EXISTS booking_other_services CASCADE;
DROP TABLE IF EXISTS booking_invoices_old CASCADE;
DROP TABLE IF EXISTS booking_hotels CASCADE;
DROP TABLE IF EXISTS booking_flights CASCADE;
DROP TABLE IF EXISTS booking_passengers CASCADE;
DROP TABLE IF EXISTS booking_deposits CASCADE;
DROP TABLE IF EXISTS booking_deposit_payments CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;


-- 1. Main Bookings Table
CREATE TABLE bookings (
    id INTEGER PRIMARY KEY,
    booking_reference TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),

    -- Sales Channel & Statuses
    office_id INTEGER,
    agent_office_id INTEGER,
    sales_channel_id INTEGER,
    sales_channel_value TEXT,
    brochure_id INTEGER,
    status_id INTEGER,
    admin_status TEXT,
    documentation_status TEXT,
    proforma_status TEXT,

    -- Cost & Pricing
    currency_id INTEGER,
    currency_exchange_rate NUMERIC(10, 5),
    total_amount NUMERIC(20, 4),
    customer_total_amount NUMERIC(20, 4),
    gross_amount NUMERIC(20, 4),
    net_amount NUMERIC(20, 4),
    cost NUMERIC(20, 4),
    margin_amount NUMERIC(20, 4),
    sale_percentage NUMERIC(20, 4),
    commissionable_amount NUMERIC(20, 4),
    commission_vat_percentage NUMERIC(5, 2),
    commission_vat_amount NUMERIC(20, 4),
    settlement_currency_id INTEGER,
    settlement_currency_rate NUMERIC(18, 5),
    system_accounting_cost NUMERIC(20, 4),
    invoice_tax_currency_rate NUMERIC(20, 10),
    invoice_tax_currency TEXT,

    -- Others
    locator TEXT, /* Unused */
    region_code TEXT,
    country_code TEXT,
    language_code TEXT,
    first_service_date TIMESTAMPTZ,
    expiry_date TIMESTAMPTZ,
    issue_deadline TIMESTAMPTZ,
    payment_due_date DATE,
    no_recalculate BOOLEAN,
    exclude_mandatory_insurance BOOLEAN,

    CONSTRAINT bookings_booking_reference_key UNIQUE (booking_reference)
);

-- 2. Passengers
CREATE TABLE booking_passengers (
    id INTEGER PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    title TEXT,
    first_name TEXT,
    last_name1 TEXT,
    last_name2 TEXT,
    amadeus_first_name TEXT,
    amadeus_last_name TEXT,
    passenger_type TEXT,
    gender TEXT,
    phone TEXT,
    email TEXT,
    birth_date DATE,
    nationality_country_id INTEGER,
    document_type TEXT,
    document_number TEXT,
    document_issue_date DATE,
    document_expiry_date DATE,
    is_main_passenger BOOLEAN
);

-- 3. Flights
CREATE TABLE booking_flights (
    -- 1. Fixed-width Primary/Foreign Keys & Dates (8-byte aligned)
    id INTEGER PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    issue_deadline TIMESTAMPTZ,

    -- 2. Fixed-width Integers (4-byte aligned)
    airline_contract_id INTEGER,
    air_service_type_id INTEGER,
    commissionable_cost_id INTEGER,
    item_status_id INTEGER,
    cost_currency_id INTEGER,
    adult_count INTEGER,
    child_count INTEGER,
    infant_count INTEGER,
    provider_id INTEGER,
    destination_id INTEGER,
    service_type_id INTEGER,
    payer_provider_id INTEGER,
    waiting_list INTEGER,
    settlement_currency_type_id INTEGER,
    fare_type_id INTEGER,
    invoice_import_request_id INTEGER,

    -- 3. Numeric (Variable precision)
    pvp_per_pax NUMERIC(20, 4),
    cost_per_pax NUMERIC(20, 4),
    cost_exchange_rate NUMERIC(18, 5),
    settlement_currency_rate NUMERIC(18, 5),
    gst_price NUMERIC(20, 4),
    price_with_taxes NUMERIC(20, 4),

    -- 4. Variable-length Strings (TEXT)
    quota_confirmation_text TEXT,
    provider_locator TEXT,
    airline_locator TEXT,
    terminal_locator TEXT,
    gds_locator TEXT,
    uapi_locator TEXT,
    departure_terminal TEXT,
    arrival_terminal TEXT,
    account TEXT,
    description TEXT,
    adult_baggage TEXT,
    child_baggage TEXT,
    infant_baggage TEXT,
    segment_status_code TEXT,

    -- 5. Boolean (1-byte)
    from_product BOOLEAN
);

-- 4. Hotels
CREATE TABLE booking_hotels (
    -- 1. Fixed-width Primary/Foreign Keys & Dates (8-byte aligned)
    id INTEGER PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),

    -- 2. Fixed-width Integers & Dates (4-byte aligned)
    hotel_contract_id INTEGER,
    adult_count INTEGER,
    child_count INTEGER,
    infant_count INTEGER,
    accommodation_feature_id INTEGER,
    board_basis_id INTEGER,
    room_count INTEGER,
    item_status_id INTEGER,
    cost_currency_id INTEGER,
    legacy_hotel_booking_id INTEGER,
    provider_id INTEGER,
    destination_id INTEGER,
    service_type_id INTEGER,
    payer_provider_id INTEGER,
    extra_nights INTEGER,
    category_id INTEGER,
    settlement_currency_type_id INTEGER,
    fare_type_id INTEGER,
    invoice_import_request_id INTEGER,
    check_in_date DATE,
    check_out_date DATE,

    -- 3. Numeric (Variable precision)
    pvp_per_pax NUMERIC(20, 4),
    cost_per_pax NUMERIC(20, 4),
    cost_exchange_rate NUMERIC(18, 5),
    settlement_currency_rate NUMERIC(18, 5),

    -- 4. Variable-length Strings (TEXT)
    quota_confirmation_text TEXT,
    provider_locator TEXT,
    account TEXT,
    description TEXT,
    source TEXT,
    additional_locator TEXT,

    -- 5. Boolean (1-byte)
    from_product BOOLEAN,
    use_quota BOOLEAN,
    on_voucher BOOLEAN
);

-- 5. Old Invoices (Combined Header and Details)
CREATE TABLE booking_invoices_old (
    -- 1. Fixed-width Primary/Foreign Keys & Dates (8-byte aligned)
    id INTEGER PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    invoice_date TIMESTAMPTZ,
    external_reception_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),

    -- 2. Fixed-width Integers (4-byte aligned)
    end_customer_data_id INTEGER,
    generated_invoice_type_id INTEGER,
    invoice_type_id INTEGER,
    external_billing_id INTEGER,
    external_billing_status_id INTEGER,
    deposit_payment_id INTEGER,

    -- 3. Numeric (Variable precision)
    tax_base NUMERIC(16, 2),
    vat NUMERIC(16, 2),
    exempt_tax_amount NUMERIC(20, 4),
    exempt_tax_invoice NUMERIC(20, 4),
    zero_tax_amount NUMERIC(20, 4),
    zero_tax_invoice NUMERIC(20, 4),
    na_tax_amount NUMERIC(20, 4),
    na_tax_invoice NUMERIC(20, 4),
    taxable_amount_5 NUMERIC(20, 4),
    taxable_invoice_5 NUMERIC(20, 4),
    taxable_base_5 NUMERIC(20, 4),
    taxable_amount_10 NUMERIC(20, 4),
    taxable_invoice_10 NUMERIC(20, 4),
    taxable_base_10 NUMERIC(20, 4),

    -- 4. Variable-length Strings (TEXT)
    invoice_number TEXT,
    external_billing_error TEXT,
    external_invoice_number TEXT,
    concept TEXT,
    exempt_tax_rate TEXT,
    zero_tax_rate TEXT,
    na_tax_rate TEXT,
    taxable_rate_5 TEXT,
    taxable_rate_10 TEXT,

    -- 5. Boolean (1-byte)
    pdf_generated BOOLEAN,
    sent BOOLEAN,
    show_vat BOOLEAN,
    accounting_sale BOOLEAN,
    accounting_purchase BOOLEAN
);

-- 6. Deposits
CREATE TABLE booking_deposits (
    -- 1. Fixed-width Primary/Foreign Keys & Dates (8-byte aligned)
    id INTEGER PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    deadline_date TIMESTAMPTZ,
    modified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    token UUID,

    -- 2. Fixed-width Integers (4-byte aligned)
    deposit_type_id INTEGER,
    user_id INTEGER,
    deposit_description_id INTEGER,
    status_id INTEGER,
    payment_method_id INTEGER,

    -- 3. Numeric (Variable precision)
    amount NUMERIC(18, 2),

    -- 4. Variable-length Strings (TEXT)
    description TEXT,
    observations TEXT,
    original_payment_reference TEXT,
    payment_provider TEXT,

    -- 5. Boolean (1-byte)
    admin_check BOOLEAN
);

-- 7. Deposit Payments
CREATE TABLE booking_deposit_payments (
    -- 1. Fixed-width Primary/Foreign Keys & Dates (8-byte aligned)
    id INTEGER PRIMARY KEY,
    deposit_id INTEGER REFERENCES booking_deposits(id) ON DELETE CASCADE,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    payment_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),

    -- 2. Fixed-width Integers (4-byte aligned)
    currency_id INTEGER,
    payment_description_id INTEGER,
    payment_method_id INTEGER,

    -- 3. Numeric (Variable precision)
    amount NUMERIC(18, 2),

    -- 4. Variable-length Strings (TEXT)
    bank_locator TEXT,
    payment_gateway TEXT,
    payment_processor TEXT,
    observations TEXT
);

-- 8. Other Services
CREATE TABLE booking_other_services (
    -- 1. Fixed-width Primary/Foreign Keys & Dates (8-byte aligned)
    id INTEGER PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),

    -- 2. Fixed-width Integers & Dates (4-byte aligned)
    commissionable_cost_id INTEGER,
    cost_currency_id INTEGER,
    adult_count INTEGER,
    child_count INTEGER,
    infant_count INTEGER,
    item_status_id INTEGER,
    duration INTEGER,
    service_contract_id INTEGER,
    provider_id INTEGER,
    destination_id INTEGER,
    service_type_id INTEGER,
    payer_provider_id INTEGER,
    service_id INTEGER,
    service_type_feature_id INTEGER,
    settlement_currency_type_id INTEGER,
    fare_type_id INTEGER,
    invoice_import_request_id INTEGER,
    service_date DATE,

    -- 3. Numeric (Variable precision)
    pvp_per_pax NUMERIC(20, 4),
    cost_per_pax NUMERIC(20, 4),
    cost_exchange_rate NUMERIC(18, 5),
    settlement_currency_rate NUMERIC(18, 5),

    -- 4. Variable-length Strings (TEXT)
    quota_confirmation_text TEXT,
    provider_locator TEXT,
    account TEXT,
    description TEXT,

    -- 5. Boolean (1-byte)
    on_voucher BOOLEAN,
    from_product BOOLEAN,
    is_visible BOOLEAN
);

-- 9. Tours
CREATE TABLE booking_tours (
    -- 1. Fixed-width Primary/Foreign Keys & Dates (8-byte aligned)
    id INTEGER PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    tour_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),

    -- 2. Fixed-width Integers (4-byte aligned)
    item_status_id INTEGER,
    cost_currency_id INTEGER,
    commissionable_cost_id INTEGER,
    adult_count INTEGER,
    child_count INTEGER,
    infant_count INTEGER,
    duration INTEGER,
    service_contract_id INTEGER,
    provider_id INTEGER,
    destination_id INTEGER,
    service_type_id INTEGER,
    customer_language_id INTEGER,
    payer_provider_id INTEGER,
    display_order INTEGER,
    service_type_feature_id INTEGER,
    settlement_currency_type_id INTEGER,
    fare_type_id INTEGER,
    invoice_import_request_id INTEGER,

    -- 3. Numeric (Variable precision)
    pvp_per_pax NUMERIC(20, 4),
    cost_per_pax NUMERIC(20, 4),
    cost_exchange_rate NUMERIC(18, 5),
    settlement_currency_rate NUMERIC(18, 5),

    -- 4. Variable-length Strings (TEXT)
    quota_confirmation_text TEXT,
    provider_locator TEXT,
    description TEXT,
    token TEXT,
    price_info TEXT,
    payer_name TEXT,
    payer_vat TEXT,
    child_ages TEXT,
    wholesaler_locator TEXT,
    product_type_info TEXT,
    customer_comments TEXT,
    ticket_title TEXT,
    ticket_modality TEXT,
    ticket_file TEXT,
    pickup_location TEXT,
    pickup_time TEXT,

    -- 5. Boolean (1-byte)
    from_product BOOLEAN,
    on_voucher BOOLEAN,
    is_visible BOOLEAN
);

-- 10. Transfers
CREATE TABLE booking_transfers (
    -- 1. Fixed-width Primary/Foreign Keys & Dates (8-byte aligned)
    id INTEGER PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    transfer_date TIMESTAMPTZ,
    arrival_time TIMESTAMPTZ,
    pickup_from TIMESTAMPTZ,
    pickup_until TIMESTAMPTZ,
    return_from TIMESTAMPTZ,
    return_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),

    -- 2. Fixed-width Integers (4-byte aligned)
    item_status_id INTEGER,
    cost_currency_id INTEGER,
    commissionable_cost_id INTEGER,
    adult_count INTEGER,
    child_count INTEGER,
    infant_count INTEGER,
    duration INTEGER,
    service_contract_id INTEGER,
    provider_id INTEGER,
    destination_id INTEGER,
    service_type_id INTEGER,
    min_age INTEGER,
    max_age INTEGER,
    transfer_type_id INTEGER,
    payer_provider_id INTEGER,
    display_order INTEGER,
    service_type_feature_id INTEGER,
    settlement_currency_type_id INTEGER,
    vehicle_count INTEGER,
    fare_type_id INTEGER,
    invoice_import_request_id INTEGER,

    -- 3. Numeric (Variable precision)
    pvp_per_pax NUMERIC(20, 4),
    cost_per_pax NUMERIC(20, 4),
    cost_exchange_rate NUMERIC(18, 5),
    settlement_currency_rate NUMERIC(18, 5),

    -- 4. Variable-length Strings (TEXT)
    provider_locator TEXT,
    wholesaler_locator TEXT,
    description TEXT,
    token TEXT,
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
    arrival_flight TEXT,
    included_services TEXT,
    car_model TEXT,
    quota_confirmation_text TEXT,
    luggage TEXT,

    -- 5. Boolean (1-byte)
    from_product BOOLEAN,
    on_voucher BOOLEAN,
    is_visible BOOLEAN
);

-- 11. PVP Details
CREATE TABLE booking_pvp_details (
    -- 1. Fixed-width Primary/Foreign Keys (8-byte aligned)
    id INTEGER PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,

    -- 2. Fixed-width Integers (4-byte aligned)
    commissionable_cost_id INTEGER,
    display_order INTEGER,
    passenger_count INTEGER,

    -- 3. Numeric (Variable precision)
    pvp_per_pax NUMERIC(20, 4),
    tax_amount NUMERIC(20, 4),

    -- 4. Variable-length Strings (TEXT)
    name TEXT,
    tax_rate TEXT,
    component TEXT,
    direction TEXT,
    tax_type TEXT,

    -- 5. Boolean (1-byte)
    from_product BOOLEAN,
    is_discount BOOLEAN,
    is_visible BOOLEAN,
    is_invoiced BOOLEAN
);

-- Enable RLS on all tables
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_invoices_old ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_deposit_payments ENABLE ROW LEVEL SECURITY;
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

CREATE POLICY "Authenticated users can read booking_invoices_old" ON booking_invoices_old FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access for booking_invoices_old" ON booking_invoices_old FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'));

CREATE POLICY "Authenticated users can read booking_deposits" ON booking_deposits FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access for booking_deposits" ON booking_deposits FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'));

CREATE POLICY "Authenticated users can read booking_deposit_payments" ON booking_deposit_payments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access for booking_deposit_payments" ON booking_deposit_payments FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'));

CREATE POLICY "Authenticated users can read booking_other_services" ON booking_other_services FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access for booking_other_services" ON booking_other_services FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'));

CREATE POLICY "Authenticated users can read booking_tours" ON booking_tours FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access for booking_tours" ON booking_tours FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'));

CREATE POLICY "Authenticated users can read booking_transfers" ON booking_transfers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access for booking_transfers" ON booking_transfers FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'));

CREATE POLICY "Authenticated users can read booking_pvp_details" ON booking_pvp_details FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access for booking_pvp_details" ON booking_pvp_details FOR ALL USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'));