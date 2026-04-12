import os
from sqlalchemy import create_engine
from dotenv import load_dotenv

# Load environment variables at module import time
load_dotenv()

def get_engine():
    db_user = os.environ.get("DB_USER")
    db_pass = os.environ.get("DB_PASS")
    db_name = os.environ.get("DB_NAME")

    # Ensure required variables are present
    if not db_user or not db_pass or not db_name:
        raise ValueError(
            "Missing required environment variables. "
            "Please explicitly set DB_USER, DB_PASS, and DB_NAME."
        )

    unix_socket = os.environ.get("INSTANCE_UNIX_SOCKET")

    if unix_socket:
        # Support connecting via Unix socket (common for Cloud SQL)
        # Using pg8000 often requires the UNIX socket format to append /.s.PGSQL.5432 
        # to the Cloud SQL instance connection name.
        socket_path = unix_socket if unix_socket.endswith("5432") else f"{unix_socket}/.s.PGSQL.5432"
        url = f"postgresql+pg8000://{db_user}:{db_pass}@/{db_name}?unix_sock={socket_path}"
    else:
        # Default to TCP/IP connection
        host = os.environ.get("INSTANCE_HOST", "127.0.0.1")
        port = os.environ.get("DB_PORT", "5432")
        url = f"postgresql+pg8000://{db_user}:{db_pass}@{host}:{port}/{db_name}"

    return create_engine(
        url,
        pool_pre_ping=True,
        future=True
    )

# Maintain a global engine instance for the module
engine = get_engine()
