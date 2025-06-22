import os
from flask import Flask, jsonify, request
from dotenv import load_dotenv
from langgraph.checkpoint.memory import MemorySaver

# Load environment variables
load_dotenv()

# Import graph definition (assuming graph.py is in the same directory or accessible)
from graph import workflow, GraphState # Make sure graph.py is importable

app = Flask(__name__)

# Configure Gemini API Key (ensure it's set in .env or environment)
gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables.")

# Compile the graph with a checkpointer
# MemorySaver is used here for simplicity. For production, use a persistent checkpointer.
memory_saver = MemorySaver()
app_graph = workflow.compile(checkpointer=memory_saver)

# Helper to get a unique config for each request or session
# For now, we'll use a static thread_id for simplicity in demonstration.
# In a real app, this should be dynamic (e.g., user ID, session ID).
DEFAULT_THREAD_ID = "global_retro_thread"

def get_thread_config(thread_id: str = DEFAULT_THREAD_ID):
    return {"configurable": {"thread_id": thread_id}}

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.route('/api/submit_daily', methods=['POST'])
def submit_daily_summary():
    data = request.json
    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' in request body"}), 400

    daily_entry = {"text": data["text"]} #
    # Potentially add other fields like date, author, etc. from data if needed by graph state

    config = get_thread_config() # Using default thread for now

    try:
        # The input to invoke for "add_summary_entry" node should match its expected input key.
        # In graph.py, the lambda is `lambda state, new_summary_input: ...`
        # So, the key in the invoke payload should be "new_summary_input".
        app_graph.invoke({"new_summary_input": daily_entry}, config)
        current_state = app_graph.get_state(config)
        return jsonify({
            "message": "Daily summary submitted successfully.",
            "current_summary_count": len(current_state.values.get("daily_summaries", [])) if current_state else 0
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to process daily summary: {str(e)}"}), 500

@app.route('/api/retrospective', methods=['GET']) # Changed to GET for simplicity, could be POST if params are complex
def get_retrospective():
    config = get_thread_config() # Using default thread

    try:
        # Ensure the graph state exists for the thread
        current_state = app_graph.get_state(config)
        if not current_state or not current_state.values.get("daily_summaries"):
            return jsonify({"summary": "No daily summaries available to generate a retrospective.", "details": []}), 200

        # Invoke the 'generate_retrospective_summary' node.
        # This node reads from the current state.
        # Note: The 'invoke' method on a compiled graph usually starts from the graph's entry point.
        # If 'generate_retrospective_summary' is not an entry point or reachable from one based on current state,
        # this might not work as expected without further graph structure (e.g. conditional edges).
        # A more direct way if the graph isn't set up with complex routing for this:
        # result_state = summarize_daily_entries_node(current_state.values) # Calling the node function directly

        # However, to use the compiled graph properly with state:
        # We need to ensure the graph can transition to 'generate_retrospective_summary'.
        # For simplicity, if our graph is just a collection of nodes and Flask decides which to call,
        # we might need a way to update the state after calling a specific node function.
        # The current graph definition in graph.py does not link 'add_summary_entry' to 'generate_retrospective_summary'.
        # They are treated as separate callable units.

        # Let's try to invoke the specific node via the graph, assuming it can be targeted.
        # LangGraph's `invoke` typically requires sending inputs that might trigger transitions.
        # If 'generate_retrospective_summary' is a standalone node we want to run on current state:

        # Option 1: Update graph to have an edge or entry point for summarization.
        # (This would be a change in graph.py)

        # Option 2: Call the node function directly with the current state if the graph object allows it.
        # (Not standard for `app_graph.invoke` which usually takes inputs for the *start* of the graph or a runnable.)

        # Option 3: Use `app_graph.update_state` and then `app_graph.invoke` if the node is reachable.
        # Or, more simply, if the node just needs the state, we can call the underlying node function.

        # Let's assume `summarize_daily_entries_node` (the function itself) can be called with the current state values.
        # This bypasses invoking it *through* the graph's compiled execution path for this specific call,
        # but uses the state managed by the graph's checkpointer.
        from graph import summarize_daily_entries_node # Import the function directly for this

        summary_output = summarize_daily_entries_node(current_state.values)

        # Update the state with the new summary (if the node doesn't do it implicitly via graph execution)
        # The node itself returns the new state components.
        if summary_output.get("error"):
             return jsonify({"error": summary_output["error"]}), 500

        # To persist this change back into the graph's state:
        app_graph.update_state(config, {"retrospective_summary": summary_output.get("retrospective_summary")})

        return jsonify({
            "summary": summary_output.get("retrospective_summary"),
            "source_summary_count": len(current_state.values.get("daily_summaries", []))
        }), 200

    except Exception as e:
        print(f"Error in /api/retrospective: {e}")
        return jsonify({"error": f"Failed to generate retrospective: {str(e)}"}), 500

if __name__ == '__main__':
    # Make sure to set FLASK_APP=app.py (or your filename) in your environment
    # And FLASK_DEBUG=1 for development mode
    app.run(debug=True, port=5000) # Default Flask port is 5000
