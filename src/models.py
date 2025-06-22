from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Set

@dataclass
class AlertItem:
    """Represents an alert item with its attributes."""
    id: str
    title: str
    status: str  # e.g., "open", "closed", "acknowledged"
    created_date: datetime
    alert_node_analysis: dict = field(default_factory=dict)
    graph_analysis: dict = field(default_factory=dict)
    # Enrichment fields
    is_noisy: bool = False
    is_self_resolved: bool = False
    # Additional optional fields can be added here
    # e.g., severity: str, source: str, etc.

    def __str__(self):
        return f"Alert(id='{self.id}', title='{self.title}', status='{self.status}', created='{self.created_date.isoformat()}', noisy={self.is_noisy}, self_resolved={self.is_self_resolved})"

@dataclass
class RetrospectiveSummary:
    """Represents a retrospective summary of alerts grouped by tags."""
    summary_id: str
    tags: Set[str]
    items: List[AlertItem]
    generated_at: datetime = field(default_factory=datetime.utcnow)

    def __str__(self):
        item_ids = [item.id for item in self.items]
        return f"RetrospectiveSummary(id='{self.summary_id}', tags={sorted(list(self.tags))}, item_count={len(self.items)}, generated_at='{self.generated_at.isoformat()}')"

# Example of how to extend for other item types in the future, though not used for now.
# class ItemType(Enum):
#     ALERT = "alert"
#     JIRA = "jira"
#     SLACK = "slack"

# @dataclass
# class BaseItem:
#     item_id: str
#     item_type: ItemType
#     created_at: datetime = field(default_factory=datetime.utcnow)

# @dataclass
# class AlertItem(BaseItem):
#     title: str
#     status: str
#     alert_node_analysis: dict = field(default_factory=dict)
#     graph_analysis: dict = field(default_factory=dict)
#     is_noisy: bool = False
#     is_self_resolved: bool = False
#     item_type: ItemType = ItemType.ALERT

#     def __post_init__(self):
#         # Ensure item_type is always ALERT for AlertItem
#         if self.item_type != ItemType.ALERT:
#             raise ValueError("AlertItem must have item_type=ItemType.ALERT")

# # Similarly, JiraItem and SlackItem could be defined here.
# # For now, we are focusing on AlertItem as per the request.
# # The initial AlertItem above is simpler and directly usable.
# # The BaseItem approach is for more complex scenarios with many shared fields.
# # For this task, the standalone AlertItem is sufficient.
