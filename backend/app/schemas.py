from pydantic import BaseModel, Field
from datetime import date

class UnctadDataRequest(BaseModel):
    commodity_code: str = Field(..., description="HS commodity code")
    start_year: int = Field(..., ge=1900, le=2100)
    end_year: int = Field(..., ge=1900, le=2100)

class UnctadDataResponse(BaseModel):
    commodity_code: str
    data: dict = Field(..., description="Mapping of year to trade value")
    fetched_at: date
