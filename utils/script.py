import pandas as pd
import math

def generate_sql_queries():
    # 1. Konfigurasi Awal
    file_path = "(ZWC) FIN_RekapData Audit_MayJune_Sampah Kampus 3 USD.xlsx"
    sheet_name = 'Audit1_May'
    period = '2026-05'
    
    # 2. Load Data (skip 4 baris header judul)
    try:
        df = pd.read_excel(file_path, sheet_name=sheet_name, skiprows=4)
    except Exception as e:
        print(f"Error membaca file: {e}")
        return

    # 3. Cleaning Data
    # Hanya ambil baris yang kolom Date-nya terisi (mengabaikan baris TOTAL di bawah)
    df_clean = df.dropna(subset=['Date']).copy()

    # --- GENERATE QUERY CAMPUS ---
    campus_name = "Kampus 3 USD"
    id_campus = 1
    print("-- 1. INSERT CAMPUS")
    print(f"INSERT INTO Campus (id_campus, campus_name) VALUES ({id_campus}, '{campus_name}');\n")

    # --- GENERATE QUERY LOCATIONS ---
    valid_locations = df_clean['Location'].dropna().unique()
    location_map = {} # Dictionary untuk mapping Nama Lokasi -> ID Lokasi

    print("-- 2. INSERT LOCATIONS")
    for idx, loc in enumerate(valid_locations):
        id_location = idx + 1
        location_map[loc] = id_location
        # Escape tanda kutip tunggal jika ada di nama lokasi
        safe_loc = loc.replace("'", "''") 
        print(f"INSERT INTO Locations (id_location, id_campus, location_name) VALUES ({id_location}, {id_campus}, '{safe_loc}');")
    print("\n")

    # --- GENERATE QUERY DATA AUDIT ---
    print("-- 3. INSERT DATA AUDIT")
    
    # Helper function untuk handle nilai kosong/NaN dari Excel menjadi 0 atau format desimal yang aman
    def clean_num(val):
        if pd.isna(val) or val == ' ' or val == '':
            return 0
        return round(float(val), 2) # Dibulatkan 2 angka di belakang koma agar query rapi

    for index, row in df_clean.iterrows():
        # Dapatkan Foreign Key id_location dari dictionary
        current_loc = row['Location']
        id_location = location_map.get(current_loc)
        
        # Format tanggal ke YYYY-MM-DD
        audit_date = row['Date'].strftime('%Y-%m-%d')
        
        # Ekstraksi dan cleaning *metrics*
        hard_plastic = clean_num(row['Weight of Hard Plastic (Kg)'])
        paper = clean_num(row['Weight of Paper (Kg)'])
        food_waste = clean_num(row['Weight Food Waste (Kg)'])
        residual_kg = clean_num(row['Residual Waste (Kg)'])
        residual_vol = clean_num(row['Residual Waste Volume (L)'])
        total_kg = clean_num(row['Total Waste (Kg)'])
        total_vol = clean_num(row['Total Waste Volume (L)'])
        
        query = (
            f"INSERT INTO DataAudit "
            f"(id_location, audit_date, period, hard_plastic_kg, paper_kg, food_waste_kg, residual_kg, residual_volume_l, total_waste_kg, total_waste_volume_l, is_active, created_at) "
            f"VALUES ({id_location}, '{audit_date}', '{period}', {hard_plastic}, {paper}, {food_waste}, {residual_kg}, {residual_vol}, {total_kg}, {total_vol}, TRUE, CURRENT_TIMESTAMP);"
        )
        print(query)

# Eksekusi fungsi
if __name__ == "__main__":
    generate_sql_queries()