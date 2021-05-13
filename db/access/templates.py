from typing import Iterable, Dict

from sqlalchemy import func, distinct
from sqlalchemy.orm import Session

from db.schema import Template, TemplateMatches


class TemplatesDAO:
    """Data-access object for templates."""

    @staticmethod
    def query_file_counts(session: Session, templates: Iterable[Template]) -> Dict[int, int]:
        """Set file counts for the given templates."""
        template_ids = tuple({template.id for template in templates})
        query = session.query(TemplateMatches.template_id, func.count(distinct(TemplateMatches.file_id)))
        query = query.filter(TemplateMatches.template_id.in_(template_ids))
        query = query.filter(TemplateMatches.false_positive == False)  # noqa: E712
        query = query.group_by(TemplateMatches.template_id)
        return dict(query.all())
