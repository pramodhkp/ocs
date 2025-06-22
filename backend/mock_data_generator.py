import uuid
import random
from datetime import datetime, timedelta

# Mock data elements
MOCK_TITLES = [
    "High CPU Usage on Payment Gateway",
    "Database Replication Lag Exceeds Threshold",
    "API Latency Spikes Detected",
    "Failed Login Attempts Surge",
    "Disk Space Critical on Logging Server",
    "Network Connectivity Issues in EU-WEST-1",
    "Order Processing Service Unresponsive",
    "SSL Certificate Expiring Soon for *.example.com",
    "Data Synchronization Job Failed",
    "Kubernetes Pod CrashLoopBackOff in Prod"
]

MOCK_DESCRIPTIONS = [
    "CPU utilization on server X has been above 90% for the last 15 minutes.",
    "Replication lag between primary and replica DB Y is currently 30 minutes.",
    "P99 latency for /api/v1/users endpoint increased by 200ms.",
    "Observed over 1000 failed login attempts from IP Z in the last hour.",
    "Disk usage on /var/log on server A is at 98%.",
    "Packet loss detected for traffic to and from the EU-WEST-1 region.",
    "The order processing service is not responding to health checks.",
    "The SSL certificate for our main domain expires in 7 days.",
    "Nightly data sync job from CRM to DWH failed with error code 500.",
    "The user-service pod in the production K8s cluster is restarting continuously."
]

MOCK_GRAPH_ANALYSIS = [
    "LangGraph analysis indicates a potential bottleneck in the upstream service 'AuthService'.",
    "Graph points to 'DatabaseConnector' module as the root cause of timeouts.",
    "Affected area seems localized to 'CheckoutFlow', impacting 'PaymentService' and 'InventoryService'.",
    "Analysis suggests an external dependency 'GeoIPLookup' is failing.",
    "The issue appears to be cascading from 'MessageQueue' being full."
]

MOCK_NODES_AFFECTED = [
    ["payment-gateway-prod-01", "payment-gateway-prod-02"],
    ["db-primary-pg15", "db-replica-pg15-eu"],
    ["api-gw-instance-001", "api-gw-instance-002", "api-gw-instance-003"],
    ["auth-service-pod-xyz", "user-db"],
    ["log-server-01", "log-aggregator-service"],
    ["vpc-eu-west-1-nat-gw", "firewall-eu-west-1"],
    ["order-processor-svc", "downstream-fulfillment-svc"],
    ["loadbalancer-prod", "cdn-wildcard-ssl"],
    ["etl-job-runner-01", "crm-connector", "dwh-staging-db"],
    ["k8s-node-prod-05", "user-service-deployment"]
]

MOCK_TAGS = [
    "HighCPU", "Database", "Latency", "Security", "DiskSpace",
    "Network", "ServiceDown", "Certificate", "ETL", "Kubernetes",
    "Performance", "Critical", "CustomerImpact", "Infra", "Autoscaling"
]

def generate_mock_daily_summary_item():
    """Generates a single mock daily summary item."""
    timestamp = (datetime.now() - timedelta(minutes=random.randint(0, 1440))).isoformat()
    title = random.choice(MOCK_TITLES)
    # Ensure description, graph_analysis, and nodes_affected align with the chosen title if possible
    # For simplicity, we'll just pick randomly, but a real system might have more correlation
    description = random.choice(MOCK_DESCRIPTIONS)
    graph_analysis = random.choice(MOCK_GRAPH_ANALYSIS)
    nodes_affected = random.sample(random.choice(MOCK_NODES_AFFECTED) + ["generic-node-1", "generic-node-2"], k=min(random.randint(1,3), len(random.choice(MOCK_NODES_AFFECTED))+2) )
    tags = random.sample(MOCK_TAGS, k=random.randint(2, 5))

    return {
        "id": str(uuid.uuid4()),
        "timestamp": timestamp,
        "title": title,
        "description": description,
        "graph_analysis": graph_analysis,
        "nodes_affected": nodes_affected,
        "tags": tags
    }

def generate_mock_daily_summary(date_str, num_items=5):
    """Generates a full mock daily summary for a given date."""
    items = [generate_mock_daily_summary_item() for _ in range(num_items)]
    # Ensure timestamps in items roughly match the date_str for consistency
    base_date = datetime.strptime(date_str, "%Y-%m-%d")
    for item in items:
        item_dt = base_date + timedelta(hours=random.randint(0,23), minutes=random.randint(0,59))
        item["timestamp"] = item_dt.isoformat()

    return {
        "date": date_str,
        "items": items
    }

def generate_mock_retrospective_summary(daily_summaries, target_tags, start_date_str, end_date_str):
    """
    Generates a mock retrospective summary based on a list of daily summaries and target tags.
    """
    relevant_items = []
    daily_summary_ids_used = []

    for summary in daily_summaries:
        # Assuming date strings are comparable or convert them to datetime objects if needed
        # For this mock, we'll just use all provided daily_summaries that fall in range
        # In a real scenario, you'd filter daily_summaries by date more strictly.
        daily_summary_ids_used.append(summary["date"]) # Using date as ID for simplicity here
        for item in summary["items"]:
            if any(tag in item["tags"] for tag in target_tags):
                relevant_items.append(item)

    insight_summary = f"Retrospective analysis for tags: {', '.join(target_tags)}. "
    if relevant_items:
        insight_summary += f"Found {len(relevant_items)} relevant items between {start_date_str} and {end_date_str}. "
        insight_summary += "Key observations include: "
        # Simple mock insights
        observed_nodes = set()
        for item in relevant_items[:3]: # Max 3 items for brevity
            for node in item["nodes_affected"]:
                observed_nodes.add(node)
        if observed_nodes:
            insight_summary += f"Frequently affected nodes/services: {', '.join(list(observed_nodes)[:3])}. "

        common_titles_prefix = [title.split(" ")[0] for title in [item["title"] for item in relevant_items]]
        if common_titles_prefix:
            insight_summary += f"Common themes: {', '.join(list(set(common_titles_prefix))[:2])}."
    else:
        insight_summary += f"No relevant items found for these tags between {start_date_str} and {end_date_str}."

    return {
        "id": str(uuid.uuid4()),
        "startDate": start_date_str,
        "endDate": end_date_str,
        "tags": target_tags,
        "insights": insight_summary,
        "relatedDailySummaryIds": daily_summary_ids_used
        # "relevantItems": relevant_items # Optionally include full items
    }

if __name__ == "__main__":
    import json

    # Generate sample daily summaries
    mock_daily_summaries = []
    start_date = datetime.now() - timedelta(days=5)
    for i in range(5):
        current_date = (start_date + timedelta(days=i)).strftime("%Y-%m-%d")
        mock_daily_summaries.append(generate_mock_daily_summary(current_date, num_items=random.randint(3,7)))

    print("--- Mock Daily Summaries ---")
    print(json.dumps(mock_daily_summaries, indent=2))

    # Generate a sample retrospective summary
    retro_start_date = (start_date + timedelta(days=1)).strftime("%Y-%m-%d")
    retro_end_date = (start_date + timedelta(days=3)).strftime("%Y-%m-%d")

    # Select daily summaries that fall within the retrospective date range
    relevant_daily_for_retro = [
        ds for ds in mock_daily_summaries
        if retro_start_date <= ds["date"] <= retro_end_date
    ]

    if relevant_daily_for_retro:
        chosen_tags_for_retro = random.sample(MOCK_TAGS, k=random.randint(1,2))
        mock_retrospective = generate_mock_retrospective_summary(
            relevant_daily_for_retro,
            chosen_tags_for_retro,
            retro_start_date,
            retro_end_date
        )
        print("\n--- Mock Retrospective Summary ---")
        print(json.dumps(mock_retrospective, indent=2))
    else:
        print("\n--- No daily summaries in range for retrospective ---")

    # Example with specific tags
    if relevant_daily_for_retro:
        specific_tags = ["Database", "HighCPU"]
        mock_retrospective_specific = generate_mock_retrospective_summary(
            relevant_daily_for_retro,
            specific_tags,
            retro_start_date,
            retro_end_date
        )
        print("\n--- Mock Retrospective Summary (Specific Tags) ---")
        print(json.dumps(mock_retrospective_specific, indent=2))

print("Mock data generator script created.")
