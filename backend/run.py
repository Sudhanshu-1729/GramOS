import uvicorn
import os

if __name__ == "__main__":
    # Get port from environment or default to 8000
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    
    print(f"Starting RuralOS AI Backend Gateway on http://{host}:{port}...")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
