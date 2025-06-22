import random
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Set

from src.models import AlertItem, RetrospectiveSummary

def generate_random_alert_item() -> AlertItem:
    """Generates a single mock AlertItem with random data."""
    now = datetime.utcnow()
    alert_id = str(uuid.uuid4())
    possible_titles = [
        "CPU Usage High", "Memory Threshold Exceeded", "Disk Space Low",
        "Network Latency Detected", "Application Error Rate Spike",
        "Database Connection Failed", "Security Scan Alert"
    ]
    statuses = ["open", "closed", "acknowledged"]

    title = random.choice(possible_titles)
    status = random.choice(statuses)
    # Alerts created in the last 7 days
    created_date = now - timedelta(days=random.randint(0, 7), hours=random.randint(0, 23))

    # Mock analysis data
    alert_node_analysis = {
        "component": random.choice(["server-prod-01", "db-primary", "api-gateway", "user-service"]),
        "metric": random.choice(["CPUUtilization", "MemoryUsage", "DiskReadOps", "Latency"]),
        "value": round(random.uniform(50.0, 100.0), 2)
    }
    graph_analysis = {
        "correlated_alerts": [str(uuid.uuid4()) for _ in range(random.randint(0, 3))],
        "impact_radius": random.choice(["small", "medium", "large"])
    }

    return AlertItem(
        id=alert_id,
        title=title,
        status=status,
        created_date=created_date,
        alert_node_analysis=alert_node_analysis,
        graph_analysis=graph_analysis
    )

def enrich_alert_items(alerts: List[AlertItem], noisy_threshold_count: int = 3, self_resolved_minutes: int = 10) -> List[AlertItem]:
    """
    Simulates enrichment for a list of AlertItems.
    - Marks alerts as 'noisy' if similar titles occur frequently.
    - Marks alerts as 'self_resolved' if they closed quickly after opening (mocked).
    """
    enriched_alerts = []
    title_counts: Dict[str, int] = {}

    # Sort alerts by creation date for some temporal logic
    alerts.sort(key=lambda x: x.created_date)

    for alert in alerts:
        # Noisy check (simplified: count occurrences of the same title)
        title_counts[alert.title] = title_counts.get(alert.title, 0) + 1
        if title_counts[alert.title] >= noisy_threshold_count:
            alert.is_noisy = True

        # Self-resolved check (simplified: 10% chance if status is 'closed')
        # A more realistic check would compare open and close times.
        # For now, we'll randomly mark some closed alerts as self_resolved.
        if alert.status == "closed" and random.random() < 0.25: # 25% chance for a closed alert
            # Simulate it resolved within X minutes (not strictly based on created_date vs resolved_date here)
            alert.is_self_resolved = True

        enriched_alerts.append(alert)

    return enriched_alerts

def group_alerts_into_summaries(alerts: List[AlertItem], max_alerts_per_summary: int = 10) -> List[RetrospectiveSummary]:
    """
    Groups enriched AlertItems into RetrospectiveSummary objects.
    Grouping is based on mock tags (e.g., component from node_analysis or 'noisy').
    """
    summaries: List[RetrospectiveSummary] = []
    # Group by a primary tag, e.g., 'component' or 'noisy' status

    # Potential tags: component, noisy, self_resolved, high_cpu, specific services
    grouped_by_tag: Dict[str, List[AlertItem]] = {}

    for alert in alerts:
        tags_for_alert: Set[str] = set()

        # Tag by component
        component = alert.alert_node_analysis.get("component")
        if component:
            tags_for_alert.add(f"component:{component}")

        # Tag if noisy
        if alert.is_noisy:
            tags_for_alert.add("status:noisy")

        # Tag if self-resolved
        if alert.is_self_resolved:
            tags_for_alert.add("status:self-resolved")

        # Tag by a part of the title if relevant
        if "CPU" in alert.title.upper():
            tags_for_alert.add("type:cpu")
        if "MEMORY" in alert.title.upper():
            tags_for_alert.add("type:memory")
        if "DISK" in alert.title.upper():
            tags_for_alert.add("type:disk")
        if "NETWORK" in alert.title.upper() or "LATENCY" in alert.title.upper():
            tags_for_alert.add("type:network")
        if "DATABASE" in alert.title.upper():
            tags_for_alert.add("type:database")
        if "SECURITY" in alert.title.upper():
            tags_for_alert.add("type:security")

        if not tags_for_alert:
            tags_for_alert.add("general") # Default tag if no other applies

        # For simplicity, let's use the first applicable tag as the primary grouping key
        # A more complex strategy could create summaries for intersections of tags
        primary_tag_for_grouping = sorted(list(tags_for_alert))[0]

        if primary_tag_for_grouping not in grouped_by_tag:
            grouped_by_tag[primary_tag_for_grouping] = []
        grouped_by_tag[primary_tag_for_grouping].append(alert)

    # Create summaries from these groups
    for primary_tag, alert_group in grouped_by_tag.items():
        # Collect all unique tags for this group of alerts
        all_tags_in_group: Set[str] = set()
        for alert_in_group in alert_group:
            # Re-evaluate tags for the summary context (could be broader)
            # For now, just using the primary_tag and specific alert properties
            all_tags_in_group.add(primary_tag) # The key used for grouping
            if alert_in_group.is_noisy: all_tags_in_group.add("status:noisy")
            if alert_in_group.is_self_resolved: all_tags_in_group.add("status:self-resolved")
            component = alert_in_group.alert_node_analysis.get("component")
            if component: all_tags_in_group.add(f"component:{component}")


        # Split into multiple summaries if a group is too large
        for i in range(0, len(alert_group), max_alerts_per_summary):
            chunk = alert_group[i:i + max_alerts_per_summary]
            summary_id = str(uuid.uuid4())
            # Use all tags derived for the items in this specific chunk for the summary
            chunk_tags: Set[str] = set()
            for alert_in_chunk in chunk:
                if alert_in_chunk.is_noisy: chunk_tags.add("status:noisy")
                if alert_in_chunk.is_self_resolved: chunk_tags.add("status:self-resolved")
                component = alert_in_chunk.alert_node_analysis.get("component")
                if component: chunk_tags.add(f"component:{component}")
                if "CPU" in alert_in_chunk.title.upper(): chunk_tags.add("type:cpu")
                if "MEMORY" in alert_in_chunk.title.upper(): chunk_tags.add("type:memory")
                # Add the primary tag that formed this group
                chunk_tags.add(primary_tag)


            summaries.append(
                RetrospectiveSummary(
                    summary_id=summary_id,
                    tags=chunk_tags if chunk_tags else {primary_tag}, # Ensure at least one tag
                    items=chunk
                )
            )

    return summaries

if __name__ == '__main__':
    # Generate some mock alerts
    num_alerts = 50
    mock_alerts = [generate_random_alert_item() for _ in range(num_alerts)]
    print(f"Generated {len(mock_alerts)} raw alerts.")
    for alert in mock_alerts[:3]:
        print(alert)
    print("---")

    # Enrich these alerts
    enriched_alerts = enrich_alert_items(mock_alerts, noisy_threshold_count=2, self_resolved_minutes=15)
    print(f"Enriched {len(enriched_alerts)} alerts.")
    noisy_count = sum(1 for alert in enriched_alerts if alert.is_noisy)
    self_resolved_count = sum(1 for alert in enriched_alerts if alert.is_self_resolved)
    print(f"Noisy alerts: {noisy_count}, Self-resolved alerts: {self_resolved_count}")
    for alert in enriched_alerts[:3]:
        print(alert)
    print("---")

    # Group alerts into retrospective summaries
    retrospective_summaries = group_alerts_into_summaries(enriched_alerts, max_alerts_per_summary=5)
    print(f"Generated {len(retrospective_summaries)} retrospective summaries.")
    for summary in retrospective_summaries[:3]:
        print(summary)
        # for item in summary.items:
        #     print(f"  - {item}")
    print("---")
