import argparse
import pandas as pd

def fetch_fire_data(NASA_API_KEY):
    """
    Fetch fire data for Macedonia from NASA FIRMS API.

    Parameters:
    - NASA_API_KEY: API key for accessing NASA FIRMS API.

    Returns:
    - DataFrame containing fire data.
    """
    try:
        url = f'https://firms.modaps.eosdis.nasa.gov/api/country/csv/{NASA_API_KEY}/VIIRS_NOAA21_NRT/MKD/10'
        df_macedonia = pd.read_csv(url)

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

def main(NASA_API_KEY):

    df_macedonia = fetch_fire_data(NASA_API_KEY)
    if df_macedonia is None:
        return

    needed_columns = ['latitude', 'longitude', 'bright_ti4', 'acq_date', 'acq_time']
    needed_columns_df = df_macedonia[needed_columns].copy()

    needed_columns_df.rename(columns={'bright_ti4': 'temperature'}, inplace=True)

    needed_columns_df["datetime"] = needed_columns_df.apply(combine_date_time, axis=1)

    needed_columns_df.drop(["acq_date", "acq_time"], axis=1, inplace=True)

    json_data = needed_columns_df.to_json(orient='records', date_format='iso')

    print(json_data)
    return json_data

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Fetch fire data from NASA FIRMS API for Macedonia.')
    parser.add_argument('NASA_API_KEY', type=str, help='API key for accessing NASA FIRMS API')
    args = parser.parse_args()

    main(args.NASA_API_KEY)
