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
    actionable_insights: str | None # Added for our new node
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
# To satisfy compilation, we need at least one entry point and path.
# 'add_summary_entry' will be our primary entry point for graph invocation.
workflow.set_entry_point("add_summary_entry")

# After adding a summary, the graph will end. The state is persisted by the checkpointer.
workflow.add_edge("add_summary_entry", END)

# 'generate_retrospective_summary' is not directly connected via an edge from 'add_summary_entry'
# in this flow because it's triggered by a separate API call in app.py.
# The Flask app loads the state and calls this node's function directly or could
# potentially invoke it if the graph was structured with it as an alternative entry point
# or reachable via conditional edges from a router node.
# For now, making 'add_summary_entry' -> END satisfies the graph compilation requirement
# for the way app_graph.invoke is used in app.py for adding summaries.

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

# Node function for generating actionable insights from a RetrospectiveSummary object
def generate_actionable_insights_node(state: GraphState, retrospective_summary_data: dict):
    """
    Generates actionable insights for a given RetrospectiveSummary object's data.
    The input `retrospective_summary_data` is expected to be a dictionary
    formatted from our `RetrospectiveSummary` model.
    """
    try:
        # Construct a detailed prompt for the LLM
        tags = retrospective_summary_data.get("tags", [])
        alerts = retrospective_summary_data.get("alerts", [])
        item_count = retrospective_summary_data.get("item_count", len(alerts))

        prompt_details = f"Retrospective Summary ID: {retrospective_summary_data.get('summary_id', 'N/A')}\n"
        prompt_details += f"Tags: {', '.join(tags)}\n"
        prompt_details += f"Total Alerts: {item_count}\n\n"
        prompt_details += "Alerts Included:\n"

        if not alerts:
            return {"actionable_insights": "No alert data provided in the summary to generate insights.", "error": None}

        for i, alert in enumerate(alerts[:5]): # Limit to first 5 alerts for brevity in prompt
            prompt_details += f"- Alert {i+1}:\n"
            prompt_details += f"  Title: {alert.get('title', 'N/A')}\n"
            prompt_details += f"  Status: {alert.get('status', 'N/A')}\n"
            prompt_details += f"  Created: {alert.get('created_date', 'N/A')}\n"
            prompt_details += f"  Noisy: {'Yes' if alert.get('is_noisy') else 'No'}\n"
            prompt_details += f"  Self-Resolved: {'Yes' if alert.get('is_self_resolved') else 'No'}\n"
            if alert.get('alert_node_analysis'):
                prompt_details += f"  Node Analysis: {alert['alert_node_analysis'].get('component', 'N/A')} - {alert['alert_node_analysis'].get('metric', 'N/A')}: {alert['alert_node_analysis'].get('value', 'N/A')}\n"
            if alert.get('graph_analysis'):
                prompt_details += f"  Graph Analysis: Impact {alert['graph_analysis'].get('impact_radius', 'N/A')}, Correlated Alerts: {len(alert['graph_analysis'].get('correlated_alerts', []))}\n"
        if item_count > 5:
            prompt_details += f"...and {item_count - 5} more alerts.\n"

        prompt = (
            "You are an AI operations assistant. Based on the following retrospective summary of alerts, "
            "provide actionable insights. Focus on potential root causes, trends, and recommendations "
            "for investigation or improvement. Be concise and clear.\n\n"
            f"{prompt_details}"
        )

        response = llm.invoke(prompt)
        insights = response.content
        return {"actionable_insights": insights, "error": None}
    except Exception as e:
        print(f"Error during actionable insights generation: {e}")
        return {"actionable_insights": "", "error": f"Failed to generate actionable insights: {str(e)}"}

# Define the graph
workflow = StateGraph(GraphState)

# Nodes
workflow.add_node("add_summary_entry", lambda state, new_summary_input: add_summary_node_direct_input(state, new_summary_input))
workflow.add_node("generate_retrospective_summary", summarize_daily_entries_node)
workflow.add_node("generate_actionable_insights", lambda state, retrospective_summary_input: generate_actionable_insights_node(state, retrospective_summary_input))


# Edges
workflow.set_entry_point("add_summary_entry")
workflow.add_edge("add_summary_entry", END)

# The 'generate_actionable_insights' node is added but not connected in the primary flow.
# It's intended to be invoked with specific input, similar to how 'generate_retrospective_summary'
# would be called by the application logic after loading state.
# To invoke it directly via graph.invoke, we might need a graph compiled with this as an entry point,
# or structure the graph input to target this node.

# For compiling a graph that can run 'generate_actionable_insights' directly:
# insights_workflow = StateGraph(GraphState)
# insights_workflow.add_node("generate_actionable_insights", lambda state, rs_input: generate_actionable_insights_node(state, rs_input))
# insights_workflow.set_entry_point("generate_actionable_insights")
# insights_workflow.add_edge("generate_actionable_insights", END)
# insights_graph = insights_workflow.compile() # This could be compiled and used in main.py

# Example of how one might invoke these if compiled:
# This assumes `app_graph` is compiled and we have a way to pass `new_summary_input`
# to the `add_summary_entry` node, perhaps by structuring the input to `invoke`.

# if __name__ == '__main__':
#     # In-memory checkpointer for local testing of stateful graph
#     from langgraph.checkpoint.memory import MemorySaver
#     memory_saver = MemorySaver()
#     app_graph = workflow.compile(checkpointer=memory_saver) # Main graph for daily summaries

    # Example for insights graph (compile separately or ensure main app handles this)
    # insights_graph_compiled = insights_workflow.compile(checkpointer=memory_saver)


#     thread_id = "test_thread_1"
#     config = {"configurable": {"thread_id": thread_id}}

#     # Add first summary
#     print(f"Current state for {thread_id}: {app_graph.get_state(config)}")
#     app_graph.invoke({"new_summary_input": {"text": "Day 1: Project planning complete."}}, config) # Corrected key
#     print(f"State after first summary for {thread_id}: {app_graph.get_state(config)}")

#     # ... (rest of the original __main__ example)

#     # Example for generating actionable insights (using the separately conceptualized insights_graph)
#     # This would typically be done in src/main.py
#     mock_retrospective_summary_for_insights = {
#         "summary_id": "summary_insight_test_001",
#         "tags": ["component:server-prod-01", "status:noisy", "type:cpu"],
#         "item_count": 3,
#         "alerts": [
#             {"title": "CPU Usage High", "status": "open", "created_date": "2023-10-01T10:00:00Z", "is_noisy": True, "is_self_resolved": False, "alert_node_analysis": {"component": "server-prod-01", "metric": "CPUUtilization", "value": 95}},
#             {"title": "CPU Usage Moderate", "status": "open", "created_date": "2023-10-01T10:05:00Z", "is_noisy": True, "is_self_resolved": False, "alert_node_analysis": {"component": "server-prod-01", "metric": "CPUUtilization", "value": 80}},
#             {"title": "CPU Usage High", "status": "closed", "created_date": "2023-09-30T10:00:00Z", "is_noisy": False, "is_self_resolved": True, "alert_node_analysis": {"component": "server-prod-02", "metric": "CPUUtilization", "value": 90}},
#         ]
#     }
    # This invocation assumes 'insights_graph_compiled' is compiled with 'generate_actionable_insights' as entry.
    # The input key must match what the lambda in `add_node` expects.
    # insights_result = insights_graph_compiled.invoke({"retrospective_summary_input": mock_retrospective_summary_for_insights}, config={"configurable": {"thread_id": "insights_thread_test"}})
    # print("\nInsights Result:")
    # print(insights_result)


# This illustrates the stateful nature with a checkpointer.
# The Flask app will need to implement similar logic for managing state per user/session.
print("Graph definition loaded with add_summary, summarize_daily, and generate_actionable_insights nodes. Ready for compilation and integration.")
