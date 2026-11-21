from sqlalchemy import Column, Integer, String, Date, JSON
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class UnctadData(Base):
    __tablename__ = "unctad_data"
    id = Column(Integer, primary_key=True, index=True)
    commodity_code = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    data = Column(JSON, nullable=False)
    fetched_at = Column(Date, nullable=False)
