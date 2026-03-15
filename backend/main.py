from fastapi.responses import JSONResponse
from backend.config.Apps import MainApp
from backend.apps.db.item_db import item_db
from backend.apps.health.health import health
from fastapi.middleware.cors import CORSMiddleware

main_app = MainApp([item_db, health])
app = main_app.app

# Add CORS middleware - allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8324, reload=True)
