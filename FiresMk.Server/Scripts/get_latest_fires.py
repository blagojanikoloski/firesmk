import argparse
import pandas as pd
import numpy as np

def haversine(lat1, lon1, lat2, lon2):
    """
    Calculate the great-circle distance between two points on the Earth's surface given their latitude and longitude.

    Parameters:
    - lat1, lon1: Latitude and longitude of the first point.
    - lat2, lon2: Latitude and longitude of the second point.

    Returns:
    - Distance in meters.
    """
    R = 6371000  # Radius of the Earth in meters
    phi1 = np.radians(lat1)
    phi2 = np.radians(lat2)
    delta_phi = np.radians(lat2 - lat1)
    delta_lambda = np.radians(lon2 - lon1)
    
    a = np.sin(delta_phi / 2.0) ** 2 + \
        np.cos(phi1) * np.cos(phi2) * \
        np.sin(delta_lambda / 2.0) ** 2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
    
    return R * c

def fetch_fire_data(NASA_API_KEY):
    """
    Fetch fire data for Macedonia from NASA FIRMS API.

    Parameters:
    - NASA_API_KEY: API key for accessing NASA FIRMS API.

    Returns:
    - DataFrame containing fire data.
    """
    try:
        VIIRS_NOAA20 = f'https://firms.modaps.eosdis.nasa.gov/api/country/csv/{NASA_API_KEY}/VIIRS_NOAA20_NRT/MKD/1'
        df_VIIRS_NOAA20 = pd.read_csv(VIIRS_NOAA20)

        VIIRS_NOAA21 = f'https://firms.modaps.eosdis.nasa.gov/api/country/csv/{NASA_API_KEY}/VIIRS_NOAA21_NRT/MKD/1'
        df_VIIRS_NOAA21 = pd.read_csv(VIIRS_NOAA21)

        df_macedonia = pd.concat([df_VIIRS_NOAA20, df_VIIRS_NOAA21]).drop_duplicates(subset=['latitude', 'longitude', 'acq_date'])

        return df_macedonia

    except Exception as e:
        print(f"Error fetching data: {str(e)}")
        return None

def combine_date_time(row):
    """
    Combine acq_date and acq_time into datetime format.

    Parameters:
    - row: Pandas Series containing 'acq_date' and 'acq_time'.

    Returns:
    - Combined datetime.
    """
    acq_date = row["acq_date"]
    acq_time = str(row["acq_time"])  # Ensure acq_time is treated as string

    # Parse acq_time into hours and minutes
    if len(acq_time) == 1:
        hours = 0
        minutes = int(acq_time)
    elif len(acq_time) == 2:
        hours = 0
        minutes = int(acq_time)
    elif len(acq_time) == 3:
        hours = int(acq_time[:1])
        minutes = int(acq_time[1:])
    else:
        hours = int(acq_time[:2])
        minutes = int(acq_time[2:])

    combined_datetime = pd.to_datetime(acq_date) + pd.Timedelta(hours=hours, minutes=minutes)

    return combined_datetime

def filter_close_fires(df, distance_threshold=1000):
    """
    Filter out fires that are within a specified distance of another fire.

    Parameters:
    - df: DataFrame containing fire data.
    - distance_threshold: Distance threshold in meters to filter out close fires.

    Returns:
    - DataFrame with filtered fire data.
    """
    filtered_fires = []

    for index, fire in df.iterrows():
        keep = True
        for filtered_fire in filtered_fires:
            distance = haversine(fire['latitude'], fire['longitude'], filtered_fire['latitude'], filtered_fire['longitude'])
            if distance < distance_threshold:
                keep = False
                break
        if keep:
            filtered_fires.append(fire)

    return pd.DataFrame(filtered_fires)

def main(NASA_API_KEY):

    df_macedonia = fetch_fire_data(NASA_API_KEY)
    if df_macedonia is None:
        return

    needed_columns = ['latitude', 'longitude', 'bright_ti4', 'acq_date', 'acq_time']
    needed_columns_df = df_macedonia[needed_columns].copy()

    needed_columns_df.rename(columns={'bright_ti4': 'temperature'}, inplace=True)

    needed_columns_df["datetime"] = needed_columns_df.apply(combine_date_time, axis=1)

    needed_columns_df.drop(["acq_date", "acq_time"], axis=1, inplace=True)

    filtered_fires_df = filter_close_fires(needed_columns_df)

    json_data = filtered_fires_df.to_json(orient='records', date_format='iso')

    print(json_data)
    return json_data

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Fetch fire data from NASA FIRMS API for Macedonia.')
    parser.add_argument('NASA_API_KEY', type=str, help='API key for accessing NASA FIRMS API')
    args = parser.parse_args()

    main(args.NASA_API_KEY)
