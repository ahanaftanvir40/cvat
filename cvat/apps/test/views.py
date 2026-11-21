# Copyright (C) CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

from collections import Counter

from django.db.models import Count
from django.shortcuts import get_object_or_404
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from cvat.apps.engine.models import (
    JobType,
    LabeledImage,
    LabeledShape,
    LabeledTrack,
    Task,
    ValidationMode,
)

from .serializers import LabelCountsSerializer


def count_annotations_per_label(task: Task) -> list[dict]:
    # Same job selection as TaskAnnotation in cvat/apps/dataset_manager/task.py,
    # so ground truth and consensus replica jobs are not counted twice.
    job_types = [JobType.ANNOTATION]
    if task.data and task.data.validation_mode == ValidationMode.GT_POOL:
        job_types.append(JobType.GROUND_TRUTH)

    # Skeleton points are child shapes and tracked frames live in TrackedShape,
    # so only top-level rows are counted: one per shape, track or tag.
    annotation_querysets = (
        LabeledShape.objects.filter(parent__isnull=True),
        LabeledTrack.objects.filter(parent__isnull=True),
        LabeledImage.objects.all(),
    )

    counts = Counter()
    for queryset in annotation_querysets:
        rows = (
            queryset.filter(job__segment__task=task, job__type__in=job_types)
            .values("label_id")
            .annotate(count=Count("id"))
        )
        counts.update({row["label_id"]: row["count"] for row in rows})

    return [
        {"id": label.id, "name": label.name, "count": counts[label.id]}
        for label in task.get_labels().order_by("id")
    ]


@extend_schema(tags=["test"])
class LabelCountsViewSet(viewsets.ViewSet):
    # CVAT's default PolicyEnforcer requires an iam_permission_class on every view.
    # Until task-level access is added, any authenticated user may read the counts.
    permission_classes = [IsAuthenticated]
    lookup_value_regex = r"\d+"

    @extend_schema(
        summary="Get the number of annotations per label in a task",
        parameters=[OpenApiParameter("id", OpenApiTypes.INT, OpenApiParameter.PATH)],
        responses=LabelCountsSerializer,
    )
    def retrieve(self, request, pk: str):
        task = get_object_or_404(Task, pk=pk)
        serializer = LabelCountsSerializer(
            {"task_id": task.id, "labels": count_annotations_per_label(task)}
        )
        return Response(serializer.data)
