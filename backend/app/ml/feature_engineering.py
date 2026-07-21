import pandas as pd
import numpy as np
from typing import List, Dict, Any
from datetime import datetime, timedelta

def get_festival_indicator(date_val: datetime.date) -> float:
    """
    Returns 1.0 if the date is close to major Indian festival seasons (Diwali, Eid, Pongal, Holi).
    """
    # Simple rule-based proxy for major agricultural & regional festival windows in India
    # Pongal (mid Jan), Holi (mid March), Eid (varies, let's tag April/May proxy or specific windows),
    # Dussehra/Diwali (Oct/Nov/Dec peak transaction months)
    month = date_val.month
    day = date_val.day
    
    # Pongal / Makar Sankranti
    if month == 1 and 10 <= day <= 17:
        return 1.0
    # Holi
    if month == 3 and 10 <= day <= 28:
        return 1.0
    # Festive peak (Oct, Nov, Dec pre-harvest and Diwali window)
    if month in [10, 11, 12]:
        return 1.0
    
    return 0.0

def get_crop_season_indicator(date_val: datetime.date, sector: str) -> Dict[str, float]:
    """
    Returns Kharif and Rabi season activity indices.
    """
    month = date_val.month
    is_agri = 1.0 if sector.lower() in ["agriculture", "dairy", "farming"] else 0.5
    
    features = {
        "kharif_sowing": 0.0,
        "kharif_harvest": 0.0,
        "rabi_sowing": 0.0,
        "rabi_harvest": 0.0
    }
    
    if is_agri > 0:
        # Kharif: Sowing in Jun-Jul, Harvesting in Sep-Oct
        if month in [6, 7]:
            features["kharif_sowing"] = 1.0 * is_agri
        elif month in [9, 10]:
            features["kharif_harvest"] = 1.0 * is_agri
            
        # Rabi: Sowing in Oct-Nov, Harvesting in Feb-Apr
        if month in [10, 11]:
            features["rabi_sowing"] = 1.0 * is_agri
        elif month in [2, 3, 4]:
            features["rabi_harvest"] = 1.0 * is_agri
            
    return features

def generate_features_from_transactions(
    transactions: List[Any],
    twin_state: Dict[str, Any],
    sector: str,
    district: str,
    state: str,
    horizon_days: int = 30
) -> pd.DataFrame:
    """
    Transforms raw transactional database records into a rich feature matrix.
    Generates lags, rolling aggregations, calendar/crop markers, and economic indicators.
    """
    if not transactions:
        # Return empty template DataFrame with expected columns to prevent runtime crashes
        return pd.DataFrame()

    # Convert to DataFrame
    data = []
    for tx in transactions:
        data.append({
            "date": tx.timestamp.date() if hasattr(tx.timestamp, "date") else tx.timestamp,
            "amount": float(tx.amount),
            "type": tx.transaction_type,  # INFLOW or OUTFLOW
            "category": tx.category,
            "source": tx.source
        })
    
    df_raw = pd.DataFrame(data)
    df_raw["date"] = pd.to_datetime(df_raw["date"])
    
    # Aggregate daily inflows and outflows
    daily_inflow = df_raw[df_raw["type"] == "INFLOW"].groupby("date")["amount"].sum().rename("inflow")
    daily_outflow = df_raw[df_raw["type"] == "OUTFLOW"].groupby("date")["amount"].sum().rename("outflow")
    
    # Create complete date range to handle missing days (sparse rural data)
    min_date = df_raw["date"].min()
    max_date = df_raw["date"].max()
    all_dates = pd.date_range(start=min_date, end=max_date, freq="D")
    
    df_daily = pd.DataFrame(index=all_dates)
    df_daily = df_daily.join(daily_inflow).join(daily_outflow).fillna(0.0)
    df_daily["net_flow"] = df_daily["inflow"] - df_daily["outflow"]
    
    # Cumulative cash position estimate
    df_daily["cash_position"] = df_daily["net_flow"].cumsum() + float(twin_state.get("assets_valuation", 10000.0) * 0.1)
    
    # --- Feature Generation ---
    # 1. Calendar/Temporal features
    df_daily["day_of_week"] = df_daily.index.dayofweek
    df_daily["month"] = df_daily.index.month
    df_daily["day_of_month"] = df_daily.index.day
    df_daily["festival_indicator"] = [get_festival_indicator(d.date()) for d in df_daily.index]
    
    # 2. Seasonality (Agricultural Crops)
    crop_seasons = [get_crop_season_indicator(d.date(), sector) for d in df_daily.index]
    df_crop = pd.DataFrame(crop_seasons, index=df_daily.index)
    df_daily = pd.concat([df_daily, df_crop], axis=1)

    # 3. Lags
    for lag in [1, 2, 3, 7, 14, 30]:
        df_daily[f"net_flow_lag_{lag}"] = df_daily["net_flow"].shift(lag)
        df_daily[f"inflow_lag_{lag}"] = df_daily["inflow"].shift(lag)
        df_daily[f"outflow_lag_{lag}"] = df_daily["outflow"].shift(lag)

    # 4. Rolling Statistics
    for window in [7, 14, 30]:
        df_daily[f"net_flow_roll_mean_{window}"] = df_daily["net_flow"].rolling(window=window, min_periods=1).mean()
        df_daily[f"net_flow_roll_std_{window}"] = df_daily["net_flow"].rolling(window=window, min_periods=1).std().fillna(0.0)
        df_daily[f"inflow_roll_mean_{window}"] = df_daily["inflow"].rolling(window=window, min_periods=1).mean()
        df_daily[f"outflow_roll_mean_{window}"] = df_daily["outflow"].rolling(window=window, min_periods=1).mean()
        
    # 5. External Indicators (Simulating Mandi Commodity Prices & Weather based on locations)
    # In production, this would query a real weather / crop mandi API
    # Here we seed deterministic values based on location hashes to emulate real APIs
    loc_seed = hash(district + state) % 100
    df_daily["rainfall_anomaly"] = np.sin(df_daily.index.dayofyear / 365.0 * 2 * np.pi) * 20.0 + (loc_seed - 50) / 5.0
    df_daily["mandi_price_index"] = 100.0 + np.sin(df_daily.index.dayofyear / 365.0 * np.pi) * 15.0 + (df_daily.index.year - 2023) * 5.0
    
    # 6. Transaction velocity (UPI vs Cash proxy)
    # Ratio of transactions in the last 7 days compared to average
    df_daily["tx_velocity_7d"] = df_daily["inflow"].rolling(7).sum() / (df_daily["inflow"].rolling(30).sum().replace(0, 1) + 1.0)
    
    # 7. Digital Twin State integration
    df_daily["outstanding_loans"] = float(twin_state.get("outstanding_loans", 0.0))
    df_daily["inventory_value"] = float(twin_state.get("inventory_value", 0.0))
    df_daily["supplier_stability"] = float(twin_state.get("supplier_stability_score", 1.0))
    df_daily["assets_valuation"] = float(twin_state.get("assets_valuation", 0.0))
    
    # Drop rows with NaN (from shifting lags) - except we fillna(0) to maximize rural sparse training length
    df_daily = df_daily.fillna(0.0)
    
    return df_daily
