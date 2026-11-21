"""Initial migration for OptiFreight AI backend.
Creates tables for authentication, cargo, routes, trips, and related entities.
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Users table
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("username", sa.String, nullable=False, unique=True),
        sa.Column("hashed_password", sa.String, nullable=False),
        sa.Column("email", sa.String, nullable=False, unique=True),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )

    # Cargo table
    op.create_table(
        "cargo",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("weight_kg", sa.Float, nullable=False),
        sa.Column("volume_m3", sa.Float, nullable=False),
        sa.Column("origin_lat", sa.Float, nullable=False),
        sa.Column("origin_lng", sa.Float, nullable=False),
        sa.Column("dest_lat", sa.Float, nullable=False),
        sa.Column("dest_lng", sa.Float, nullable=False),
        sa.Column("pickup_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("delivery_deadline", sa.DateTime(timezone=True), nullable=False),
    )

    # Trips table
    op.create_table(
        "trips",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("truck_id", sa.Integer, nullable=False),
        sa.Column("route_geom", postgresql.geometry("LINESTRING", srid=4326), nullable=False),
        sa.Column("distance_m", sa.Float, nullable=False),
        sa.Column("estimated_time_s", sa.Integer, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )

    # Association table for cargo <-> trips (many‑to‑many)
    op.create_table(
        "trip_cargo",
        sa.Column("trip_id", sa.Integer, sa.ForeignKey("trips.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("cargo_id", sa.Integer, sa.ForeignKey("cargo.id", ondelete="CASCADE"), primary_key=True),
    )


def downgrade():
    op.drop_table("trip_cargo")
    op.drop_table("trips")
    op.drop_table("cargo")
    op.drop_table("users")
