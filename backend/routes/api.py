from fastapi import APIRouter, Query
from backend.services.data_service import load_csv_data
from typing import Optional

router = APIRouter(prefix="/api")


@router.get("/revenue")
def get_revenue(
    start: Optional[str] = Query(None, description="Start month (YYYY-MM)"),
    end: Optional[str] = Query(None, description="End month (YYYY-MM)"),
):
    """Monthly revenue trend. Supports optional date-range filter via ?start=&end= query params."""
    data = load_csv_data("monthly_revenue")

    # Bonus: date-range filter
    if start:
        data = [r for r in data if r.get("order_year_month", "") >= start]
    if end:
        data = [r for r in data if r.get("order_year_month", "") <= end]

    return {"data": data}


@router.get("/top-customers")
def get_top_customers(
    search: Optional[str] = Query(None, description="Search by customer name"),
):
    """Top 10 customers by total spend. Supports optional ?search= query param."""
    data = load_csv_data("top_customers")

    # Bonus: search filter
    if search:
        search_lower = search.lower()
        data = [
            r for r in data
            if search_lower in str(r.get("name", "")).lower()
        ]

    return {"data": data}


@router.get("/categories")
def get_categories():
    """Category performance data."""
    return {"data": load_csv_data("category_performance")}


@router.get("/regions")
def get_regions():
    """Regional analysis data."""
    return {"data": load_csv_data("regional_analysis")}
