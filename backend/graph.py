import os
from typing import TypedDict, Annotated, Sequence
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

# Initialize LLM
llm = ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=os.getenv("GEMINI_API_KEY"))

class GraphState(TypedDict):
    daily_summaries: list[dict]
    retrospective_summary: str
    error: str | None

# Node functions
def add_daily_summary_node(state: GraphState, new_summary: dict):
    """Adds a new daily summary to the list."""
    summaries = state.get("daily_summaries", [])
    summaries.append(new_summary)
    return {"daily_summaries": summaries, "error": None}

def summarize_daily_entries_node(state: GraphState):
    """Summarizes all daily entries to generate a retrospective."""
    summaries = state.get("daily_summaries", [])
    if not summaries:
        return {"retrospective_summary": "No daily summaries to process.", "error": None}

    try:
        texts_to_summarize = "\n\n---\n\n".join([s.get("text", "") for s in summaries if s.get("text")])
        if not texts_to_summarize.strip():
            return {"retrospective_summary": "No text found in daily summaries to process.", "error": None}

        prompt = f"Please provide a concise retrospective summary of the following daily entries:\n\n{texts_to_summarize}"
        response = llm.invoke(prompt)
        return {"retrospective_summary": response.content, "error": None}
    except Exception as e:
        print(f"Error during summarization: {e}")
        return {"retrospective_summary": "", "error": f"Failed to generate summary: {str(e)}"}

# Node function for adding summary - modified to take direct input for clarity in graph.
def add_summary_node_direct_input(state: GraphState, new_summary: dict):
    """Adds a new daily summary to the list. Input is passed directly."""
    summaries = state.get("daily_summaries", [])
    summaries.append(new_summary)
    return {"daily_summaries": summaries, "error": None}


# Define the graph
workflow = StateGraph(GraphState)

# Nodes
workflow.add_node("add_summary_entry", lambda state, new_summary_input: add_summary_node_direct_input(state, new_summary_input))
workflow.add_node("generate_retrospective_summary", summarize_daily_entries_node)

# Edges
# The graph will have two main entry points that the Flask app will use:
# 1. To add a daily summary: Call 'add_summary_entry' node.
# 2. To generate a retrospective: Call 'generate_retrospective_summary' node.
# These calls will be made with appropriate state management (e.g., using thread_id for persistence).

# Setting a start and end isn't strictly necessary if Flask calls specific nodes.
# However, for a graph that can run sequentially:
# workflow.set_entry_point("add_summary_entry") # This would need an input schema
# workflow.add_edge("add_summary_entry", END) # Or to another processing step

# For our use case, the Flask app will manage the sequence:
# - Call 'add_summary_entry' with input.
# - Separately, call 'generate_retrospective_summary'.

# Compile the graph (can be done once in app.py)
# app_graph = workflow.compile()

# Example of how one might invoke these if compiled:
# This assumes `app_graph` is compiled and we have a way to pass `new_summary_input`
# to the `add_summary_entry` node, perhaps by structuring the input to `invoke`.

# if __name__ == '__main__':
#     # In-memory checkpointer for local testing of stateful graph
#     from langgraph.checkpoint.memory import MemorySaver
#     memory_saver = MemorySaver()
#     app_graph = workflow.compile(checkpointer=memory_saver)

#     thread_id = "test_thread_1"
#     config = {"configurable": {"thread_id": thread_id}}

#     # Add first summary
#     print(f"Current state for {thread_id}: {app_graph.get_state(config)}")
#     app_graph.invoke({"new_summary_input": {"text": "Day 1: Project planning complete."}}, config)
#     print(f"State after first summary for {thread_id}: {app_graph.get_state(config)}")

#     # Add second summary
#     app_graph.invoke({"new_summary_input": {"text": "Day 2: Initial coding started."}}, config)
#     print(f"State after second summary for {thread_id}: {app_graph.get_state(config)}")

#     # Add third summary to a different thread
#     thread_id_2 = "test_thread_2"
#     config_2 = {"configurable": {"thread_id": thread_id_2}}
#     app_graph.invoke({"new_summary_input": {"text": "Day 1 (Thread 2): Requirements gathering."}}, config_2)
#     print(f"State after first summary for {thread_id_2}: {app_graph.get_state(config_2)}")


#     # Generate retrospective for the first thread
#     # To do this, we'd invoke the 'generate_retrospective_summary' node.
#     # The `invoke` method on a compiled graph typically starts from the entry point.
#     # To call a specific node like 'generate_retrospective_summary', we might need to structure
#     # the graph with conditional edges or use a different invocation method if available,
#     # or the Flask app will call `graph.nodes['generate_retrospective_summary'].invoke(current_state)`.

#     # For now, let's assume the Flask app will handle getting the state and calling the node.
#     current_state_thread_1 = app_graph.get_state(config)
#     if current_state_thread_1:
#         # We need to ensure 'new_summary_input' is not required by 'summarize_daily_entries_node' if called directly
#         # The current 'summarize_daily_entries_node' only uses 'daily_summaries' from state.
#         retrospective_output = summarize_daily_entries_node(current_state_thread_1.values)
#         print(f"Retrospective for {thread_id}: {retrospective_output}")
#     else:
#         print(f"No state found for {thread_id}")

# This illustrates the stateful nature with a checkpointer.
# The Flask app will need to implement similar logic for managing state per user/session.
print("Graph definition loaded. Ready for compilation and integration with Flask.")
