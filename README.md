# Oncall Retrospective Summarizer

This application provides a UI to input daily oncall summaries and view an AI-generated retrospective summary. It uses a React frontend and a Python (Flask) backend with LangGraph to manage the summarization workflow.

## Project Structure

- `/`: Contains the frontend React application.
- `/backend`: Contains the Python Flask backend application.

## Setup and Running

You need to run two components: the Frontend UI and the Backend Server.

### 1. Backend Server (Python Flask with LangGraph)

The backend server handles the logic of collecting daily summaries and generating retrospective summaries using LangGraph and the Gemini API.

**Prerequisites:**
- Python 3.8+
- pip

**Setup:**

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create a Python virtual environment (recommended):**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up environment variables:**
    Create a file named `.env` in the `backend` directory (`backend/.env`) and add your Gemini API key:
    ```env
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
    # Optional: You can also set Flask environment variables if needed
    # FLASK_APP=app.py
    # FLASK_DEBUG=1
    ```
    Replace `"YOUR_GEMINI_API_KEY_HERE"` with your actual Gemini API key.

**Running the Backend:**

1.  Ensure your virtual environment is activated and you are in the `backend` directory.
2.  Run the Flask application:
    ```bash
    python app.py
    ```
    The backend server will start, typically on `http://localhost:5000`. You should see output indicating the server is running.

### 2. Frontend UI (React)

The frontend provides the user interface for submitting daily notes and viewing summaries.

**Prerequisites:**
- Node.js (LTS version recommended)
- npm (usually comes with Node.js)

**Setup:**

1.  **Navigate to the root project directory (if you were in `backend`, go up one level `cd ..`):**
    Ensure you are in the main project directory that contains `package.json`.

2.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables for Frontend (Optional):**
    The frontend primarily communicates with the local backend. The direct `GEMINI_API_KEY` previously set in `frontend/.env.local` or similar for direct Gemini calls from the client is no longer the primary method for the features modified in this project (daily summary submission and retrospective generation), as the backend now handles Gemini interactions for these. However, other parts of the frontend might still use it if they make direct calls. For this project's core functionality, the backend's `.env` is critical.

**Running the Frontend:**

1.  Ensure you are in the root project directory.
2.  Run the React application:
    ```bash
    npm run dev
    ```
    The frontend development server will start, typically on `http://localhost:5173` (Vite's default) or another port if specified. Your browser should open automatically, or you can navigate to the provided URL.

## How it Works

1.  The user interacts with the **Frontend UI**.
2.  To submit a "daily summary" (currently actioned via the "Create Your Own Insight" feature by selecting tags), the frontend sends the data to the **Backend Server's** `/api/submit_daily` endpoint.
3.  The Backend Server uses LangGraph to add this daily summary to a persistent (in-memory for now) list of summaries for the current session/thread.
4.  When the frontend loads or after a new daily summary is submitted, it calls the Backend Server's `/api/retrospective` endpoint.
5.  The Backend Server then instructs LangGraph to take all accumulated daily summaries for the session/thread, generate a consolidated text, and use the Gemini API to produce a retrospective summary.
6.  This summary is returned to the frontend and displayed.

**Note:** The current backend implementation uses an in-memory store (`MemorySaver` for LangGraph) for daily summaries. This means summaries will be lost if the backend server restarts. For persistent storage, the checkpointer in `backend/app.py` would need to be changed to something like `RedisSaver` or a database-backed solution. All users also currently share the same data thread.
